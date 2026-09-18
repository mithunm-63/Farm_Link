/**
 * User Controller
 * Public profiles, admin user management
 */

const User = require('../models/User');
const Crop = require('../models/Crop');
const Order = require('../models/Order');
const Review = require('../models/Review');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get all farmers (public listing)
// @route   GET /api/users/farmers
// @access  Public
exports.getFarmers = asyncHandler(async (req, res) => {
  const {
    city, state, farmingType, minRating,
    page = 1, limit = 12, sort = '-rating.average',
  } = req.query;

  const query = { role: 'farmer', isActive: true };
  if (city) query['location.city'] = new RegExp(city, 'i');
  if (state) query['location.state'] = new RegExp(state, 'i');
  if (farmingType) query.farmingType = farmingType;
  if (minRating) query['rating.average'] = { $gte: Number(minRating) };

  const total = await User.countDocuments(query);
  const farmers = await User.find(query)
    .select('name farmName location rating avatar cropTypes farmingType totalTransactions yearsOfExperience')
    .sort(sort)
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  res.json({
    success: true,
    total,
    page: Number(page),
    pages: Math.ceil(total / Number(limit)),
    farmers,
  });
});

// @desc    Get all retailers (for farmers to see buyers)
// @route   GET /api/users/retailers
// @access  Private (Farmer)
exports.getRetailers = asyncHandler(async (req, res) => {
  const { city, state, businessType, page = 1, limit = 12 } = req.query;

  const query = { role: 'retailer', isActive: true };
  if (city) query['location.city'] = new RegExp(city, 'i');
  if (state) query['location.state'] = new RegExp(state, 'i');
  if (businessType) query.businessType = businessType;

  const total = await User.countDocuments(query);
  const retailers = await User.find(query)
    .select('name businessName businessType location rating avatar totalTransactions')
    .sort('-rating.average')
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  res.json({ success: true, total, retailers });
});

// @desc    Get a single user's public profile
// @route   GET /api/users/:id
// @access  Public
exports.getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select(
    '-password -verificationToken -verificationTokenExpiry -resetPasswordToken -resetPasswordExpiry -socketId -__v'
  );

  if (!user || !user.isActive) {
    return res.status(404).json({ success: false, message: 'User not found.' });
  }

  // Get extra context depending on role
  let extra = {};

  if (user.role === 'farmer') {
    const [activeListings, completedOrders, reviews] = await Promise.all([
      Crop.countDocuments({ farmer: user._id, status: 'active' }),
      Order.countDocuments({ farmer: user._id, status: 'delivered' }),
      Review.find({ reviewee: user._id }).populate('reviewer', 'name avatar').limit(5).sort('-createdAt'),
    ]);
    extra = { activeListings, completedOrders, recentReviews: reviews };
  } else {
    const [completedOrders, reviews] = await Promise.all([
      Order.countDocuments({ retailer: user._id, status: 'delivered' }),
      Review.find({ reviewee: user._id }).populate('reviewer', 'name avatar').limit(5).sort('-createdAt'),
    ]);
    extra = { completedOrders, recentReviews: reviews };
  }

  res.json({ success: true, user, ...extra });
});

// @desc    Update avatar
// @route   PUT /api/users/avatar
// @access  Private
exports.updateAvatar = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No image file provided.' });
  }

  const { path: url, filename: public_id } = req.file;

  const user = await User.findByIdAndUpdate(
    req.user.id,
    { avatar: { url, public_id } },
    { new: true }
  );

  res.json({ success: true, message: 'Avatar updated.', avatar: user.avatar });
});

// @desc    Search users (farmers + retailers)
// @route   GET /api/users/search
// @access  Public
exports.searchUsers = asyncHandler(async (req, res) => {
  const { q, role } = req.query;

  if (!q || q.trim().length < 2) {
    return res.status(400).json({ success: false, message: 'Search query must be at least 2 characters.' });
  }

  const query = {
    isActive: true,
    $or: [
      { name: new RegExp(q, 'i') },
      { farmName: new RegExp(q, 'i') },
      { businessName: new RegExp(q, 'i') },
      { 'location.city': new RegExp(q, 'i') },
    ],
  };

  if (role) query.role = role;

  const users = await User.find(query)
    .select('name role farmName businessName location avatar rating')
    .limit(20);

  res.json({ success: true, users });
});

// @desc    Get user stats (admin)
// @route   GET /api/users/admin/stats
// @access  Private (Admin)
exports.getAdminStats = asyncHandler(async (req, res) => {
  const [totalUsers, farmers, retailers, totalCrops, totalOrders, revenue] = await Promise.all([
    User.countDocuments({ isActive: true }),
    User.countDocuments({ role: 'farmer', isActive: true }),
    User.countDocuments({ role: 'retailer', isActive: true }),
    Crop.countDocuments({ status: 'active' }),
    Order.countDocuments(),
    Order.aggregate([
      { $match: { status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' } } },
    ]),
  ]);

  res.json({
    success: true,
    stats: {
      totalUsers, farmers, retailers,
      totalCrops, totalOrders,
      totalRevenue: revenue[0]?.total || 0,
    },
  });
});

// @desc    Deactivate user (admin)
// @route   PUT /api/users/:id/deactivate
// @access  Private (Admin)
exports.deactivateUser = asyncHandler(async (req, res) => {
  const user = await User.findByIdAndUpdate(req.params.id, { isActive: false }, { new: true });
  if (!user) return res.status(404).json({ success: false, message: 'User not found.' });
  res.json({ success: true, message: `User ${user.name} deactivated.` });
});
