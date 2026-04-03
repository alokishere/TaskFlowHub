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

router.use(requireAuth);
router.use(requireAdmin);

router.post('/create', blogUpload, createBlog);
router.get('/get', getAllBlogs);
router.get('/get/:id', getBlogById);
router.put('/update/:id', blogUpload, updateBlog);
router.patch('/status/:id', updateBlogStatus);
router.delete('/delete/:id', deleteBlog);

module.exports = router;
