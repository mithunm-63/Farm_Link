/**
 * Review Controller
 * Ratings and reviews after completed orders
 */

const Review = require('../models/Review');
const Order = require('../models/Order');
const Crop = require('../models/Crop');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get reviews (for a crop or a user)
// @route   GET /api/reviews
// @access  Public
exports.getReviews = asyncHandler(async (req, res) => {
  const { cropId, userId, reviewerRole, page = 1, limit = 10, sort = '-createdAt' } = req.query;

  const query = {};
  if (cropId) query.crop = cropId;
  if (userId) query.reviewee = userId;
  if (reviewerRole) query.reviewerRole = reviewerRole;

  const total = await Review.countDocuments(query);
  const reviews = await Review.find(query)
    .populate('reviewer', 'name avatar role')
    .populate('reviewee', 'name avatar role farmName businessName')
    .sort(sort)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  // Average breakdown
  const ratingStats = await Review.aggregate([
    { $match: query.crop ? { crop: require('mongoose').Types.ObjectId(cropId) } : (query.reviewee ? { reviewee: require('mongoose').Types.ObjectId(userId) } : {}) },
    {
      $group: {
        _id: null,
        avgRating: { $avg: '$rating' },
        avgQuality: { $avg: '$qualityRating' },
        avgPackaging: { $avg: '$packagingRating' },
        avgCommunication: { $avg: '$communicationRating' },
        breakdown: { $push: '$rating' },
      },
    },
  ]);

  // Star breakdown counts
  const starCounts = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 };
  if (ratingStats[0]) {
    ratingStats[0].breakdown.forEach((r) => {
      starCounts[Math.round(r)] = (starCounts[Math.round(r)] || 0) + 1;
    });
  }

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    reviews,
    stats: ratingStats[0]
      ? {
          average: Math.round(ratingStats[0].avgRating * 10) / 10,
          quality: Math.round((ratingStats[0].avgQuality || 0) * 10) / 10,
          packaging: Math.round((ratingStats[0].avgPackaging || 0) * 10) / 10,
          communication: Math.round((ratingStats[0].avgCommunication || 0) * 10) / 10,
          starCounts,
        }
      : null,
  });
});

// @desc    Create review
// @route   POST /api/reviews
// @access  Private
exports.createReview = asyncHandler(async (req, res) => {
  const { orderId, rating, title, comment, qualityRating, packagingRating, communicationRating } = req.body;

  // Validate order exists and is delivered
  const order = await Order.findById(orderId)
    .populate('farmer', 'name socketId')
    .populate('retailer', 'name socketId');

  if (!order) return res.status(404).json({ success: false, message: 'Order not found.' });
  if (order.status !== 'delivered') {
    return res.status(400).json({ success: false, message: 'You can only review delivered orders.' });
  }

  const isRetailer = order.retailer._id.toString() === req.user.id;
  const isFarmer = order.farmer._id.toString() === req.user.id;

  if (!isRetailer && !isFarmer) {
    return res.status(403).json({ success: false, message: 'Not authorized to review this order.' });
  }
  if (isRetailer && order.retailerReviewed) {
    return res.status(400).json({ success: false, message: 'You have already reviewed this order.' });
  }
  if (isFarmer && order.farmerReviewed) {
    return res.status(400).json({ success: false, message: 'You have already reviewed this order.' });
  }

  const reviewee = isRetailer ? order.farmer._id : order.retailer._id;
  const revieweeSocket = isRetailer ? order.farmer.socketId : order.retailer.socketId;

  const review = await Review.create({
    order: orderId,
    crop: order.crop,
    reviewer: req.user.id,
    reviewee,
    reviewerRole: req.user.role,
    rating,
    title,
    comment,
    qualityRating,
    packagingRating,
    communicationRating,
  });

  // Update order reviewed flags
  if (isRetailer) await Order.findByIdAndUpdate(orderId, { retailerReviewed: true });
  else await Order.findByIdAndUpdate(orderId, { farmerReviewed: true });

  await review.populate('reviewer', 'name avatar');

  // Notify reviewee
  const io = req.app.get('io');
  await createNotification({
    recipient: reviewee,
    type: 'new_review',
    title: 'New Review Received',
    message: `${req.user.name} left you a ${rating}★ review`,
    data: { orderId: order._id },
    io,
    socketId: revieweeSocket,
  });

  res.status(201).json({ success: true, message: 'Review submitted successfully!', review });
});

// @desc    Reply to a review (reviewee only)
// @route   PUT /api/reviews/:id/reply
// @access  Private
exports.replyToReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

  if (review.reviewee.toString() !== req.user.id) {
    return res.status(403).json({ success: false, message: 'Only the reviewed party can reply.' });
  }
  if (review.reply?.text) {
    return res.status(400).json({ success: false, message: 'You have already replied to this review.' });
  }

  review.reply = { text: req.body.text, repliedAt: new Date() };
  await review.save();

  res.json({ success: true, message: 'Reply added.', review });
});

// @desc    Mark review as helpful
// @route   PUT /api/reviews/:id/helpful
// @access  Private
exports.markHelpful = asyncHandler(async (req, res) => {
  const review = await Review.findByIdAndUpdate(
    req.params.id,
    { $inc: { helpfulVotes: 1 } },
    { new: true }
  );
  if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });
  res.json({ success: true, helpfulVotes: review.helpfulVotes });
});

// @desc    Delete a review (reviewer or admin)
// @route   DELETE /api/reviews/:id
// @access  Private
exports.deleteReview = asyncHandler(async (req, res) => {
  const review = await Review.findById(req.params.id);
  if (!review) return res.status(404).json({ success: false, message: 'Review not found.' });

  if (review.reviewer.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized.' });
  }

  await review.deleteOne();
  res.json({ success: true, message: 'Review deleted.' });
});
