const express = require('express');
const router = express.Router();
const {
  getFarmers, getRetailers, getUserProfile,
  updateAvatar, searchUsers, getAdminStats, deactivateUser,
} = require('../controllers/userController');
const { protect, authorize } = require('../middleware/auth');
const { uploadAvatarImage, handleUploadError } = require('../middleware/upload');

// Public routes
router.get('/farmers', getFarmers);
router.get('/search', searchUsers);
router.get('/:id', getUserProfile);

// Private routes
router.get('/retailers', protect, authorize('farmer', 'admin'), getRetailers);
router.put('/avatar', protect, handleUploadError(uploadAvatarImage), updateAvatar);

// Admin routes
router.get('/admin/stats', protect, authorize('admin'), getAdminStats);
router.put('/:id/deactivate', protect, authorize('admin'), deactivateUser);

module.exports = router;
