/**
 * Messages / Chat Routes
 * Direct messaging between farmers and retailers
 */

const express = require('express');
const router = express.Router();
const Message = require('../models/Message');
const User = require('../models/User');
const { protect } = require('../middleware/auth');
const { asyncHandler } = require('../middleware/errorHandler');

// @desc    Get conversation between two users
// @route   GET /api/messages/:userId
// @access  Private
router.get('/:userId', protect, asyncHandler(async (req, res) => {
  const { page = 1, limit = 30 } = req.query;
  const room = Message.getRoomId(req.user.id, req.params.userId);

  const total = await Message.countDocuments({ room, isDeleted: false });
  const messages = await Message.find({ room, isDeleted: false })
    .populate('sender', 'name avatar')
    .sort({ createdAt: -1 })
    .skip((Number(page) - 1) * Number(limit))
    .limit(Number(limit));

  // Mark messages as read
  await Message.updateMany(
    { room, recipient: req.user.id, isRead: false },
    { isRead: true, readAt: new Date() }
  );

  res.json({
    success: true,
    total,
    messages: messages.reverse(), // chronological order
  });
}));

// @desc    Get all conversations for current user
// @route   GET /api/messages
// @access  Private
router.get('/', protect, asyncHandler(async (req, res) => {
  // Get the last message from each room the user is part of
  const conversations = await Message.aggregate([
    {
      $match: {
        $or: [
          { sender: req.user._id },
          { recipient: req.user._id },
        ],
        isDeleted: false,
      },
    },
    { $sort: { createdAt: -1 } },
    {
      $group: {
        _id: '$room',
        lastMessage: { $first: '$$ROOT' },
        unreadCount: {
          $sum: {
            $cond: [
              { $and: [{ $eq: ['$recipient', req.user._id] }, { $eq: ['$isRead', false] }] },
              1, 0,
            ],
          },
        },
      },
    },
    { $sort: { 'lastMessage.createdAt': -1 } },
    { $limit: 20 },
  ]);

  // Populate the other user's details
  const populated = await Promise.all(
    conversations.map(async (conv) => {
      const otherUserId = conv.lastMessage.sender.toString() === req.user.id
        ? conv.lastMessage.recipient
        : conv.lastMessage.sender;

      const otherUser = await User.findById(otherUserId)
        .select('name avatar role farmName businessName');

      return { ...conv, otherUser };
    })
  );

  res.json({ success: true, conversations: populated });
}));

// @desc    Send a message
// @route   POST /api/messages
// @access  Private
router.post('/', protect, asyncHandler(async (req, res) => {
  const { recipientId, content, orderId } = req.body;

  if (!recipientId || !content?.trim()) {
    return res.status(400).json({ success: false, message: 'Recipient and content are required.' });
  }

  const recipient = await User.findById(recipientId);
  if (!recipient) {
    return res.status(404).json({ success: false, message: 'Recipient not found.' });
  }

  const room = orderId
    ? Message.getOrderRoomId(orderId)
    : Message.getRoomId(req.user.id, recipientId);

  const message = await Message.create({
    room,
    order: orderId || undefined,
    sender: req.user.id,
    recipient: recipientId,
    content: content.trim(),
  });

  await message.populate('sender', 'name avatar');

  // Emit via socket
  const io = req.app.get('io');
  if (io) {
    io.to(`user_${recipientId}`).emit('new_message', message);
  }

  res.status(201).json({ success: true, message });
}));

// @desc    Delete a message (soft delete)
// @route   DELETE /api/messages/:id
// @access  Private
router.delete('/:id', protect, asyncHandler(async (req, res) => {
  const message = await Message.findOne({ _id: req.params.id, sender: req.user.id });
  if (!message) {
    return res.status(404).json({ success: false, message: 'Message not found.' });
  }

  message.isDeleted = true;
  message.deletedAt = new Date();
  message.content = 'This message was deleted.';
  await message.save();

  res.json({ success: true, message: 'Message deleted.' });
}));

module.exports = router;
