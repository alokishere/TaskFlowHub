const User = require('../models/User');
const Project = require('../models/Project');
const Leave = require('../models/Leave');
const Attendance = require('../models/Attendance');
const { deleteFile } = require('../middleware/upload');
const bcrypt = require('bcryptjs');

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  role: user.role,
  image: user.image,
  department: user.department,
  salary: user.salary,
  status: user.status,
  createdAt: user.createdAt
});

const getAllEmployees = async (req, res, next) => {
  try {
    const { search, role, department } = req.query;
    const query = { role: { $ne: 'admin' } };

    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } }
      ];
    }
    if (role) query.role = role;
    if (department) query.department = department;

    const employees = await User.find(query).sort({ createdAt: -1 });
    res.status(200).json({
      success: true,
      data: employees.map(sanitizeUser)
    });
  } catch (error) {
    next(error);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password, mobile, role, department, salary } = req.body;
    const existing = await User.findOne({ email });
    if (existing) {
      return res.status(400).json({ success: false, message: 'Email already exists' });
    }

    const image = req.file ? `public/uploads/${req.file.filename}` : '';

    const employee = await User.create({
      name, email, password, mobile, role, department, salary, image
    });

    res.status(201).json({
      success: true,
      data: sanitizeUser(employee)
    });
  } catch (error) {
    next(error);
  }
};

const getEmployeeById = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    // Fetch related data
    const projects = await Project.find({ assignedTo: employee._id });
    const tasks = await Task.find({ assignedTo: employee._id });
    const leaves = await Leave.find({ userId: employee._id }).sort({ createdAt: -1 });
    const attendance = await Attendance.find({ userId: employee._id }).sort({ date: -1 });

    res.status(200).json({
      success: true,
      data: {
        ...sanitizeUser(employee),
        projects,
        tasks,
        leaves,
        attendance
      }
    });
  } catch (error) {
    next(error);
  }
};

const updateEmployee = async (req, res, next) => {
  try {
    const { name, email, mobile, role, department, salary } = req.body;
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    if (name) employee.name = name;
    if (email) employee.email = email;
    if (mobile) employee.mobile = mobile;
    if (role) employee.role = role;
    if (department) employee.department = department;
    if (salary) employee.salary = salary;

    if (req.file) {
      deleteFile(employee.image);
      employee.image = `public/uploads/${req.file.filename}`;
    }

    await employee.save();

    res.status(200).json({
      success: true,
      data: sanitizeUser(employee)
    });
  } catch (error) {
    next(error);
  }
};

const changePassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    if (!password || password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters' });
    }
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    employee.password = password;
    await employee.save();

    res.status(200).json({ success: true, message: 'Password updated' });
  } catch (error) {
    next(error);
  }
};

const toggleStatus = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    employee.status = employee.status === 'active' ? 'blocked' : 'active';
    await employee.save();

    res.status(200).json({
      success: true,
      data: sanitizeUser(employee)
    });
  } catch (error) {
    next(error);
  }
};

const deleteEmployee = async (req, res, next) => {
  try {
    const employee = await User.findById(req.params.id);
    if (!employee) {
      return res.status(404).json({ success: false, message: 'Employee not found' });
    }

    deleteFile(employee.image);
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Employee deleted'
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getAllEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  toggleStatus,
  deleteEmployee,
  changePassword
};
