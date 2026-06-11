const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  createBorrower,
  getBorrowerList,
  getBorrowerById,
  updateBorrower,
  deleteBorrower,
  addPayment,
  updatePayment,
  deletePayment,
  getReminders,
  updateReminder,
  deleteReminder,
  exportExcel,
  exportCSV,
  exportBackup,
  restoreBackup
} = require('../controllers/udhaarController');

const { checkAndDispatchReminders } = require('../services/reminderScheduler');

const router = express.Router();

// General operations
router.post('/add', protect, createBorrower);
router.get('/', protect, getBorrowerList);

// Backup, Restore and Exports (Must place BEFORE /:id to prevent route clash)
router.get('/export/excel', protect, exportExcel);
router.get('/export/csv', protect, exportCSV);
router.get('/backup', protect, exportBackup);
router.post('/restore', protect, restoreBackup);
router.get('/dev/trigger-reminders', async (req, res, next) => {
  // Allow local development calls from localhost/127.0.0.1
  const isLocal = req.hostname === 'localhost' || req.hostname === '127.0.0.1';
  if (isLocal) {
    return next();
  }
  // Allow Vercel Cron native calls
  if (req.headers['x-vercel-cron'] === '1') {
    return next();
  }
  // Allow secure CRON_SECRET token authorization
  if (process.env.CRON_SECRET && req.headers.authorization === `Bearer ${process.env.CRON_SECRET}`) {
    return next();
  }
  // Fall back to standard logged-in user protection middleware
  return protect(req, res, next);
}, async (req, res) => {
  try {
    await checkAndDispatchReminders();
    res.json({ message: 'Reminders check triggered successfully' });
  } catch (error) {
    res.status(500).json({ message: 'Failed to trigger reminders', error: error.message });
  }
});

// Reminders
router.get('/reminders', protect, getReminders);
router.put('/reminders/:reminderId', protect, updateReminder);
router.delete('/reminders/:reminderId', protect, deleteReminder);

// ID-specific operations
router.get('/:id', protect, getBorrowerById);
router.put('/:id', protect, updateBorrower);
router.delete('/:id', protect, deleteBorrower);

// Payment endpoints
router.post('/payments', protect, addPayment);
router.put('/payments/:paymentId', protect, updatePayment);
router.delete('/payments/:paymentId', protect, deletePayment);

module.exports = router;
