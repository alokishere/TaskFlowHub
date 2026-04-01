const express = require('express');
const router = express.Router();
const {
  createProject,
  getAllProjects,
  getProjectById,
  updateProject,
  deleteProject,
  updateProjectStatus,
  getEmployeeProjects,
  getEmployeeTasks,
  updateTaskStatus,
  updateTaskProgress,
  respondToProjectAssignment
} = require('../controllers/projectController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.use(requireAuth);

// Employee routes
router.get('/my-projects', getEmployeeProjects);
router.get('/my-tasks', getEmployeeTasks);
router.patch('/tasks/:id/status', updateTaskStatus);
router.patch('/tasks/:id/progress', updateTaskProgress);
router.patch('/tasks/:id/respond', respondToProjectAssignment);

// Admin routes
router.post('/', requireAdmin, createProject);
router.get('/', requireAdmin, getAllProjects);
router.get('/:id', requireAdmin, getProjectById);
router.put('/:id', requireAdmin, updateProject);
router.patch('/:id/status', requireAdmin, updateProjectStatus);
router.delete('/:id', requireAdmin, deleteProject);

module.exports = router;
