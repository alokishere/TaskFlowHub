const express = require('express');
const router = express.Router();
const {
  createProject,
  getAllProjects,
  updateProjectStatus,
  getEmployeeProjects,
  getEmployeeTasks,
  updateTaskStatus
} = require('../controllers/projectController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.use(requireAuth);

// Admin routes
router.post('/', requireAdmin, createProject);
router.get('/', requireAdmin, getAllProjects);
router.patch('/:id/status', requireAdmin, updateProjectStatus);

// Employee routes
router.get('/my-projects', getEmployeeProjects);
router.get('/my-tasks', getEmployeeTasks);
router.patch('/tasks/:id/status', updateTaskStatus);

module.exports = router;
