const mongoose = require('mongoose');

const UsageSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  insightsUsed: { type: Number, default: 0 },
  billScansUsed: { type: Number, default: 0 },
  currentMonth: { type: String, required: true }, // formatted as YYYY-MM
}, { timestamps: true });

UsageSchema.index({ userId: 1, currentMonth: 1 }, { unique: true });

module.exports = mongoose.model('Usage', UsageSchema);
