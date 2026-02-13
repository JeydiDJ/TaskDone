// Add these at the top (already present)
const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const { generateToken } = require("../utils/response");
const crypto = require("crypto");
const SibApiV3Sdk = require("sib-api-v3-sdk");

// Brevo setup
const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;
const brevo = new SibApiV3Sdk.TransactionalEmailsApi();

// ======================
// Registration
// ======================
exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const verificationToken = crypto.randomBytes(32).toString("hex");

    const newUser = new User({
      email,
      password: hashedPassword,
      emailVerificationToken: verificationToken,
      emailVerificationExpires: Date.now() + 24 * 60 * 60 * 1000, // 24 hours
      emailPending: true
    });

    await newUser.save();

    const clientUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const verificationURL = `${clientUrl}/verify-email/${verificationToken}`;

    try {
      const response = await brevo.sendTransacEmail({
        sender: { name: 'TaskDone', email: process.env.EMAIL_SENDER },
        to: [{ email: newUser.email }],
        subject: 'Verify Your Email - TaskDone',
        htmlContent: `
          <p>Hi,</p>
          <p>Please verify your email by clicking the link below:</p>
          <a href="${verificationURL}">Verify Email</a>
          <p>This link expires in 24 hours.</p>
        `,
      });

      console.log("Brevo email sent:", response);
      newUser.emailPending = false;
      await newUser.save();

    } catch (emailError) {
      console.error("Brevo email failed:", emailError);
      // Optional: delete user or leave emailPending = true
      await User.findByIdAndDelete(newUser._id);
    }

    res.status(201).json({
      success: true,
      message: "User registered successfully. Please check your email to verify your account.",
    });

  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message, success: false });
  }
};

// ======================
// Verify Email
// ======================
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }

    user.isVerified = true;
    user.emailVerificationToken = undefined;
    user.emailVerificationExpires = undefined;
    await user.save();

    res.status(200).json({ message: 'Email verified successfully!' });
  } catch (error) {
    console.error('Email verification error:', error);
    res.status(500).json({ message: error.message });
  }
};

// ======================
// Login
// ======================
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) return res.status(401).json({ message: "Invalid credentials" });

    if (!user.isVerified) {
      return res.status(401).json({ message: "Please verify your email before logging in." });
    }

    const token = generateToken(user);
    res.status(200).json({
      token,
      expiresIn: 3600,
      user: { _id: user._id, email: user.email, role: user.role },
      success: true,
      message: 'Login successful'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ======================
// Logout
// ======================
exports.logout = (req, res) => {
  res.status(200).json({ message: "User logged out" });
};

// ======================
// Get All Users
// ======================
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// ======================
// Forgot Password
// ======================
exports.forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) return res.status(404).json({ message: "User not found" });

    const resetToken = crypto.randomBytes(32).toString("hex");
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
    await user.save();

    const clientUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const resetURL = `${clientUrl}/reset-password/${resetToken}`;

    try {
      const response = await brevo.sendTransacEmail({
        sender: { name: 'TaskDone', email: process.env.EMAIL_SENDER },
        to: [{ email: user.email }],
        subject: 'Reset Your Password - TaskDone',
        htmlContent: `
          <p>Hi,</p>
          <p>You requested a password reset. Click below to reset:</p>
          <a href="${resetURL}">Reset Password</a>
          <p>This link expires in 1 hour.</p>
          <p>If you didn't request this, ignore this email.</p>
        `,
      });

      console.log("Brevo reset email sent:", response);
    } catch (emailError) {
      console.error("Brevo forgot password email failed:", emailError);
      return res.status(500).json({ message: "Failed to send reset email. Try again later." });
    }

    res.status(200).json({ message: "Password reset email sent successfully." });
  } catch (error) {
    console.error("Forgot password error:", error);
    res.status(500).json({ message: error.message });
  }
};

// ======================
// Reset Password
// ======================
exports.resetPassword = async (req, res) => {
  try {
    const { token } = req.params;
    const { password } = req.body;

    const user = await User.findOne({
      resetPasswordToken: token,
      resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) return res.status(400).json({ message: "Invalid or expired reset token." });

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;

    await user.save();

    res.status(200).json({ message: "Password has been reset successfully!" });
  } catch (error) {
    console.error("Reset password error:", error);
    res.status(500).json({ message: error.message });
  }
};
