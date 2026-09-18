/**
 * Crop Controller
 * CRUD for crop listings
 */

const Crop = require('../models/Crop');
const Order = require('../models/Order');
const { asyncHandler } = require('../middleware/errorHandler');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Get all crops with filters
// @route   GET /api/crops
// @access  Public
exports.getCrops = asyncHandler(async (req, res) => {
  const {
    search, category, city, state, minPrice, maxPrice, isOrganic,
    unit, grade, page = 1, limit = 12, sort = '-createdAt', farmer,
  } = req.query;

  const query = { status: 'active' };

  // Text search
  if (search) {
    query.$text = { $search: search };
  }

  // Filters
  if (category) query.category = category;
  if (city) query['location.city'] = new RegExp(city, 'i');
  if (state) query['location.state'] = new RegExp(state, 'i');
  if (isOrganic === 'true') query.isOrganic = true;
  if (unit) query.unit = unit;
  if (grade) query.grade = grade;
  if (farmer) query.farmer = farmer;

  if (minPrice || maxPrice) {
    query.pricePerUnit = {};
    if (minPrice) query.pricePerUnit.$gte = Number(minPrice);
    if (maxPrice) query.pricePerUnit.$lte = Number(maxPrice);
  }

  // Count for pagination
  const total = await Crop.countDocuments(query);
  const pageNum = Math.max(1, Number(page));
  const limitNum = Math.min(50, Math.max(1, Number(limit)));
  const skip = (pageNum - 1) * limitNum;

  // Sort options
  const sortMap = {
    '-createdAt': { createdAt: -1 },
    'pricePerUnit': { pricePerUnit: 1 },
    '-pricePerUnit': { pricePerUnit: -1 },
    '-rating': { 'rating.average': -1 },
    '-views': { views: -1 },
  };
  const sortQuery = sortMap[sort] || { createdAt: -1 };

  const crops = await Crop.find(query)
    .populate('farmer', 'name farmName location rating avatar')
    .sort(sortQuery)
    .skip(skip)
    .limit(limitNum)
    .lean();

  res.json({
    success: true,
    total,
    page: pageNum,
    pages: Math.ceil(total / limitNum),
    count: crops.length,
    crops,
  });
});

// @desc    Get single crop
// @route   GET /api/crops/:id
// @access  Public
exports.getCrop = asyncHandler(async (req, res) => {
  const crop = await Crop.findById(req.params.id)
    .populate('farmer', 'name farmName location rating avatar phone cropTypes farmingType yearsOfExperience');

  if (!crop) {
    return res.status(404).json({ success: false, message: 'Crop listing not found.' });
  }

  // Increment view count
  await Crop.findByIdAndUpdate(req.params.id, { $inc: { views: 1 } });

  res.json({ success: true, crop });
});

// @desc    Create crop listing
// @route   POST /api/crops
// @access  Private (Farmer)
exports.createCrop = asyncHandler(async (req, res) => {
  req.body.farmer = req.user.id;

  // Handle image uploads
  if (req.body.images && req.body.images.length > 0) {
    req.body.images[0].isMain = true;
  }

  const crop = await Crop.create(req.body);
  await crop.populate('farmer', 'name farmName location avatar');

  res.status(201).json({
    success: true,
    message: 'Crop listing created successfully!',
    crop,
  });
});

// @desc    Update crop listing
// @route   PUT /api/crops/:id
// @access  Private (Farmer - owner only)
exports.updateCrop = asyncHandler(async (req, res) => {
  let crop = await Crop.findById(req.params.id);

  if (!crop) {
    return res.status(404).json({ success: false, message: 'Crop listing not found.' });
  }

  // Ensure farmer owns this crop
  if (crop.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to update this listing.' });
  }

  // Prevent editing certain fields after orders exist
  const forbiddenUpdates = [];
  if (req.body.pricePerUnit !== undefined && crop.orderCount > 0) {
    forbiddenUpdates.push('pricePerUnit (orders exist)');
  }
  if (forbiddenUpdates.length > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot update: ${forbiddenUpdates.join(', ')}`,
    });
  }

  crop = await Crop.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  }).populate('farmer', 'name farmName location avatar');

  res.json({ success: true, message: 'Crop listing updated.', crop });
});

// @desc    Delete crop listing
// @route   DELETE /api/crops/:id
// @access  Private (Farmer - owner only)
exports.deleteCrop = asyncHandler(async (req, res) => {
  const crop = await Crop.findById(req.params.id);

  if (!crop) {
    return res.status(404).json({ success: false, message: 'Crop listing not found.' });
  }

  if (crop.farmer.toString() !== req.user.id && req.user.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Not authorized to delete this listing.' });
  }

  // Check for active orders
  const activeOrders = await Order.countDocuments({
    crop: req.params.id,
    status: { $in: ['pending', 'accepted', 'processing', 'shipped'] },
  });

  if (activeOrders > 0) {
    return res.status(400).json({
      success: false,
      message: `Cannot delete: ${activeOrders} active order(s) exist for this crop.`,
    });
  }

  await crop.deleteOne();
  res.json({ success: true, message: 'Crop listing deleted successfully.' });
});

// @desc    Get farmer's own crops
// @route   GET /api/crops/my-listings
// @access  Private (Farmer)
exports.getMyListings = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = { farmer: req.user.id };
  if (status) query.status = status;

  const total = await Crop.countDocuments(query);
  const crops = await Crop.find(query)
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  res.json({ success: true, total, crops });
});

// @desc    Get farmer dashboard stats
// @route   GET /api/crops/farmer-stats
// @access  Private (Farmer)
exports.getFarmerStats = asyncHandler(async (req, res) => {
  const farmerId = req.user.id;

  const [listings, orders, revenue] = await Promise.all([
    Crop.aggregate([
      { $match: { farmer: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 } } },
    ]),
    Order.aggregate([
      { $match: { farmer: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } },
    ]),
    Order.aggregate([
      { $match: { farmer: req.user._id, status: 'delivered', 'payment.status': 'paid' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]),
  ]);

  const recentOrders = await Order.find({ farmer: req.user._id })
    .populate('retailer', 'name businessName avatar')
    .populate('crop', 'name images')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    success: true,
    stats: {
      listings: listings.reduce((acc, l) => ({ ...acc, [l._id]: l.count }), {}),
      orders: orders.reduce((acc, o) => ({ ...acc, [o._id]: { count: o.count, total: o.total } }), {}),
      revenue: revenue[0] || { total: 0, count: 0 },
    },
    recentOrders,
  });
});

// @desc    Get featured/recommended crops
// @route   GET /api/crops/featured
// @access  Public
exports.getFeaturedCrops = asyncHandler(async (req, res) => {
  const crops = await Crop.find({ status: 'active', isFeatured: true })
    .populate('farmer', 'name farmName location avatar')
    .limit(8)
    .lean();

  res.json({ success: true, crops });
});
