const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const {
  createCheckoutSession,
  createPortalSession,
  handleWebhook,
  handleMockSuccess
} = require('../controllers/stripeController');

// Stripe APIs
router.post('/create-checkout-session', protect, createCheckoutSession);
router.post('/create-portal-session', protect, createPortalSession);
router.post('/mock-success', protect, handleMockSuccess);

// Stripe raw Webhook (raw middleware must be attached at server.js level)
router.post('/webhook', handleWebhook);

module.exports = router;
