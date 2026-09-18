const express = require('express');
const router = express.Router();
const multer = require('multer');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Use memory storage — in production swap for Cloudinary storage
const storage = multer.memoryStorage();
const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) cb(null, true);
    else cb(new Error('Only image files are allowed.'), false);
  },
});

// Upload single image
router.post('/image', protect, upload.single('image'), asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided.' });
  }

  // In production: upload to Cloudinary
  // const cloudinary = require('cloudinary').v2;
  // const result = await cloudinary.uploader.upload_stream(...)
  
  // For demo: return a placeholder URL (replace with actual Cloudinary upload)
  const mockUrl = `https://source.unsplash.com/800x600/?farm,crop,${Date.now()}`;
  
  res.json({
    success: true,
    message: 'Image uploaded successfully.',
    image: {
      public_id: `farmlink_${Date.now()}`,
      url: mockUrl,
    },
  });
}));

// Upload multiple images
router.post('/images', protect, upload.array('images', 5), asyncHandler(async (req, res) => {
  if (!req.files || req.files.length === 0) {
    return res.status(400).json({ success: false, message: 'No image files provided.' });
  }

  const images = req.files.map((file, i) => ({
    public_id: `farmlink_${Date.now()}_${i}`,
    url: `https://source.unsplash.com/800x600/?farm,crop,vegetable`,
    isMain: i === 0,
  }));

  res.json({ success: true, message: `${images.length} images uploaded.`, images });
}));

module.exports = router;
