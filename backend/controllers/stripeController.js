const User = require('../models/User');
const Usage = require('../models/Usage');
const BillingHistory = require('../models/BillingHistory');
const moment = require('moment');

const isMockMode = !process.env.STRIPE_SECRET_KEY || process.env.STRIPE_SECRET_KEY === 'your-stripe-secret-key';
const stripe = !isMockMode ? require('stripe')(process.env.STRIPE_SECRET_KEY) : null;

// Initiate Stripe Checkout
exports.createCheckoutSession = async (req, res) => {
  const userId = req.user.id;
  const { planName } = req.body;

  if (!['Basic', 'Pro', 'Premium'].includes(planName)) {
    return res.status(400).json({ message: 'Invalid subscription plan' });
  }

  const prices = {
    'Basic': 100,
    'Pro': 250,
    'Premium': 450
  };

  const planPrice = prices[planName];

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (isMockMode) {
      const mockUrl = `${process.env.CLIENT_URL || 'http://localhost:5173'}/subscription?mock_checkout_success=true&plan=${planName}`;
      return res.json({ id: 'mock_session_' + Date.now(), url: mockUrl });
    }

    // Real Stripe Session Creation with inline pricing
    let stripeCustomerId = user.stripeCustomerId;
    if (!stripeCustomerId) {
      const customer = await stripe.customers.create({
        email: user.email,
        name: user.fullName
      });
      stripeCustomerId = customer.id;
      user.stripeCustomerId = stripeCustomerId;
      await user.save();
    }

    const session = await stripe.checkout.sessions.create({
      customer: stripeCustomerId,
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'inr',
          product_data: {
            name: `${planName} Plan`,
            description: `FinRace Wealth Tracker ${planName} Subscription`,
          },
          unit_amount: planPrice * 100, // in paise
          recurring: {
            interval: 'month',
          },
        },
        quantity: 1,
      }],
      mode: 'subscription',
      success_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/subscription?session_id={CHECKOUT_SESSION_ID}&success=true`,
      cancel_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/subscription?cancel=true`,
      metadata: {
        userId: user._id.toString(),
        planName
      },
      subscription_data: {
        metadata: {
          userId: user._id.toString(),
          planName
        }
      }
    });

    res.json({ id: session.id, url: session.url });
  } catch (err) {
    console.error('Stripe Checkout Error:', err);
    res.status(500).json({ message: 'Failed to initiate checkout', error: err.message });
  }
};

// Create customer billing portal link
exports.createPortalSession = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    if (isMockMode) {
      return res.json({ url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/subscription` });
    }

    if (!user.stripeCustomerId) {
      return res.status(400).json({ message: 'No active billing customer record' });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: user.stripeCustomerId,
      return_url: `${process.env.CLIENT_URL || 'http://localhost:5173'}/subscription`,
    });

    res.json({ url: session.url });
  } catch (err) {
    console.error('Billing Portal Error:', err);
    res.status(500).json({ message: 'Failed to open billing portal', error: err.message });
  }
};

// Handle Stripe webhooks
exports.handleWebhook = async (req, res) => {
  if (isMockMode) {
    return res.status(400).json({ message: 'Webhook is disabled in mock mode' });
  }

  const sig = req.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;

  let event;
  try {
    event = stripe.webhooks.constructEvent(req.body, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object;
        const planName = session.metadata?.planName || 'Free';
        const user = await User.findOne({ stripeCustomerId: session.customer });
        if (user) {
          user.subscriptionPlan = planName;
          user.subscriptionStatus = 'active';
          await user.save();
        }
        break;
      }
      case 'customer.subscription.created':
      case 'customer.subscription.updated': {
        const subscription = event.data.object;
        const user = await User.findOne({ stripeCustomerId: subscription.customer });
        if (user) {
          const planName = subscription.metadata?.planName || subscription.plan?.metadata?.planName || user.subscriptionPlan;
          user.subscriptionPlan = planName;
          user.subscriptionStatus = subscription.status;
          user.currentPeriodEnd = new Date(subscription.current_period_end * 1000);
          await user.save();
        }
        break;
      }
      case 'customer.subscription.deleted': {
        const subscription = event.data.object;
        const user = await User.findOne({ stripeCustomerId: subscription.customer });
        if (user) {
          user.subscriptionPlan = 'Free';
          user.subscriptionStatus = 'canceled';
          user.currentPeriodEnd = null;
          await user.save();
        }
        break;
      }
      case 'invoice.payment_succeeded': {
        const invoice = event.data.object;
        const user = await User.findOne({ stripeCustomerId: invoice.customer });
        if (user) {
          await BillingHistory.findOneAndUpdate(
            { stripeInvoiceId: invoice.id },
            {
              userId: user._id,
              stripeInvoiceId: invoice.id,
              amount: invoice.amount_paid / 100,
              currency: invoice.currency,
              status: 'paid',
              invoiceDate: new Date(invoice.created * 1000)
            },
            { upsert: true }
          );

          // Reset monthly usage quota counts
          const currentMonth = moment(invoice.created * 1000).format('YYYY-MM');
          await Usage.findOneAndUpdate(
            { userId: user._id, currentMonth },
            { $set: { insightsUsed: 0, billScansUsed: 0 } },
            { upsert: true }
          );
        }
        break;
      }
      case 'invoice.payment_failed': {
        const invoice = event.data.object;
        const user = await User.findOne({ stripeCustomerId: invoice.customer });
        if (user) {
          await BillingHistory.findOneAndUpdate(
            { stripeInvoiceId: invoice.id },
            {
              userId: user._id,
              stripeInvoiceId: invoice.id,
              amount: invoice.amount_due / 100,
              currency: invoice.currency,
              status: 'failed',
              invoiceDate: new Date(invoice.created * 1000)
            },
            { upsert: true }
          );

          user.subscriptionStatus = 'past_due';
          await user.save();
        }
        break;
      }
      default:
        console.log(`Unhandled Stripe event type: ${event.type}`);
    }
    res.json({ received: true });
  } catch (err) {
    console.error('Error handling webhook event:', err);
    res.status(500).json({ message: 'Webhook event processing error', error: err.message });
  }
};

// Handle Mock activations in offline mode
exports.handleMockSuccess = async (req, res) => {
  const userId = req.user.id;
  const { planName } = req.body;

  if (!['Free', 'Basic', 'Pro', 'Premium'].includes(planName)) {
    return res.status(400).json({ message: 'Invalid plan name' });
  }

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    user.subscriptionPlan = planName;
    user.subscriptionStatus = planName === 'Free' ? 'inactive' : 'active';
    user.currentPeriodEnd = planName === 'Free' ? null : new Date(Date.now() + 30 * 24 * 60 * 60 * 1000);
    await user.save();

    // Reset/create usage
    const currentMonth = moment().format('YYYY-MM');
    await Usage.findOneAndUpdate(
      { userId: user._id, currentMonth },
      { $set: { insightsUsed: 0, billScansUsed: 0 } },
      { upsert: true }
    );

    if (planName !== 'Free') {
      const prices = { 'Basic': 100, 'Pro': 250, 'Premium': 450 };
      await BillingHistory.create({
        userId: user._id,
        stripeInvoiceId: 'mock_inv_' + Date.now() + Math.floor(Math.random() * 1000),
        amount: prices[planName],
        currency: 'inr',
        status: 'paid',
        invoiceDate: new Date()
      });
    }

    res.json({ message: `Mock subscription plan ${planName} successfully activated`, user });
  } catch (err) {
    console.error('Mock Activation Error:', err);
    res.status(500).json({ message: 'Mock activation failed', error: err.message });
  }
};
