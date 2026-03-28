const express = require('express');
const { listEmployees, createEmployee } = require('../controllers/userController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/employees', requireAuth, requireAdmin, listEmployees);
router.post('/employees', requireAuth, requireAdmin, createEmployee);

module.exports = router;
