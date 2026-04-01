const express = require('express');
const router = express.Router();
const { sendMessage, getConversation } = require('../controllers/messageController');
const { requireAuth } = require('../middleware/auth');

router.use(requireAuth);

router.post('/', sendMessage);
router.get('/:userId', getConversation);

module.exports = router;
