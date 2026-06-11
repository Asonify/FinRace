const User = require('../models/User');
const Usage = require('../models/Usage');
const BillingHistory = require('../models/BillingHistory');
const moment = require('moment');

const PLAN_LIMITS = {
  'Free': { insights: 3, billScans: 5 },
  'Basic': { insights: 15, billScans: 20 },
  'Pro': { insights: 25, billScans: 30 },
  'Premium': { insights: 35, billScans: 40 }
};

// Retrieve user current plan detail, limits, usage metrics and billing logs
exports.getCurrentPlan = async (req, res) => {
  const userId = req.user.id;

  try {
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: 'User not found' });

    const currentMonth = moment().format('YYYY-MM');

    // Get or initialize monthly usage tracking
    let usage = await Usage.findOne({ userId: user._id, currentMonth });
    if (!usage) {
      usage = new Usage({
        userId: user._id,
        currentMonth,
        insightsUsed: 0,
        billScansUsed: 0
      });
      await usage.save();
    }

    const limits = PLAN_LIMITS[user.subscriptionPlan || 'Free'];

    // Fetch billing history logs
    const billingHistory = await BillingHistory.find({ userId: user._id }).sort({ invoiceDate: -1 });

    res.json({
      plan: user.subscriptionPlan || 'Free',
      status: user.subscriptionStatus || 'inactive',
      currentPeriodEnd: user.currentPeriodEnd,
      insightsUsed: usage.insightsUsed,
      insightsLimit: limits.insights,
      billScansUsed: usage.billScansUsed,
      billScansLimit: limits.billScans,
      billingHistory
    });
  } catch (err) {
    console.error('Fetch Current Plan Error:', err);
    res.status(500).json({ message: 'Server error', error: err.message });
  }
};
