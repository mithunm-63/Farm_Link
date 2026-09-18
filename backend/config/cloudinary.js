/**
 * Cloudinary Configuration
 * Handles image uploads with transformation presets
 */

const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const multer = require('multer');

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

// ── Crop image storage ──────────────────────────────────────
const cropStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'farmlink/crops',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 800, height: 600, crop: 'fill', quality: 'auto' },
      { fetch_format: 'auto' },
    ],
    public_id: `crop_${req.user?.id}_${Date.now()}`,
  }),
});

// ── Avatar storage ──────────────────────────────────────────
const avatarStorage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => ({
    folder: 'farmlink/avatars',
    allowed_formats: ['jpg', 'jpeg', 'png', 'webp'],
    transformation: [
      { width: 200, height: 200, crop: 'fill', gravity: 'face', quality: 'auto' },
    ],
    public_id: `avatar_${req.user?.id}`,
    overwrite: true,
  }),
});

// ── File filter ─────────────────────────────────────────────
const imageFilter = (req, file, cb) => {
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed (jpg, jpeg, png, webp)'), false);
  }
};

// ── Multer upload instances ─────────────────────────────────
const uploadCropImages = multer({
  storage: cropStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 5 * 1024 * 1024, files: 5 }, // 5MB, max 5 files
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: imageFilter,
  limits: { fileSize: 2 * 1024 * 1024, files: 1 }, // 2MB
});

// ── Cloudinary helpers ──────────────────────────────────────

/**
 * Delete an image from Cloudinary by public_id
 */
const deleteImage = async (public_id) => {
  if (!public_id) return null;
  try {
    const result = await cloudinary.uploader.destroy(public_id);
    return result;
  } catch (err) {
    console.error('Cloudinary delete error:', err.message);
    return null;
  }
};

/**
 * Upload a base64 or buffer directly (for non-multer flows)
 */
const uploadDirect = async (fileBuffer, folder = 'farmlink/misc') => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder,
        transformation: [{ quality: 'auto', fetch_format: 'auto' }],
      },
      (error, result) => {
        if (error) reject(error);
        else resolve(result);
      }
    );
    uploadStream.end(fileBuffer);
  });
};

module.exports = {
  cloudinary,
  uploadCropImages,
  uploadAvatar,
  deleteImage,
  uploadDirect,
};
