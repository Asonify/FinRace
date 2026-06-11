const mongoose = require('mongoose');

const PaymentSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  borrowerId: { type: mongoose.Schema.Types.ObjectId, ref: 'Borrower', required: true },
  loanId: { type: mongoose.Schema.Types.ObjectId, ref: 'Loan', required: true },
  amount: { type: Number, required: true },
  paymentDate: { type: Date, required: true },
  paymentMethod: {
    type: String,
    enum: ['Cash', 'UPI', 'Bank Transfer', 'Other'],
    default: 'Cash'
  },
  remarks: { type: String },
  receiptNumber: { type: String, required: true }
}, { timestamps: true });

PaymentSchema.index({ userId: 1, borrowerId: 1 });
PaymentSchema.index({ userId: 1, loanId: 1 });

module.exports = mongoose.model('Payment', PaymentSchema);
