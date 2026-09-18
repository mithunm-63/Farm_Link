/**
 * Message Model
 * Direct messaging between farmers and retailers
 * (Bonus feature - tied to a specific order)
 */

const mongoose = require('mongoose');

const messageSchema = new mongoose.Schema(
  {
    // Room is identified by a sorted pair of userIds, or an orderId
    room: {
      type: String,
      required: true,
      index: true,
      // Format: "userId1_userId2" (sorted) or "order_orderId"
    },
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    content: {
      type: String,
      required: [true, 'Message content is required'],
      maxlength: [2000, 'Message cannot exceed 2000 characters'],
      trim: true,
    },
    type: {
      type: String,
      enum: ['text', 'image', 'file', 'system'],
      default: 'text',
    },
    attachment: {
      url: String,
      public_id: String,
      filename: String,
      size: Number,
    },
    isRead: {
      type: Boolean,
      default: false,
    },
    readAt: Date,
    isDeleted: {
      type: Boolean,
      default: false,
    },
    deletedAt: Date,
  },
  {
    timestamps: true,
  }
);

// Static: generate room ID from two user IDs (always consistent order)
messageSchema.statics.getRoomId = function (userId1, userId2) {
  return [userId1.toString(), userId2.toString()].sort().join('_');
};

// Static: generate order room ID
messageSchema.statics.getOrderRoomId = function (orderId) {
  return `order_${orderId}`;
};

messageSchema.index({ room: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ recipient: 1, isRead: 1 });

module.exports = mongoose.model('Message', messageSchema);
