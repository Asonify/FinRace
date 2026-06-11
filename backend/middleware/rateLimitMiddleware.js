const User = require('../models/User');
const Usage = require('../models/Usage');
const moment = require('moment');

const PLAN_LIMITS = {
    'Free': { insights: 3, billScans: 5 },
    'Basic': { insights: 15, billScans: 20 },
    'Pro': { insights: 25, billScans: 30 },
    'Premium': { insights: 35, billScans: 40 }
};

// Helper to get or initialize usage stats for current month
const getOrCreateUsage = async (userId) => {
    const currentMonth = moment().format('YYYY-MM');
    let usage = await Usage.findOne({ userId, currentMonth });
    if (!usage) {
        usage = new Usage({ userId, currentMonth, insightsUsed: 0, billScansUsed: 0 });
        await usage.save();
    }
    return usage;
};

// Middleware to check AI Insights rate limit
exports.checkInsightsLimit = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const plan = user.subscriptionPlan || 'Free';
        const limits = PLAN_LIMITS[plan];
        const usage = await getOrCreateUsage(userId);

        if (usage.insightsUsed >= limits.insights) {
            return res.status(403).json({
                message: `Monthly AI insights limit reached for your ${plan} plan. Limit: ${limits.insights} insights/month.`,
                limit: limits.insights,
                used: usage.insightsUsed,
                upgradeRequired: true
            });
        }

        // Increment count
        usage.insightsUsed += 1;
        await usage.save();

        req.aiUsageInfo = {
            used: usage.insightsUsed,
            limit: limits.insights,
            remaining: limits.insights - usage.insightsUsed
        };

        next();
    } catch (error) {
        console.error('Insights limit check error:', error);
        res.status(500).json({ message: 'Error checking rate limit' });
    }
};

// Middleware to check Bill Scan rate limit
exports.checkBillScanLimit = async (req, res, next) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const plan = user.subscriptionPlan || 'Free';
        const limits = PLAN_LIMITS[plan];
        const usage = await getOrCreateUsage(userId);

        if (usage.billScansUsed >= limits.billScans) {
            return res.status(403).json({
                message: `Monthly bill scan limit reached for your ${plan} plan. Limit: ${limits.billScans} scans/month.`,
                limit: limits.billScans,
                used: usage.billScansUsed,
                upgradeRequired: true
            });
        }

        // Increment count
        usage.billScansUsed += 1;
        await usage.save();

        req.aiUsageInfo = {
            used: usage.billScansUsed,
            limit: limits.billScans,
            remaining: limits.billScans - usage.billScansUsed
        };

        next();
    } catch (error) {
        console.error('Bill scan limit check error:', error);
        res.status(500).json({ message: 'Error checking rate limit' });
    }
};

// Get current usage stats
exports.getUsageStats = async (req, res) => {
    try {
        const userId = req.user.id;
        const user = await User.findById(userId);

        if (!user) {
            return res.status(404).json({ message: 'User not found' });
        }

        const plan = user.subscriptionPlan || 'Free';
        const limits = PLAN_LIMITS[plan];
        const usage = await getOrCreateUsage(userId);

        res.json({
            insights: {
                used: usage.insightsUsed,
                limit: limits.insights,
                remaining: Math.max(0, limits.insights - usage.insightsUsed)
            },
            billScans: {
                used: usage.billScansUsed,
                limit: limits.billScans,
                remaining: Math.max(0, limits.billScans - usage.billScansUsed)
            }
        });
    } catch (error) {
        console.error('Get usage stats error:', error);
        res.status(500).json({ message: 'Error fetching usage stats' });
    }
};
