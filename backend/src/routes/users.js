const express = require('express');
const router = express.Router();
const {
  getAllEmployees,
  createEmployee,
  getEmployeeById,
  updateEmployee,
  toggleStatus,
  deleteEmployee
} = require('../controllers/userController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(requireAuth);
router.use(requireAdmin);

router.get('/', getAllEmployees);
router.post('/', upload.single('image'), createEmployee);
router.get('/:id', getEmployeeById);
router.put('/:id', upload.single('image'), updateEmployee);
router.patch('/:id/toggle-status', toggleStatus);
router.delete('/:id', deleteEmployee);

module.exports = router;
