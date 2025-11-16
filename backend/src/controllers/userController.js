const User = require('../models/User');
const Task = require('../models/Task');

const getProfile = async (req, res, next) => {
  try {
    const user = {
      id: req.user._id,
      firstName: req.user.firstName,
      email: req.user.email,
      role: req.user.role,
      isActive: req.user.isActive,
      createdAt: req.user.createdAt,
      updatedAt: req.user.updatedAt
    };

    res.json({
      success: true,
      data: { user }
    });
  } catch (error) {
    next(error);
  }
};

const updateProfile = async (req, res, next) => {
  try {
    const { firstName } = req.body;

    const user = await User.findById(req.user._id);
    if (firstName) {
      user.firstName = firstName;
    }

    await user.save();

    const updatedUser = {
      id: user._id,
      firstName: user.firstName,
      email: user.email,
      role: user.role,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt
    };

    res.json({
      success: true,
      message: 'Profile updated successfully',
      data: { user: updatedUser }
    });
  } catch (error) {
    next(error);
  }
};

const getEmployees = async (req, res, next) => {
  try {
    const employees = await User.find({
      role: 'employee',
      isActive: true
    }).select('id firstName email isActive').sort({ firstName: 1 });

    res.json({
      success: true,
      data: { users: employees }
    });
  } catch (error) {
    next(error);
  }
};

const getStats = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const userRole = req.user.role;

    let matchCondition = {};
    if (userRole === 'employee') {
      matchCondition.assignedTo = userId;
    }

    const taskCounts = await Task.aggregate([
      { $match: matchCondition },
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);

    const stats = {
      newTask: 0,
      active: 0,
      completed: 0,
      failed: 0
    };

    taskCounts.forEach(item => {
      stats[item._id] = item.count;
    });

    res.json({
      success: true,
      data: { taskCounts: stats }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getProfile,
  updateProfile,
  getEmployees,
  getStats
};