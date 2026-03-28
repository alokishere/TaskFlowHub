const express = require('express');
const { createProject, listProjects } = require('../controllers/projectController');
const { requireAuth, requireAdmin } = require('../middleware/auth');

const router = express.Router();

router.get('/', requireAuth, listProjects);
router.post('/', requireAuth, requireAdmin, createProject);

module.exports = router;
