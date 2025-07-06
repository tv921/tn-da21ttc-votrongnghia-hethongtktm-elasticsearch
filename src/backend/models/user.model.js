const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: String,
  avatarUrl: String,
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'user'],
    default: 'user'
  },
  isActive: { type: Boolean, default: true },
  otpCode: { type: String },
  otpExpires: { type: Date },
  verified: { type: Boolean, default: false }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
