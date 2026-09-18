/**
 * Upload Middleware
 * Multer config for local + Cloudinary uploads
 */

const multer = require('multer');
const path = require('path');

// ── Memory storage (for Cloudinary pipelines) ────────────────
const memoryStorage = multer.memoryStorage();

// ── Local disk storage (for dev without Cloudinary) ──────────
const diskStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${file.fieldname}-${uniqueSuffix}${ext}`);
  },
});

// ── File filter ──────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  const allowedMimes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];
  if (allowedMimes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpeg, png, webp, gif)'), false);
  }
};

// ── Multer instances ─────────────────────────────────────────

// Single crop image upload
exports.uploadSingleImage = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 1,
  },
}).single('image');

// Multiple crop images (up to 5)
exports.uploadMultipleImages = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB per file
    files: 5,
  },
}).array('images', 5);

// Avatar upload
exports.uploadAvatarImage = multer({
  storage: memoryStorage,
  fileFilter: imageFilter,
  limits: {
    fileSize: 2 * 1024 * 1024, // 2MB
    files: 1,
  },
}).single('avatar');

// ── Error handler wrapper for multer ─────────────────────────
exports.handleUploadError = (uploadFn) => (req, res, next) => {
  uploadFn(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      const messages = {
        LIMIT_FILE_SIZE: 'File is too large. Maximum size is 5MB.',
        LIMIT_FILE_COUNT: 'Too many files. Maximum is 5 images.',
        LIMIT_UNEXPECTED_FILE: 'Unexpected file field.',
      };
      return res.status(400).json({
        success: false,
        message: messages[err.code] || `Upload error: ${err.message}`,
      });
    }
    if (err) {
      return res.status(400).json({ success: false, message: err.message });
    }
    next();
  });
};
