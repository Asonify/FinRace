const mongoose = require('mongoose');

const BillingHistorySchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  stripeInvoiceId: { type: String, required: true, unique: true },
  amount: { type: Number, required: true },
  currency: { type: String, required: true },
  status: { type: String, required: true },
  invoiceDate: { type: Date, required: true }
}, { timestamps: true });

BillingHistorySchema.index({ userId: 1 });

module.exports = mongoose.model('BillingHistory', BillingHistorySchema);
