const multer = require('multer');
const path = require('path');
const fs = require('fs');

const uploadsDir = path.join(__dirname, '../../public/uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const normalizeStoredPath = (filePath = '') => {
  if (!filePath) return '';
  const normalized = String(filePath).replace(/\\/g, '/').trim();
  const withoutLeadingSlash = normalized.replace(/^\/+/, '');

  if (withoutLeadingSlash.startsWith('public/')) {
    return withoutLeadingSlash.slice('public/'.length);
  }

  return withoutLeadingSlash;
};

const buildStoredUploadPath = (filename) => `uploads/${filename}`;

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    cb(null, `${Date.now()}-${file.originalname}`);
  }
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    const filetypes = /jpeg|jpg|png|webp|pdf/;
    const mimetype = filetypes.test(file.mimetype);
    const extname = filetypes.test(path.extname(file.originalname).toLowerCase());

    if (mimetype && extname) {
      return cb(null, true);
    }
    cb(new Error('Only images and PDFs are allowed'));
  }
});

const deleteFile = (filePath) => {
  if (!filePath) return;
  const normalizedPath = normalizeStoredPath(filePath);
  const fullPath = path.join(__dirname, '../../public', normalizedPath);
  if (fs.existsSync(fullPath)) {
    fs.unlinkSync(fullPath);
  }
};

module.exports = {
  upload,
  deleteFile,
  normalizeStoredPath,
  buildStoredUploadPath
};
