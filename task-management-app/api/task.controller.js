const Task = require('../task.model');
const User = require('../user.model');
const { sendResponse } = require('../response');

const createTask = async (req, res) => {
    try {
        const { title, description, deadline, priority, userId } = req.body;

        // Verify that the userId belongs to the same organization as the current user
        const targetUser = await User.findById(userId);
        if (!targetUser || targetUser.organization !== req.user.organization) {
            return sendResponse(res, 403, 'error', 'Access denied. User not in your organization.');
        }

        const task = new Task({
            title,
            description,
            deadline,
            priority,
            userId,
            organization: req.user.organization
        });

        await task.save();
        await task.populate('userId', 'email');

        sendResponse(res, 201, 'success', 'Task created successfully', { task });
    } catch (error) {
        console.error('Create task error:', error);
        sendResponse(res, 500, 'error', 'Server error');
    }
};

const getAllTasks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const tasks = await Task.find({ organization: req.user.organization })
            .populate('userId', 'email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalTasks = await Task.countDocuments({ organization: req.user.organization });
        const totalPages = Math.ceil(totalTasks / limit);

        sendResponse(res, 200, 'success', 'Tasks retrieved successfully', {
            tasks,
            totalTasks,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error('Get all tasks error:', error);
        sendResponse(res, 500, 'error', 'Server error');
    }
};

const getAllTasksForUser = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const tasks = await Task.find({ userId: req.user._id })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalTasks = await Task.countDocuments({ userId: req.user._id });
        const totalPages = Math.ceil(totalTasks / limit);

        sendResponse(res, 200, 'success', 'Tasks retrieved successfully', {
            tasks,
            totalTasks,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error('Get user tasks error:', error);
        sendResponse(res, 500, 'error', 'Server error');
    }
};

const getOngoingTasks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const tasks = await Task.find({
            organization: req.user.organization,
            completed: false
        })
            .populate('userId', 'email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalTasks = await Task.countDocuments({
            organization: req.user.organization,
            completed: false
        });
        const totalPages = Math.ceil(totalTasks / limit);

        sendResponse(res, 200, 'success', 'Ongoing tasks retrieved successfully', {
            tasks,
            totalTasks,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error('Get ongoing tasks error:', error);
        sendResponse(res, 500, 'error', 'Server error');
    }
};

const getCompletedTasks = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 10;
        const skip = (page - 1) * limit;

        const tasks = await Task.find({
            organization: req.user.organization,
            completed: true
        })
            .populate('userId', 'email')
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const totalTasks = await Task.countDocuments({
            organization: req.user.organization,
            completed: true
        });
        const totalPages = Math.ceil(totalTasks / limit);

        sendResponse(res, 200, 'success', 'Completed tasks retrieved successfully', {
            tasks,
            totalTasks,
            totalPages,
            currentPage: page
        });
    } catch (error) {
        console.error('Get completed tasks error:', error);
        sendResponse(res, 500, 'error', 'Server error');
    }
};

const getTaskById = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id).populate('userId', 'email');

        if (!task) {
            return sendResponse(res, 404, 'error', 'Task not found');
        }

        // Check if task belongs to user's organization
        if (task.organization !== req.user.organization) {
            return sendResponse(res, 403, 'error', 'Access denied');
        }

        sendResponse(res, 200, 'success', 'Task retrieved successfully', { task });
    } catch (error) {
        console.error('Get task by ID error:', error);
        sendResponse(res, 500, 'error', 'Server error');
    }
};

const updateTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return sendResponse(res, 404, 'error', 'Task not found');
        }

        // Check if task belongs to user's organization
        if (task.organization !== req.user.organization) {
            return sendResponse(res, 403, 'error', 'Access denied');
        }

        // Only allow users to update their own tasks or admins to update any task
        if (task.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return sendResponse(res, 403, 'error', 'Access denied. You can only update your own tasks.');
        }

        const updatedTask = await Task.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true }
        ).populate('userId', 'email');

        sendResponse(res, 200, 'success', 'Task updated successfully', { task: updatedTask });
    } catch (error) {
        console.error('Update task error:', error);
        sendResponse(res, 500, 'error', 'Server error');
    }
};

const deleteTask = async (req, res) => {
    try {
        const task = await Task.findById(req.params.id);

        if (!task) {
            return sendResponse(res, 404, 'error', 'Task not found');
        }

        // Check if task belongs to user's organization
        if (task.organization !== req.user.organization) {
            return sendResponse(res, 403, 'error', 'Access denied');
        }

        // Only allow users to delete their own tasks or admins to delete any task
        if (task.userId.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
            return sendResponse(res, 403, 'error', 'Access denied. You can only delete your own tasks.');
        }

        await Task.findByIdAndDelete(req.params.id);
        sendResponse(res, 200, 'success', 'Task deleted successfully');
    } catch (error) {
        console.error('Delete task error:', error);
        sendResponse(res, 500, 'error', 'Server error');
    }
};

module.exports = {
    createTask,
    getAllTasks,
    getAllTasksForUser,
    getOngoingTasks,
    getCompletedTasks,
    getTaskById,
    updateTask,
    deleteTask
};
