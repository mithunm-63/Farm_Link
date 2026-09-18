const express = require('express');
const router = express.Router();
const {
  getCrops, getCrop, createCrop, updateCrop, deleteCrop,
  getMyListings, getFarmerStats, getFeaturedCrops,
} = require('../controllers/cropController');
const { protect, authorize } = require('../middleware/auth');

router.get('/', getCrops);
router.get('/featured', getFeaturedCrops);
router.get('/my-listings', protect, authorize('farmer'), getMyListings);
router.get('/farmer-stats', protect, authorize('farmer'), getFarmerStats);
router.get('/:id', getCrop);
router.post('/', protect, authorize('farmer'), createCrop);
router.put('/:id', protect, authorize('farmer', 'admin'), updateCrop);
router.delete('/:id', protect, authorize('farmer', 'admin'), deleteCrop);

module.exports = router;
