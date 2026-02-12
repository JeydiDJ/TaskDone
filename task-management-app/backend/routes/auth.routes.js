const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// Registration
router.post('/register', authController.register);

// Login
router.post('/login', authController.login);

// Logout
router.post('/logout', authController.logout);

// Get all users
router.get('/users', authController.getUsers);

// Forgot password
router.post('/forgot-password', authController.forgotPassword);

// Reset password
router.post('/reset-password/:token', authController.resetPassword);

// NEW: Verify email
router.get('/verify-email/:token', authController.verifyEmail);

module.exports = router;
