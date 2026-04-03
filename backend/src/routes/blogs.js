const express = require('express');
const router = express.Router();
const {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  updateBlogStatus
} = require('../controllers/blogController');
const { requireAuth, requireAdmin } = require('../middleware/auth');
const { upload } = require('../middleware/upload');

const blogUpload = upload.fields([
  { name: 'coverImage', maxCount: 1 },
  { name: 'metaImage', maxCount: 1 }
]);

// PUBLIC ROUTES (no auth)
router.get('/get', getAllBlogs);
router.get('/get/:id', getBlogById);

// PROTECTED ROUTES
router.post('/create', requireAuth, requireAdmin, blogUpload, createBlog);
router.put('/update/:id', requireAuth, requireAdmin, blogUpload, updateBlog);
router.patch('/status/:id', requireAuth, requireAdmin, updateBlogStatus);
router.delete('/delete/:id', requireAuth, requireAdmin, deleteBlog);

module.exports = router;
