const User = require('../models/User');

const validateEmail = (email = '') => /^\S+@\S+\.\S+$/.test(email);

const listEmployees = async (req, res, next) => {
  try {
    const employees = await User.find({ role: 'employee' })
      .select('_id name email role createdAt')
      .sort({ createdAt: -1 });

    return res.json({ success: true, data: { employees } });
  } catch (error) {
    return next(error);
  }
};

const createEmployee = async (req, res, next) => {
  try {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ success: false, error: 'Name, email and password are required' });
    }

    if (!validateEmail(email)) {
      return res.status(400).json({ success: false, error: 'Invalid email' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, error: 'Password must be at least 6 characters' });
    }

    const existing = await User.findOne({ email: email.trim().toLowerCase() });
    if (existing) {
      return res.status(400).json({ success: false, error: 'Email already in use' });
    }

    const employee = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'employee'
    });

    return res.status(201).json({
      success: true,
      message: 'Employee created',
      data: {
        employee: {
          id: employee._id,
          name: employee.name,
          email: employee.email,
          role: employee.role
        }
      }
    });
  } catch (error) {
    return next(error);
  }
};

module.exports = { listEmployees, createEmployee };
