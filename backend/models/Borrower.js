const mongoose = require('mongoose');

const BorrowerSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  fullName: { type: String, required: true },
  phone: { type: String, required: true },
  email: { type: String },
  address: { type: String },
  city: { type: String },
  state: { type: String },
  pincode: { type: String },
  occupation: { type: String },
  profilePhoto: { type: String }, // base64 string
  notes: { type: String }
}, { timestamps: true });

BorrowerSchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model('Borrower', BorrowerSchema);
