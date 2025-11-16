const Task = require('../models/Task');
const User = require('../models/User');

const createTask = async (req, res, next) => {
  try {
    const { taskTitle, taskDescription, taskDate, category, assignedTo } = req.body;

    const assignedUser = await User.findById(assignedTo);
    if (!assignedUser) {
      return res.status(400).json({
        success: false,
        error: 'Assigned user not found'
      });
    }

    if (assignedUser.role !== 'employee') {
      return res.status(400).json({
        success: false,
        error: 'Task can only be assigned to employees'
      });
    }

    const task = new Task({
      taskTitle,
      taskDescription,
      taskDate,
      category,
      assignedTo,
      assignedBy: req.user._id
    });

    await task.save();
    await task.populate('assignedTo', 'firstName email');
    await task.populate('assignedBy', 'firstName email');

    res.status(201).json({
      success: true,
      message: 'Task created successfully',
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

const getTasks = async (req, res, next) => {
  try {
    const { status, page = 1, limit = 10 } = req.query;
    const userRole = req.user.role;
    const userId = req.user._id;

    let matchCondition = {};
    if (userRole === 'employee') {
      matchCondition.assignedTo = userId;
    }

    if (status) {
      matchCondition.status = status;
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const tasks = await Task.find(matchCondition)
      .populate('assignedTo', 'firstName email')
      .populate('assignedBy', 'firstName email')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Task.countDocuments(matchCondition);

    const pagination = {
      currentPage: parseInt(page),
      totalPages: Math.ceil(total / parseInt(limit)),
      totalTasks: total,
      hasNext: parseInt(page) < Math.ceil(total / parseInt(limit)),
      hasPrev: parseInt(page) > 1
    };

    res.json({
      success: true,
      data: {
        tasks,
        pagination
      }
    });
  } catch (error) {
    next(error);
  }
};

const getTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const userRole = req.user.role;
    const userId = req.user._id;

    const task = await Task.findById(id)
      .populate('assignedTo', 'firstName email')
      .populate('assignedBy', 'firstName email');

    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    if (userRole === 'employee' && task.assignedTo._id.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    res.json({
      success: true,
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

const updateTaskStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const userRole = req.user.role;
    const userId = req.user._id;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    if (userRole === 'employee' && task.assignedTo.toString() !== userId.toString()) {
      return res.status(403).json({
        success: false,
        error: 'Access denied'
      });
    }

    if (userRole === 'employee') {
      const currentStatus = task.status;
      if (currentStatus === 'newTask' && status !== 'active') {
        return res.status(400).json({
          success: false,
          error: 'New tasks can only be changed to active'
        });
      }
      if (currentStatus === 'active' && !['completed', 'failed'].includes(status)) {
        return res.status(400).json({
          success: false,
          error: 'Active tasks can only be changed to completed or failed'
        });
      }
      if (['completed', 'failed'].includes(currentStatus)) {
        return res.status(400).json({
          success: false,
          error: 'Completed or failed tasks cannot be changed'
        });
      }
    }

    await task.updateStatus(status, userId);
    await task.populate('assignedTo', 'firstName email');
    await task.populate('assignedBy', 'firstName email');

    res.json({
      success: true,
      message: 'Task status updated successfully',
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

const updateTask = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { taskTitle, taskDescription, taskDate, category, assignedTo } = req.body;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    if (assignedTo) {
      const assignedUser = await User.findById(assignedTo);
      if (!assignedUser) {
        return res.status(400).json({
          success: false,
          error: 'Assigned user not found'
        });
      }

      if (assignedUser.role !== 'employee') {
        return res.status(400).json({
          success: false,
          error: 'Task can only be assigned to employees'
        });
      }
    }

    if (taskTitle) task.taskTitle = taskTitle;
    if (taskDescription) task.taskDescription = taskDescription;
    if (taskDate) task.taskDate = taskDate;
    if (category) task.category = category;
    if (assignedTo) task.assignedTo = assignedTo;

    await task.save();
    await task.populate('assignedTo', 'firstName email');
    await task.populate('assignedBy', 'firstName email');

    res.json({
      success: true,
      message: 'Task updated successfully',
      data: { task }
    });
  } catch (error) {
    next(error);
  }
};

const deleteTask = async (req, res, next) => {
  try {
    const { id } = req.params;

    const task = await Task.findById(id);
    if (!task) {
      return res.status(404).json({
        success: false,
        error: 'Task not found'
      });
    }

    await Task.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Task deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createTask,
  getTasks,
  getTask,
  updateTaskStatus,
  updateTask,
  deleteTask
};