const express = require('express');
const router = express.Router();
const {
  placeOrder, getOrders, getOrder, updateOrderStatus, getRetailerStats,
} = require('../controllers/orderController');
const { protect, authorize } = require('../middleware/auth');

router.post('/', protect, authorize('retailer'), placeOrder);
router.get('/', protect, getOrders);
router.get('/retailer-stats', protect, authorize('retailer'), getRetailerStats);
router.get('/:id', protect, getOrder);
router.put('/:id/status', protect, updateOrderStatus);

module.exports = router;
