const express = require('express');
const router = express.Router();
const { bootstrapAdmin, login, getMe, updateSettings } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.post('/bootstrap', bootstrapAdmin);
router.post('/login', login);
router.get('/me', requireAuth, getMe);
router.put('/settings', requireAuth, upload.single('image'), updateSettings);

module.exports = router;
