const express = require('express');
const router = express.Router();
const {
  addSalary,
  getSalaryHistory,
  getAllSalaries
} = require('../controllers/salaryController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.use(requireAuth);
router.use(requireAdmin);

router.post('/', addSalary);
router.get('/all', getAllSalaries);
router.get('/:userId', getSalaryHistory);

module.exports = router;
