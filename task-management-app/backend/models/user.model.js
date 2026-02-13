const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  password: {
    type: String,
    required: true,
  },

  // Email verification
  isVerified: {
    type: Boolean,
    default: false,
  },
  emailVerificationToken: String,
  emailVerificationExpires: Date,
  emailPending: {
    type: Boolean,
    default: false
  },

  // Forgot password
  resetPasswordToken: String,
  resetPasswordExpires: Date,

}, {
  timestamps: true,
});

const User = mongoose.model("User", userSchema);

module.exports = User;
