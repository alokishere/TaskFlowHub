const User = require('../models/User');
const { generateOTP, storeOTP, verifyOTP } = require('../utils/otp');
const { sendOTPEmail } = require('../utils/emailService');
const { hashPassword } = require('../utils/bcrypt');

const register = async (req, res, next) => {
  try {
    const { firstName, email, password, role = 'employee' } = req.body;

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: 'Email already registered'
      });
    }

    const user = new User({
      firstName,
      email,
      password,
      role
    });

    await user.save();

    const token = user.generateAuthToken();

    res.status(201).json({
      success: true,
      message: 'User registered successfully',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const login = async (req, res, next) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const isPasswordValid = await user.comparePassword(password);
    if (!isPasswordValid) {
      return res.status(401).json({
        success: false,
        error: 'Invalid email or password'
      });
    }

    const token = user.generateAuthToken();

    res.json({
      success: true,
      message: 'Login successful',
      data: {
        user: {
          id: user._id,
          firstName: user.firstName,
          email: user.email,
          role: user.role
        },
        token
      }
    });
  } catch (error) {
    next(error);
  }
};

const forgotPassword = async (req, res, next) => {
  try {
    const { email } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'No account found with this email'
      });
    }

    const otp = generateOTP();
    storeOTP(email, otp);

    const emailSent = await sendOTPEmail(email, otp);
    if (!emailSent) {
      return res.status(500).json({
        success: false,
        error: 'Failed to send OTP email'
      });
    }

    res.json({
      success: true,
      message: 'OTP sent to your email',
      data: {
        otpId: email
      }
    });
  } catch (error) {
    next(error);
  }
};

const verifyOTP = async (req, res, next) => {
  try {
    const { email, otp, newPassword } = req.body;

    const isValid = verifyOTP(email, otp);
    if (!isValid) {
      return res.status(400).json({
        success: false,
        error: 'Invalid or expired OTP'
      });
    }

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({
        success: false,
        error: 'User not found'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Password reset successfully'
    });
  } catch (error) {
    next(error);
  }
};

const verifyToken = async (req, res, next) => {
  try {
    const { token } = req.body;

    const { verifyToken } = require('../utils/jwt');
    const decoded = verifyToken(token);

    const user = await User.findById(decoded.id).select('-password');
    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: 'Invalid token or user not found'
      });
    }

    res.json({
      success: true,
      data: {
        valid: true,
        user: {
          id: user._id,
          firstName: user.firstName,
          email: user.email,
          role: user.role
        }
      }
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      data: {
        valid: false,
        error: 'Invalid token'
      }
    });
  }
};

module.exports = {
  register,
  login,
  forgotPassword,
  verifyOTP,
  verifyToken
};