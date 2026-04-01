const User = require('../models/User');
const { generateToken } = require('../utils/jwt');
const { normalizeStoredPath, buildStoredUploadPath } = require('../middleware/upload');

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  mobile: user.mobile,
  role: user.role,
  image: normalizeStoredPath(user.image),
  department: user.department,
  salary: user.salary,
  status: user.status
});

const bootstrapAdmin = async (req, res, next) => {
  try {
    const adminExists = await User.findOne({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({ success: false, message: 'Admin already exists' });
    }

    const { name, email, password, mobile } = req.body;
    
    const user = await User.create({
      name,
      email,
      password,
      mobile,
      role: 'admin',
      department: 'Management',
      salary: 0,
      status: 'active'
    });

    const token = generateToken({ id: user._id, role: user.role });

    res.status(201).json({
      success: true,
      data: { user: sanitizeUser(user), token }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    console.log('Login attempt for:', email);

    // Seed admin if none exists
    const adminExists = await User.findOne({ role: 'admin' });
    if (!adminExists) {
      console.log('No admin found, seeding default admin...');
      await User.create({
        name: 'Admin',
        email: 'admin@sarathi.in',
        password: 'password123',
        mobile: '0000000000',
        role: 'admin',
        department: 'Management',
        salary: 0,
        status: 'active'
      });
      console.log('Default admin seeded: admin@sarathi.in / password123');
    }

    const user = await User.findOne({ email }).select('+password');

    if (!user) {
      console.log('User not found:', email);
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await user.comparePassword(password);
    console.log('Password match:', isMatch);

    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    if (user.status === 'blocked') {
      return res.status(403).json({ success: false, message: 'Your account is blocked' });
    }

    const token = generateToken({ id: user._id, role: user.role });

    res.status(200).json({
      success: true,
      data: { user: sanitizeUser(user), token }
    });
  } catch (error) {
    next(error);
  }
};

const getMe = async (req, res, next) => {
  try {
    res.status(200).json({
      success: true,
      data: { user: sanitizeUser(req.user) }
    });
  } catch (error) {
    next(error);
  }
};

const updateSettings = async (req, res, next) => {
  try {
    const { name, email, mobile, password } = req.body;
    const user = await User.findById(req.user.id).select('+password');

    if (name) user.name = name;
    if (email) user.email = email;
    if (mobile) user.mobile = mobile;
    if (password) user.password = password;

    if (req.file) {
      user.image = buildStoredUploadPath(req.file.filename);
    }

    await user.save();

    res.status(200).json({
      success: true,
      data: { user: sanitizeUser(user) }
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  bootstrapAdmin,
  login,
  getMe,
  updateSettings
};
