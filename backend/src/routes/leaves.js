const express = require('express');
const router = express.Router();
const {
  createLeaveRequest,
  getMyLeaves,
  getAllLeaves,
  updateLeaveStatus
} = require('../controllers/leaveController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.use(requireAuth);

router.post('/', createLeaveRequest);
router.get('/my', getMyLeaves);
router.get('/all', requireAdmin, getAllLeaves);
router.patch('/:id/status', requireAdmin, updateLeaveStatus);

module.exports = router;
