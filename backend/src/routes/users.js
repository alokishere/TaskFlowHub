const express = require('express');
const router = express.Router();

const userController = require('../controllers/userController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { handleValidationErrors } = require('../middleware/validation');
const { validateUpdateProfile } = require('../validators/userValidator');

router.get('/profile', requireAuth, userController.getProfile);
router.put('/profile', requireAuth, validateUpdateProfile, handleValidationErrors, userController.updateProfile);
router.get('/employees', requireAuth, requireAdmin, userController.getEmployees);
router.get('/stats', requireAuth, userController.getStats);

module.exports = router;