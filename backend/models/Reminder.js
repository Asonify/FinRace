const mongoose = require('mongoose');

const ReminderSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Borrower', required: true },
  reminderDate: { type: Date, required: true },
  reminderType: {
    type: String,
    enum: ['7_days_before', '3_days_before', 'on_due_date', 'overdue'],
    required: true
  },
  notificationSent: { type: Boolean, default: false }
}, { timestamps: true });

ReminderSchema.index({ userId: 1, borrowerId: 1 });
ReminderSchema.index({ userId: 1, reminderDate: 1 });

module.exports = mongoose.model('Reminder', ReminderSchema);
