const Task = require("../models/task.model");
const User = require("../models/user.model");
const { successResponse, errorResponse } = require("../utils/response");

// Create a new task
exports.createTask = async (req, res) => {
  try {
    const { title, description, startDate, deadline, priority } = req.body;
    const userId = req.user._id; // Use the authenticated user

    // Validate required fields
    if (!title || !description || !deadline || !priority) {
      return errorResponse(res, 400, "All fields are required: title, description, deadline, priority");
    }

    // Validate priority
    if (!['Low', 'Medium', 'High'].includes(priority)) {
      return errorResponse(res, 400, "Priority must be Low, Medium, or High");
    }

    const newTask = new Task({
      title,
      description,
      startDate: startDate ? new Date(startDate) : undefined,
      deadline: new Date(deadline),
      priority,
      user: userId
    });
    await newTask.save();
    successResponse(res, 201, "Task created successfully");
  } catch (error) {
    console.error('Error creating task:', error);
    if (error.name === 'ValidationError') {
      return errorResponse(res, 400, error.message);
    }
    errorResponse(res, 500, "An error occurred while creating the task. Please try again.");
  }
};

// Get all tasks for the authenticated user
exports.getAllTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tasks = await Task.find({ user: req.user._id })
      .skip(skip)
      .limit(limit);
    const totalTasks = await Task.countDocuments({ user: req.user._id });

    successResponse(res, 200, "Tasks retrieved successfully", {
      tasks,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limit),
      currentPage: page,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get ongoing tasks for the authenticated user
exports.getOngoingTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 100;
    const skip = (page - 1) * limit;
    const now = new Date();

    const tasks = await Task.find({
      user: req.user._id,
      completed: false,
      deadline: { $gte: now } // Only tasks that are not overdue
    })
      .skip(skip)
      .limit(limit);

    const totalTasks = await Task.countDocuments({
      user: req.user._id,
      completed: false,
      deadline: { $gte: now } // Only tasks that are not overdue
    });

    successResponse(res, 200, "Ongoing tasks retrieved successfully", {
      tasks,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limit),
      currentPage: page,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get completed tasks for the authenticated user
exports.getCompletedTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tasks = await Task.find({
      user: req.user._id,
      completed: true
    })
      .sort({ updatedAt: -1 })  // Sort by most recently updated first
      .skip(skip)
      .limit(limit);

    const totalTasks = await Task.countDocuments({
      user: req.user._id,
      completed: true
    });

    successResponse(res, 200, "Completed tasks retrieved successfully", {
      tasks,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limit),
      currentPage: page,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get unfinished tasks for the authenticated user (ongoing tasks past deadline)
exports.getUnfinishedTasks = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    const now = new Date();

    const tasks = await Task.find({
      user: req.user._id,
      completed: false,
      deadline: { $lt: now }
    })
      .sort({ deadline: 1 })  // Sort by earliest deadline first
      .skip(skip)
      .limit(limit);

    const totalTasks = await Task.countDocuments({
      user: req.user._id,
      completed: false,
      deadline: { $lt: now }
    });

    successResponse(res, 200, "Unfinished tasks retrieved successfully", {
      tasks,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limit),
      currentPage: page,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get all tasks for a user
exports.getAllTasksForUser = async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;

    const tasks = await Task.find({ user: req.user._id })
      .skip(skip)
      .limit(limit);
    const totalTasks = await Task.countDocuments({ user: req.user._id });

    successResponse(res, 200, "Tasks retrieved successfully", {
      tasks,
      totalTasks,
      totalPages: Math.ceil(totalTasks / limit),
      currentPage: page,
    });
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get a single task by ID
exports.getTaskById = async (req, res) => {
  try {
    const task = await Task.findOne({ _id: req.params.id }).populate(
      "user",
      "-password"
    );
    if (!task) {
      return errorResponse(res, 404, "Task not found");
    }
    successResponse(res, 200, "Task retrieved successfully", task);
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Update a task
exports.updateTask = async (req, res) => {
  try {
    const { id } = req.params;
    
    // Find the task first to ensure it exists
    const task = await Task.findById(id);
    
    if (!task) {
      return res.status(404).json({
        status: 'error',
        message: 'Task not found'
      });
    }
    
    // Update with the data from the request
    const updatedTask = await Task.findByIdAndUpdate(
      id, 
      req.body,
      { new: true } // Return the updated document
    ).populate('user', 'email'); // Populate user info
    
    return res.status(200).json({
      status: 'success',
      message: 'Task updated successfully',
      data: updatedTask
    });
  } catch (error) {
    return res.status(500).json({
      status: 'error',
      message: error.message
    });
  }
};

// Delete a task
exports.deleteTask = async (req, res) => {
  try {
    const { id } = req.params;

    // Find the task first to ensure it exists
    const task = await Task.findById(id);

    if (!task) {
      return errorResponse(res, 404, "Task not found");
    }

    // Check if the user is authorized to delete this task
    // Only allow task creator to delete
    if (task.user.toString() !== req.user._id.toString()) {
      return errorResponse(res, 403, "Not authorized to delete this task");
    }

    // Delete the task
    await Task.findByIdAndDelete(id);

    successResponse(res, 200, "Task deleted successfully");
  } catch (error) {
    errorResponse(res, 500, error.message);
  }
};

// Get progress statistics for the authenticated user
exports.getProgressStats = async (req, res) => {
  try {
    const userId = req.user._id;

    // Count completed tasks
    const completedTasks = await Task.countDocuments({
      user: userId,
      completed: true
    });

    // Count pending tasks (ongoing + unfinished)
    const ongoingTasks = await Task.countDocuments({
      user: userId,
      completed: false,
      deadline: { $gte: new Date() } // Not overdue
    });

    const unfinishedTasks = await Task.countDocuments({
      user: userId,
      completed: false,
      deadline: { $lt: new Date() } // Overdue
    });

    const pendingTasks = ongoingTasks + unfinishedTasks;

    // Calculate overall progress percentage
    const totalTasks = completedTasks + pendingTasks;
    const overallProgress = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

    successResponse(res, 200, "Progress statistics retrieved successfully", {
      completedTasks,
      pendingTasks,
      overallProgress
    });
  } catch (error) {
    console.error('Error getting progress stats:', error);
    errorResponse(res, 500, "An error occurred while retrieving progress statistics. Please try again.");
  }
};
