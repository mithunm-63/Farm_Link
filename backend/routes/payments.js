const express = require('express');
const router = express.Router();
const Order = require('../models/Order');
const { protect, authorize } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// Create Stripe payment intent
router.post('/create-intent', protect, authorize('retailer'), asyncHandler(async (req, res) => {
  const { orderId } = req.body;
  const order = await Order.findById(orderId);
  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  if (order.retailer.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  // In production:
  // const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
  // const paymentIntent = await stripe.paymentIntents.create({
  //   amount: Math.round(order.totalAmount * 100),
  //   currency: 'inr',
  //   metadata: { orderId: order._id.toString() },
  // });
  // res.json({ success: true, clientSecret: paymentIntent.client_secret });

  // Mock response for demo
  res.json({
    success: true,
    clientSecret: `pi_mock_${Date.now()}_secret_demo`,
    amount: order.totalAmount,
    currency: 'inr',
  });
}));

// Confirm payment
router.post('/confirm', protect, asyncHandler(async (req, res) => {
  const { orderId, transactionId } = req.body;
  const order = await Order.findByIdAndUpdate(
    orderId,
    {
      'payment.status': 'paid',
      'payment.transactionId': transactionId,
      'payment.paidAt': new Date(),
    },
    { new: true }
  );
  res.json({ success: true, message: 'Payment confirmed.', order });
}));

// Stripe webhook (production)
router.post('/webhook', express.raw({ type: 'application/json' }), asyncHandler(async (req, res) => {
  // Handle Stripe webhook events
  res.json({ received: true });
}));

module.exports = router;
