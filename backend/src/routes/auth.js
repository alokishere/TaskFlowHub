const express = require('express');
const { bootstrapAdmin, login, me } = require('../controllers/authController');
const { requireAuth } = require('../middleware/auth');

const router = express.Router();

router.post('/bootstrap-admin', bootstrapAdmin);
router.post('/login', login);
router.get('/me', requireAuth, me);

module.exports = router;
