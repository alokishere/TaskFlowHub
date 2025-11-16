const { body } = require('express-validator');

const validateUpdateProfile = [
  body('firstName')
    .optional()
    .trim()
    .isLength({ min: 2, max: 50 })
    .withMessage('First name must be between 2 and 50 characters')
];

module.exports = {
  validateUpdateProfile
};