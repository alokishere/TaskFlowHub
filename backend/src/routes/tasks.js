const express = require('express');
const router = express.Router();

const taskController = require('../controllers/taskController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { handleValidationErrors, validateObjectId } = require('../middleware/validation');
const {
  validateCreateTask,
  validateUpdateTask,
  validateUpdateStatus
} = require('../validators/taskValidator');

router.post('/', requireAuth, requireAdmin, validateCreateTask, handleValidationErrors, taskController.createTask);
router.get('/', requireAuth, taskController.getTasks);
router.get('/:id', requireAuth, validateObjectId, taskController.getTask);
router.put('/:id/status', requireAuth, validateObjectId, validateUpdateStatus, handleValidationErrors, taskController.updateTaskStatus);
router.put('/:id', requireAuth, requireAdmin, validateObjectId, validateUpdateTask, handleValidationErrors, taskController.updateTask);
router.delete('/:id', requireAuth, requireAdmin, validateObjectId, taskController.deleteTask);

module.exports = router;