const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  toggleStatus,
  deleteEmployee,
  changePassword
} = require('../controllers/userController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(requireAuth);

router.get('/', getAllEmployees);
router.post('/', requireAdmin, upload.single('image'), createEmployee);
router.get('/:id', getEmployeeById);
router.put('/:id', requireAdmin, upload.single('image'), updateEmployee);
router.patch('/:id/toggle-status', requireAdmin, toggleStatus);
router.patch('/:id/change-password', requireAdmin, changePassword);
router.delete('/:id', requireAdmin, deleteEmployee);

module.exports = router;
