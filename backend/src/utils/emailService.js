const { sendPasswordResetEmail } = require('../config/email');

const sendOTPEmail = async (email, otp) => {
  try {
    const result = await sendPasswordResetEmail(email, otp);
    return result;
  } catch (error) {
    console.error('Error sending OTP email:', error);
    throw new Error('Failed to send OTP email');
  }
};

module.exports = {
  sendOTPEmail
};