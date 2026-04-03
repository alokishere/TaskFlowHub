const Blog = require('../models/Blog');
const { deleteFile, normalizeStoredPath, buildStoredUploadPath } = require('../middleware/upload');

const hasOwn = (obj, key) => Object.prototype.hasOwnProperty.call(obj || {}, key);

const parseBoolean = (value, fallback = false) => {
  if (typeof value === 'boolean') return value;
  if (typeof value === 'string') {
    const normalized = value.trim().toLowerCase();
    if (normalized === 'true') return true;
    if (normalized === 'false') return false;
  }
  return fallback;
};

const parseTags = (value) => {
  if (!value) return [];

  if (Array.isArray(value)) {
    return value
      .map((tag) => String(tag || '').trim())
      .filter(Boolean);
  }

  if (typeof value === 'string') {
    const raw = value.trim();
    if (!raw) return [];

    try {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        return parsed
          .map((tag) => String(tag || '').trim())
          .filter(Boolean);
      }
    } catch (_) {
      // Ignore JSON parse error and fall back to CSV split.
    }

    return raw
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
  }

  return [];
};

const normalizeBlog = (blog) => {
  const data = blog.toObject ? blog.toObject() : blog;
  return {
    ...data,
    coverImage: normalizeStoredPath(data.coverImage),
    metaImage: normalizeStoredPath(data.metaImage)
  };
};

const applyStatusConsistency = (blog) => {
  if (blog.isDraft || blog.status === 'draft') {
    blog.status = 'draft';
    blog.isDraft = true;
    blog.isActive = false;
    return;
  }

  blog.isDraft = false;

  if (blog.status === 'published' && !blog.publishedAt) {
    blog.publishedAt = new Date();
  }
};

const createBlog = async (req, res, next) => {
  try {
    const {
      title,
      category,
      status,
      shortDescription,
      longDescription,
      metaTitle,
      focusKeyword,
      canonicalUrl,
      metaDescription,
      ogTitle,
      ogDescription
    } = req.body;

    if (!title || !category || !shortDescription || !longDescription) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, short description, and long description are required'
      });
    }

    const allowedStatuses = ['draft', 'published', 'scheduled'];
    const nextStatus = allowedStatuses.includes(status) ? status : 'draft';

    const isDraft = hasOwn(req.body, 'isDraft')
      ? parseBoolean(req.body.isDraft)
      : nextStatus === 'draft';

    const isActive = hasOwn(req.body, 'isActive')
      ? parseBoolean(req.body.isActive)
      : !isDraft;

    const coverImageFile = req.files?.coverImage?.[0];
    const metaImageFile = req.files?.metaImage?.[0];

    const blog = await Blog.create({
      title: String(title).trim(),
      category: String(category).trim(),
      status: nextStatus,
      shortDescription: String(shortDescription).trim(),
      longDescription: String(longDescription).trim(),
      tags: parseTags(req.body.tags),
      coverImage: coverImageFile ? buildStoredUploadPath(coverImageFile.filename) : '',
      metaTitle: String(metaTitle || '').trim(),
      focusKeyword: String(focusKeyword || '').trim(),
      canonicalUrl: String(canonicalUrl || '').trim(),
      metaDescription: String(metaDescription || '').trim(),
      metaImage: metaImageFile ? buildStoredUploadPath(metaImageFile.filename) : '',
      ogTitle: String(ogTitle || '').trim(),
      ogDescription: String(ogDescription || '').trim(),
      isActive,
      isDraft,
      publishedAt: nextStatus === 'published' && !isDraft ? new Date() : null,
      createdBy: req.user?._id
    });

    applyStatusConsistency(blog);
    await blog.save();

    res.status(201).json({
      success: true,
      data: normalizeBlog(blog)
    });
  } catch (error) {
    next(error);
  }
};

const getAllBlogs = async (req, res, next) => {
  try {
    const blogs = await Blog.find()
      .sort({ createdAt: -1 })
      .populate('createdBy', 'name email');

    res.status(200).json({
      success: true,
      data: blogs.map(normalizeBlog)
    });
  } catch (error) {
    next(error);
  }
};

const getBlogById = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id).populate('createdBy', 'name email');
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    res.status(200).json({
      success: true,
      data: normalizeBlog(blog)
    });
  } catch (error) {
    next(error);
  }
};

const updateBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const allowedStatuses = ['draft', 'published', 'scheduled'];

    if (hasOwn(req.body, 'title')) blog.title = String(req.body.title || '').trim();
    if (hasOwn(req.body, 'category')) blog.category = String(req.body.category || '').trim();
    if (hasOwn(req.body, 'shortDescription')) blog.shortDescription = String(req.body.shortDescription || '').trim();
    if (hasOwn(req.body, 'longDescription')) blog.longDescription = String(req.body.longDescription || '').trim();
    if (hasOwn(req.body, 'tags')) blog.tags = parseTags(req.body.tags);
    if (hasOwn(req.body, 'metaTitle')) blog.metaTitle = String(req.body.metaTitle || '').trim();
    if (hasOwn(req.body, 'focusKeyword')) blog.focusKeyword = String(req.body.focusKeyword || '').trim();
    if (hasOwn(req.body, 'canonicalUrl')) blog.canonicalUrl = String(req.body.canonicalUrl || '').trim();
    if (hasOwn(req.body, 'metaDescription')) blog.metaDescription = String(req.body.metaDescription || '').trim();
    if (hasOwn(req.body, 'ogTitle')) blog.ogTitle = String(req.body.ogTitle || '').trim();
    if (hasOwn(req.body, 'ogDescription')) blog.ogDescription = String(req.body.ogDescription || '').trim();

    if (hasOwn(req.body, 'status') && allowedStatuses.includes(req.body.status)) {
      blog.status = req.body.status;
    }

    if (hasOwn(req.body, 'isDraft')) {
      blog.isDraft = parseBoolean(req.body.isDraft, blog.isDraft);
    }

    if (hasOwn(req.body, 'isActive')) {
      blog.isActive = parseBoolean(req.body.isActive, blog.isActive);
    }

    const removeCoverImage = parseBoolean(req.body.removeCoverImage, false);
    const removeMetaImage = parseBoolean(req.body.removeMetaImage, false);

    const coverImageFile = req.files?.coverImage?.[0];
    const metaImageFile = req.files?.metaImage?.[0];

    if (coverImageFile) {
      deleteFile(blog.coverImage);
      blog.coverImage = buildStoredUploadPath(coverImageFile.filename);
    } else if (removeCoverImage) {
      deleteFile(blog.coverImage);
      blog.coverImage = '';
    }

    if (metaImageFile) {
      deleteFile(blog.metaImage);
      blog.metaImage = buildStoredUploadPath(metaImageFile.filename);
    } else if (removeMetaImage) {
      deleteFile(blog.metaImage);
      blog.metaImage = '';
    }

    if (!blog.title || !blog.category || !blog.shortDescription || !blog.longDescription) {
      return res.status(400).json({
        success: false,
        message: 'Title, category, short description, and long description are required'
      });
    }

    applyStatusConsistency(blog);
    await blog.save();

    res.status(200).json({
      success: true,
      data: normalizeBlog(blog)
    });
  } catch (error) {
    next(error);
  }
};

const deleteBlog = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    deleteFile(blog.coverImage);
    deleteFile(blog.metaImage);
    await Blog.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: 'Blog deleted successfully'
    });
  } catch (error) {
    next(error);
  }
};

const updateBlogStatus = async (req, res, next) => {
  try {
    const blog = await Blog.findById(req.params.id);
    if (!blog) {
      return res.status(404).json({ success: false, message: 'Blog not found' });
    }

    const nextActive = hasOwn(req.body, 'isActive')
      ? parseBoolean(req.body.isActive, blog.isActive)
      : !blog.isActive;

    blog.isActive = nextActive;

    if (blog.isActive && blog.isDraft) {
      blog.isDraft = false;
      if (blog.status === 'draft') {
        blog.status = 'published';
      }
      if (!blog.publishedAt) {
        blog.publishedAt = new Date();
      }
    }

    if (!blog.isActive && blog.status === 'draft') {
      blog.isDraft = true;
    }

    applyStatusConsistency(blog);
    await blog.save();

    res.status(200).json({
      success: true,
      data: normalizeBlog(blog)
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createBlog,
  getAllBlogs,
  getBlogById,
  updateBlog,
  deleteBlog,
  updateBlogStatus
};
