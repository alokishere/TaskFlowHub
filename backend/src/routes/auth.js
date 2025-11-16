const express = require('express');
const router = express.Router();

const authController = require('../controllers/authController');
const { handleValidationErrors } = require('../middleware/validation');
const {
  validateRegister,
  validateLogin,
  validateForgotPassword,
  validateVerifyOTP,
  validateVerifyToken
} = require('../validators/authValidator');

router.post('/register', validateRegister, handleValidationErrors, authController.register);
router.post('/login', validateLogin, handleValidationErrors, authController.login);
router.post('/forgot-password', validateForgotPassword, handleValidationErrors, authController.forgotPassword);
router.post('/verify-otp', validateVerifyOTP, handleValidationErrors, authController.verifyOTP);
router.post('/verify-token', validateVerifyToken, handleValidationErrors, authController.verifyToken);

module.exports = router;