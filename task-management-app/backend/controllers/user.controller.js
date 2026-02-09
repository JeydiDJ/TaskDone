const User = require("../models/user.model");
const { successResponse, errorResponse } = require("../utils/response");

exports.getUsers = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const users = await User.find().select("-password").skip(skip).limit(limit);
    // Get total count of all users for pagination
    const totalUsers = await User.countDocuments();

    return successResponse(res, 200, "Users retrieved successfully", {
      users,
      totalUsers,
      totalPages: Math.ceil(totalUsers / limit),
      currentPage: page,
    });
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};





// Get current user's profile
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select('-password');

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    // Build profile response with basic user information
    const profile = {
      _id: user._id,
      email: user.email,
      createdAt: user.createdAt,
    };

    return successResponse(res, 200, "Profile retrieved successfully", profile);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

exports.getUser = async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      return errorResponse(res, 404, "User not found");
    }
    return successResponse(res, 200, "User retrieved successfully", user);
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

exports.updateUser = async (req, res) => {
  try {
    const { id } = req.params;
    const { email } = req.body;

    // Check if the user exists
    const user = await User.findById(id);

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    // Users can only update their own details
    if (req.user._id.toString() !== id) {
      return errorResponse(res, 403, "Not authorized to update this user");
    }

    // Prepare update object
    const updateData = {};

    if (email) {
      updateData.email = email;
    }

    // Update the user
    const updatedUser = await User.findByIdAndUpdate(
      id,
      updateData,
      { new: true, runValidators: true }
    ).select('-password');

    return successResponse(res, 200, "User updated successfully", updatedUser);
  } catch (error) {
    // Handle duplicate email error
    if (error.code === 11000) {
      return errorResponse(res, 400, "Email already exists");
    }
    return errorResponse(res, 500, error.message);
  }
};

exports.deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Check if the user exists
    const user = await User.findById(id);

    if (!user) {
      return errorResponse(res, 404, "User not found");
    }

    // Users can only delete their own account
    if (id !== req.user._id.toString()) {
      return errorResponse(res, 403, "Not authorized to delete this user");
    }

    // Delete the user
    await User.findByIdAndDelete(id);

    return successResponse(res, 200, "User deleted successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};

exports.deleteAccount = async (req, res) => {
  try {
    const userId = req.user._id;

    // Delete the user
    await User.findByIdAndDelete(userId);

    return successResponse(res, 200, "Account deleted successfully");
  } catch (error) {
    return errorResponse(res, 500, error.message);
  }
};
