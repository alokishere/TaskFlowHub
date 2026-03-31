const express = require('express');
const router = express.Router();
const {
  punchIn,
  punchOut,
  getMyAttendance,
  getAllAttendance
} = require('../controllers/attendanceController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

router.use(requireAuth);

router.post('/punch-in', punchIn);
router.post('/punch-out', punchOut);
router.get('/my', getMyAttendance);
router.get('/all', requireAdmin, getAllAttendance);

module.exports = router;
