const express = require('express');
const router = express.Router();
const { uploadDocument, getEmployeeDocuments, deleteDocument } = require('../controllers/documentController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

router.use(requireAuth);

router.post('/', requireAdmin, upload.single('file'), uploadDocument);
router.get('/:employeeId', requireAdmin, getEmployeeDocuments);
router.delete('/:id', requireAdmin, deleteDocument);

module.exports = router;
