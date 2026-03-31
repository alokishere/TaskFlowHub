const Salary = require('../models/Salary');
const User = require('../models/User');

const addSalary = async (req, res, next) => {
  try {
    const { userId, month, year, amount, note } = req.body;
    const salary = await Salary.create({
      userId,
      month,
      year,
      amount,
      note
    });
    res.status(201).json({ success: true, data: salary });
  } catch (error) {
    next(error);
  }
};

const getSalaryHistory = async (req, res, next) => {
  try {
    const { userId } = req.params;
    const history = await Salary.find({ userId }).sort({ year: -1, month: -1 });
    res.status(200).json({ success: true, data: history });
  } catch (error) {
    next(error);
  }
};

const getAllSalaries = async (req, res, next) => {
  try {
    const salaries = await Salary.find().populate('userId', 'name email department').sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: salaries });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  addSalary,
  getSalaryHistory,
  getAllSalaries
};
