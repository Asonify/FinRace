const mongoose = require('mongoose');

const AuditLogSchema = new mongoose.Schema({
  action: { type: String, required: true },
  timestamp: { type: Date, default: Date.now },
  details: { type: String }
});

const DocumentSchema = new mongoose.Schema({
  name: { type: String, required: true },
  url: { type: String, required: true } // base64 URL
});

const LoanSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Borrower', required: true },
  amountGiven: { type: Number, required: true },
  amountPaid: { type: Number, default: 0 },
  remainingBalance: { type: Number, required: true },
  purpose: { type: String },
  interestRate: { type: Number },
  dateGiven: { type: Date, required: true },
  dueDate: { type: Date, required: true },
  paymentFrequency: {
    type: String,
    enum: ['One Time', 'Weekly', 'Monthly'],
    default: 'One Time'
  },
  status: {
    type: String,
    enum: ['Pending', 'Partially Paid', 'Paid', 'Overdue'],
    default: 'Pending'
  },
  documents: [DocumentSchema],
  auditLog: [AuditLogSchema]
}, { timestamps: true });

LoanSchema.index({ userId: 1, borrowerId: 1 });
LoanSchema.index({ userId: 1, dueDate: 1 });

module.exports = mongoose.model('Loan', LoanSchema);
