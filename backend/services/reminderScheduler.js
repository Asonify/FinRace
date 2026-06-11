const cron = require('node-cron');
const Reminder = require('../models/Reminder');
const Borrower = require('../models/Borrower');
const Loan = require('../models/Loan');
const { sendReminderEmail } = require('./emailService');

/**
 * Checks database for unsent reminders that have reached their target dates,
 * verifies they belong to active unpaid loans, and sends notifications.
 */
const checkAndDispatchReminders = async () => {
  console.log('[SCHEDULER] Running check for outstanding due-date milestones...');
  try {
    const today = new Date();
    // Fetch all unsent reminders where target date is today or in the past
    const pendingReminders = await Reminder.find({
      reminderDate: { $lte: today },
      notificationSent: false
    });

    console.log(`[SCHEDULER] Found ${pendingReminders.length} unsent reminders to process.`);

    for (const reminder of pendingReminders) {
      const borrower = await Borrower.findById(reminder.borrowerId);
      if (!borrower) {
        // Borrower no longer exists; mark reminder as sent to clean up queue
        reminder.notificationSent = true;
        await reminder.save();
        continue;
      }

      // Check if there is an active (unpaid) loan for this borrower
      const activeLoan = await Loan.findOne({
        borrowerId: borrower._id,
        userId: reminder.userId,
        status: { $ne: 'Paid' }
      });

      if (!activeLoan) {
        // Loan is already paid or settled; mark reminder inactive
        reminder.notificationSent = true;
        await reminder.save();
        console.log(`[SCHEDULER] Loan settled or not found for borrower ${borrower.fullName}. Marking reminder as deactivated.`);
        continue;
      }

      // Send email notification
      const success = await sendReminderEmail(borrower, activeLoan, reminder.reminderType);
      
      if (success) {
        // Update database reminder flag
        reminder.notificationSent = true;
        await reminder.save();

        // Register action inside Loan audit log trail
        const cleanTypeLabel = reminder.reminderType.replace(/_/g, ' ');
        activeLoan.auditLog.push({
          action: 'Reminder Dispatched',
          details: `Automated email alert (${cleanTypeLabel}) dispatched to ${borrower.fullName} <${borrower.email || 'no-email'}>.`
        });
        await activeLoan.save();
        
        console.log(`[SCHEDULER] Reminder of type [${reminder.reminderType}] logged and sent for borrower ${borrower.fullName}.`);
      }
    }
  } catch (error) {
    console.error('[SCHEDULER ERROR] Failed during due-date reminders processing:', error);
  }
  console.log('[SCHEDULER] Finished checking outstanding due-date milestones.');
};

// Register cron job scheduler (Daily at 09:00 AM)
cron.schedule('0 9 * * *', () => {
  console.log('[CRON TRIGGER] Dispatching daily reminders check...');
  checkAndDispatchReminders();
});

module.exports = {
  checkAndDispatchReminders
};
