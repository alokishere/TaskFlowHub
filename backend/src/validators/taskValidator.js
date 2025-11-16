const { body } = require('express-validator');

const validateCreateTask = [
  body('taskTitle')
    .trim()
    .notEmpty()
    .withMessage('Task title is required')
    .isLength({ max: 200 })
    .withMessage('Task title cannot exceed 200 characters'),

  body('taskDescription')
    .trim()
    .notEmpty()
    .withMessage('Task description is required')
    .isLength({ max: 1000 })
    .withMessage('Task description cannot exceed 1000 characters'),

  body('taskDate')
    .isISO8601()
    .withMessage('Please provide a valid date')
    .toDate(),

  body('category')
    .trim()
    .notEmpty()
    .withMessage('Category is required')
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),

  body('assignedTo')
    .isMongoId()
    .withMessage('Invalid assigned user ID')
];

const validateUpdateTask = [
  body('taskTitle')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task title cannot be empty')
    .isLength({ max: 200 })
    .withMessage('Task title cannot exceed 200 characters'),

  body('taskDescription')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Task description cannot be empty')
    .isLength({ max: 1000 })
    .withMessage('Task description cannot exceed 1000 characters'),

  body('taskDate')
    .optional()
    .isISO8601()
    .withMessage('Please provide a valid date')
    .toDate(),

  body('category')
    .optional()
    .trim()
    .notEmpty()
    .withMessage('Category cannot be empty')
    .isLength({ max: 50 })
    .withMessage('Category cannot exceed 50 characters'),

  body('assignedTo')
    .optional()
    .isMongoId()
    .withMessage('Invalid assigned user ID')
];

const validateUpdateStatus = [
  body('status')
    .isIn(['newTask', 'active', 'completed', 'failed'])
    .withMessage('Status must be one of: newTask, active, completed, failed')
];

module.exports = {
  validateCreateTask,
  validateUpdateTask,
  validateUpdateStatus
};