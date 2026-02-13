const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const { generateToken } = require("../utils/response");
const crypto = require("crypto");
const SibApiV3Sdk = require("sib-api-v3-sdk");

const client = SibApiV3Sdk.ApiClient.instance;
const apiKey = client.authentications['api-key'];
apiKey.apiKey = process.env.BREVO_API_KEY;

const brevo = new SibApiV3Sdk.TransactionalEmailsApi();

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
      emailPending: true // optional field to track email status
    });

    await newUser.save();

    const clientUrl = process.env.FRONTEND_URL || 'http://localhost:4200';
    const verificationURL = `${clientUrl}/verify-email/${verificationToken}`;

    try {
      // Send verification email via Brevo API
      await brevo.sendTransacEmail({
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

      // Mark email as sent
      newUser.emailPending = false;
      await newUser.save();

    } catch (emailError) {
      console.error("Brevo email failed:", emailError);
      // Optional: delete the user if email fails
      await User.findByIdAndDelete(newUser._id);

      // Or leave user with emailPending = true to retry later
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



// Verify email
exports.verifyEmail = async (req, res) => {
  try {
    const { token } = req.params;

    // Find user with matching verification token and check if not expired
    const user = await User.findOne({
      emailVerificationToken: token,
      emailVerificationExpires: { $gt: Date.now() } // token not expired
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired verification token.' });
    }

    // Mark user as verified
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


// User login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
      return res.status(401).json({ message: "Invalid credentials" });
    }

    // NEW: Block login if email not verified
    if (!user.isVerified) {
      return res.status(401).json({
        message: "Please verify your email before logging in."
      });
    }

    const token = generateToken(user);

    res.status(200).json({
      token,
      expiresIn: 3600,
      user: {
        _id: user._id,
        email: user.email,
        role: user.role
      },
      success: true,
      message: 'Login successful'
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};


// User logout
exports.logout = (req, res) => {
  res.status(200).json({ message: "User logged out" });
};

// Get all users
exports.getUsers = async (req, res) => {
  try {
    const users = await User.find();
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Forgot password
exports.forgotPassword = async (req, res) => {
  try {
    // Implementation...
  } catch (error) {
    // Error handling...
  }
};

// Reset password
exports.resetPassword = async (req, res) => {
  try {
    // Implementation...
  } catch (error) {
    // Error handling...
  }
};
