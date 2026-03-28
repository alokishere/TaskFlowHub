const User = require('../models/User');

const sanitizeUser = (user) => ({
  id: user._id,
  name: user.name,
  email: user.email,
  role: user.role
});

const validateEmail = (email = '') => /^\S+@\S+\.\S+$/.test(email);

const bootstrapAdmin = async (req, res, next) => {
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

    const adminExists = await User.exists({ role: 'admin' });
    if (adminExists) {
      return res.status(400).json({ success: false, error: 'Admin already exists. Login with admin account.' });
    }

    const user = await User.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      password,
      role: 'admin'
    });

    const token = user.getAuthToken();

    return res.status(201).json({
      success: true,
      message: 'Admin account created',
      data: { user: sanitizeUser(user), token }
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(400).json({ success: false, error: 'Email already in use' });
    }
    return next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ success: false, error: 'Email and password are required' });
    }

    const user = await User.findOne({ email: email.trim().toLowerCase() }).select('+password');
    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({ success: false, error: 'Invalid email or password' });
    }

    const token = user.getAuthToken();

    return res.json({
      success: true,
      data: { user: sanitizeUser(user), token }
    });
  } catch (error) {
    return next(error);
  }
};

const me = async (req, res) => {
  return res.json({ success: true, data: { user: sanitizeUser(req.user) } });
};

module.exports = {
  bootstrapAdmin,
  login,
  me
};
