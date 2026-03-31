const Leave = require('../models/Leave');

const createLeaveRequest = async (req, res, next) => {
  try {
    const { type, from, to, reason } = req.body;
    const leave = await Leave.create({
      userId: req.user.id,
      type,
      from,
      to,
      reason
    });
    res.status(201).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

const getMyLeaves = async (req, res, next) => {
  try {
    const history = await Leave.find({ userId: req.user.id }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

const getAllLeaves = async (req, res, next) => {
  try {
    const { status } = req.query;
    const query = {};
    if (status) query.status = status;

    const leaves = await Leave.find(query).populate('userId', 'name email image department').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: leaves });
  } catch (error) {
    next(error);
  }
};

const updateLeaveStatus = async (req, res, next) => {
  try {
    const { status } = req.body;
    const leave = await Leave.findById(req.params.id);
    if (!leave) {
      return res.status(404).json({ success: false, message: 'Leave request not found' });
    }

    leave.status = status;
    await leave.save();
    res.status(200).json({ success: true, data: leave });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createLeaveRequest,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
};
