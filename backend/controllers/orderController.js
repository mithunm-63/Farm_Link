/**
 * Order Controller
 * Full order lifecycle management
 */

const Order = require('../models/Order');
const Crop = require('../models/Crop');
const User = require('../models/User');
const { asyncHandler } = require('../middleware/errorHandler');
const { createNotification } = require('../utils/notificationHelper');

// @desc    Place a new order
// @route   POST /api/orders
// @access  Private (Retailer)
exports.placeOrder = asyncHandler(async (req, res) => {
  const { cropId, quantity, deliveryAddress, notes, paymentMethod = 'cod' } = req.body;

  // Get crop
  const crop = await Crop.findById(cropId).populate('farmer', 'name socketId');
  if (!crop) {
    return res.status(404).json({ success: false, message: 'Crop listing not found.' });
  }
  if (crop.status !== 'active') {
    return res.status(400).json({ success: false, message: 'This crop listing is no longer available.' });
  }

  // Validate quantity
  const effective = crop.availableQuantity - crop.reservedQuantity;
  if (quantity < crop.minimumOrderQuantity) {
    return res.status(400).json({
      success: false,
      message: `Minimum order quantity is ${crop.minimumOrderQuantity} ${crop.unit}.`,
    });
  }
  if (quantity > effective) {
    return res.status(400).json({
      success: false,
      message: `Only ${effective} ${crop.unit} available.`,
    });
  }

  // Prevent farmer from ordering their own crop
  if (crop.farmer._id.toString() === req.user.id) {
    return res.status(400).json({ success: false, message: 'You cannot order your own crop.' });
  }

  // Reserve quantity
  await Crop.findByIdAndUpdate(cropId, { $inc: { reservedQuantity: quantity } });

  // Calculate pricing
  const pricePerUnit = crop.pricePerUnit;
  const subtotal = pricePerUnit * quantity;
  const shippingCost = crop.shippingAvailable ? crop.shippingCost : 0;
  const totalAmount = subtotal + shippingCost;

  // Create order
  const order = await Order.create({
    retailer: req.user.id,
    farmer: crop.farmer._id,
    crop: cropId,
    cropSnapshot: {
      name: crop.name,
      category: crop.category,
      pricePerUnit: crop.pricePerUnit,
      unit: crop.unit,
      imageUrl: crop.images?.[0]?.url || '',
    },
    quantity,
    pricePerUnit,
    subtotal,
    shippingCost,
    totalAmount,
    deliveryAddress,
    notes,
    payment: { method: paymentMethod },
    statusHistory: [{ status: 'pending', timestamp: new Date() }],
    expectedDeliveryDate: new Date(Date.now() + crop.deliveryDays * 24 * 60 * 60 * 1000),
  });

  await order.populate([
    { path: 'retailer', select: 'name businessName avatar' },
    { path: 'farmer', select: 'name farmName avatar' },
    { path: 'crop', select: 'name images category' },
  ]);

  // Notify farmer via socket and DB
  const io = req.app.get('io');
  await createNotification({
    recipient: crop.farmer._id,
    type: 'order_placed',
    title: 'New Order Received!',
    message: `${req.user.name} ordered ${quantity} ${crop.unit} of ${crop.name}`,
    data: { orderId: order._id, cropId: crop._id },
    io,
    socketId: crop.farmer.socketId,
  });

  res.status(201).json({
    success: true,
    message: 'Order placed successfully! Waiting for farmer to confirm.',
    order,
  });
});

// @desc    Get orders (filtered by role)
// @route   GET /api/orders
// @access  Private
exports.getOrders = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 10 } = req.query;
  const query = {};

  if (req.user.role === 'farmer') {
    query.farmer = req.user.id;
  } else if (req.user.role === 'retailer') {
    query.retailer = req.user.id;
  }

  if (status) query.status = status;

  const total = await Order.countDocuments(query);
  const orders = await Order.find(query)
    .populate('retailer', 'name businessName avatar phone')
    .populate('farmer', 'name farmName avatar phone')
    .populate('crop', 'name images category')
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  res.json({ success: true, total, page: Number(page), pages: Math.ceil(total / Number(limit)), orders });
});

// @desc    Get single order
// @route   GET /api/orders/:id
// @access  Private
exports.getOrder = asyncHandler(async (req, res) => {
  const order = await Order.findById(req.params.id)
    .populate('retailer', 'name businessName avatar phone location')
    .populate('farmer', 'name farmName avatar phone location')
    .populate('crop', 'name images category description');

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  // Verify access
  const isInvolved =
    order.farmer._id.toString() === req.user.id ||
    order.retailer._id.toString() === req.user.id ||
    req.user.role === 'admin';

  if (!isInvolved) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  res.json({ success: true, order });
});

// @desc    Update order status (Farmer: accept/reject; Both: various)
// @route   PUT /api/orders/:id/status
// @access  Private
exports.updateOrderStatus = asyncHandler(async (req, res) => {
  const { status, note, rejectionReason } = req.body;
  const order = await Order.findById(req.params.id)
    .populate('retailer', 'name socketId')
    .populate('farmer', 'name socketId')
    .populate('crop', 'name unit');

  if (!order) {
    return res.status(404).json({ success: false, message: 'Order not found.' });
  }

  // Role-based status transitions
  const farmerTransitions = {
    pending: ['accepted', 'rejected'],
    accepted: ['processing', 'shipped'],
    processing: ['shipped'],
    shipped: ['delivered'],
  };

  const retailerTransitions = {
    pending: ['cancelled'],
    accepted: ['cancelled'],
  };

  const isFarmer = order.farmer._id.toString() === req.user.id;
  const isRetailer = order.retailer._id.toString() === req.user.id;

  if (!isFarmer && !isRetailer) {
    return res.status(403).json({ success: false, message: 'Access denied.' });
  }

  const allowed = isFarmer
    ? farmerTransitions[order.status] || []
    : retailerTransitions[order.status] || [];

  if (!allowed.includes(status)) {
    return res.status(400).json({
      success: false,
      message: `Cannot change status from '${order.status}' to '${status}'.`,
    });
  }

  // Update order
  order.status = status;
  if (note) order.statusHistory[order.statusHistory.length - 1].note = note;
  if (rejectionReason) order.rejectionReason = rejectionReason;
  if (status === 'delivered') order.actualDeliveryDate = new Date();
  if (status === 'cancelled') {
    order.cancelledBy = req.user.id;
    order.cancellationReason = rejectionReason;
    order.cancelledAt = new Date();
  }

  await order.save();

  // Release/adjust crop quantity
  if (['rejected', 'cancelled'].includes(status)) {
    await Crop.findByIdAndUpdate(order.crop._id, {
      $inc: { reservedQuantity: -order.quantity },
    });
  }
  if (status === 'delivered') {
    await Crop.findByIdAndUpdate(order.crop._id, {
      $inc: {
        availableQuantity: -order.quantity,
        reservedQuantity: -order.quantity,
        orderCount: 1,
      },
    });
    // Update farmer stats
    await User.findByIdAndUpdate(order.farmer._id, {
      $inc: { totalRevenue: order.totalAmount, totalTransactions: 1 },
    });
    await User.findByIdAndUpdate(order.retailer._id, {
      $inc: { totalSpent: order.totalAmount, totalTransactions: 1 },
    });
  }

  // Send notifications
  const io = req.app.get('io');
  const notifyUserId = isFarmer ? order.retailer._id : order.farmer._id;
  const notifySocketId = isFarmer ? order.retailer.socketId : order.farmer.socketId;
  const statusMessages = {
    accepted: `Your order for ${order.crop.name} has been accepted!`,
    rejected: `Your order for ${order.crop.name} was rejected.`,
    shipped: `Your order for ${order.crop.name} has been shipped!`,
    delivered: `Your order for ${order.crop.name} has been delivered!`,
    cancelled: `Order for ${order.crop.name} has been cancelled.`,
  };

  await createNotification({
    recipient: notifyUserId,
    type: `order_${status}`,
    title: `Order ${status.charAt(0).toUpperCase() + status.slice(1)}`,
    message: statusMessages[status] || `Order status updated to ${status}`,
    data: { orderId: order._id },
    io,
    socketId: notifySocketId,
  });

  res.json({ success: true, message: `Order ${status} successfully.`, order });
});

// @desc    Get retailer dashboard stats
// @route   GET /api/orders/retailer-stats
// @access  Private (Retailer)
exports.getRetailerStats = asyncHandler(async (req, res) => {
  const [orderStats, spending] = await Promise.all([
    Order.aggregate([
      { $match: { retailer: req.user._id } },
      { $group: { _id: '$status', count: { $sum: 1 }, total: { $sum: '$totalAmount' } } },
    ]),
    Order.aggregate([
      { $match: { retailer: req.user._id, status: 'delivered' } },
      { $group: { _id: null, total: { $sum: '$totalAmount' }, count: { $sum: 1 } } },
    ]),
  ]);

  const recentOrders = await Order.find({ retailer: req.user._id })
    .populate('farmer', 'name farmName avatar')
    .populate('crop', 'name images')
    .sort({ createdAt: -1 })
    .limit(5);

  res.json({
    success: true,
    stats: {
      orders: orderStats.reduce((acc, o) => ({ ...acc, [o._id]: { count: o.count, total: o.total } }), {}),
      spending: spending[0] || { total: 0, count: 0 },
    },
    recentOrders,
  });
});
