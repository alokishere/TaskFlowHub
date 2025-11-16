const crypto = require('crypto');

const otpStore = new Map();

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000).toString();
};

const storeOTP = (email, otp) => {
  const expiry = Date.now() + 15 * 60 * 1000; // 15 minutes
  otpStore.set(email, { otp, expiry });
};

const verifyOTP = (email, otp) => {
  const storedData = otpStore.get(email);

  if (!storedData) {
    return false;
  }

  if (Date.now() > storedData.expiry) {
    otpStore.delete(email);
    return false;
  }

  if (storedData.otp !== otp) {
    return false;
  }

  otpStore.delete(email);
  return true;
};

const clearOTP = (email) => {
  otpStore.delete(email);
};

const cleanupExpiredOTPs = () => {
  const now = Date.now();
  for (const [email, data] of otpStore.entries()) {
    if (now > data.expiry) {
      otpStore.delete(email);
    }
  }
};

setInterval(cleanupExpiredOTPs, 5 * 60 * 1000); // Cleanup every 5 minutes

module.exports = {
  generateOTP,
  storeOTP,
  verifyOTP,
  clearOTP
};