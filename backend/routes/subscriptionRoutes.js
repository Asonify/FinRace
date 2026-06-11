const express = require('express');
const router = express.Router();
const { protect } = require('../middleware/authMiddleware');
const { getCurrentPlan } = require('../controllers/subscriptionController');

// Subscription plan profile information
router.get('/current-plan', protect, getCurrentPlan);

module.exports = router;
