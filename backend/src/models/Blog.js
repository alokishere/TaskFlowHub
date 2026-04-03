const mongoose = require('mongoose');

const blogSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    category: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['draft', 'published', 'scheduled'],
      default: 'draft'
    },
    shortDescription: {
      type: String,
      required: true,
      trim: true
    },
    longDescription: {
      type: String,
      required: true,
      trim: true
    },
    tags: {
      type: [String],
      default: []
    },
    coverImage: {
      type: String,
      default: ''
    },
    metaTitle: {
      type: String,
      default: '',
      trim: true
    },
    focusKeyword: {
      type: String,
      default: '',
      trim: true
    },
    canonicalUrl: {
      type: String,
      default: '',
      trim: true
    },
    metaDescription: {
      type: String,
      default: '',
      trim: true
    },
    metaImage: {
      type: String,
      default: ''
    },
    ogTitle: {
      type: String,
      default: '',
      trim: true
    },
    ogDescription: {
      type: String,
      default: '',
      trim: true
    },
    isActive: {
      type: Boolean,
      default: false
    },
    isDraft: {
      type: Boolean,
      default: true
    },
    publishedAt: {
      type: Date,
      default: null
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model('Blog', blogSchema);
