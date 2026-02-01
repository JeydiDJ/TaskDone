const bcrypt = require("bcryptjs");
const User = require("../models/user.model");
const { generateToken, successResponse, errorResponse } = require("../utils/response");
const crypto = require("crypto");

/**
 * @swagger
 * components:
 *   schemas:
 *     AuthResponse:
 *       type: object
 *       properties:
 *         token:
 *           type: string
 *           description: JWT authentication token
 *         expiresIn:
 *           type: integer
 *           description: Token expiration in seconds
 *         user:
 *           type: object
 *           properties:
 *             _id:
 *               type: string
 *               description: User ID
 *             email:
 *               type: string
 *               description: User email
 *             role:
 *               type: string
 *               description: User role
 *         success:
 *           type: boolean
 *           description: Success status
 *         message:
 *           type: string
 *           description: Response message
 */

// Register a new user
exports.register = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Validate role
    let userRole = (role === 'admin' || role === 'super') ? role : 'user';

    const hashedPassword = await bcrypt.hash(password, 10);
    const newUser = new User({
      email,
      password: hashedPassword,
      role: userRole
    });
    await newUser.save();
    const token = generateToken(newUser);

    res
      .status(201)
      .json({
        token,
        expiresIn: 3600,
        user: {
          _id: newUser._id,
          email: newUser.email,
          role: newUser.role
        },
        success: true,
        message: 'User registered successfully'
      });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ message: error.message, success: false });
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
