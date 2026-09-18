/**
 * Notification Model
 */

const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema(
  {
    recipient: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    type: {
      type: String,
      enum: [
        'order_placed',
        'order_accepted',
        'order_rejected',
        'order_shipped',
        'order_delivered',
        'order_cancelled',
        'new_review',
        'payment_received',
        'crop_sold_out',
        'price_alert',
        'message',
        'system',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    data: {
      orderId: { type: mongoose.Schema.Types.ObjectId, ref: 'Order' },
      cropId: { type: mongoose.Schema.Types.ObjectId, ref: 'Crop' },
      userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      url: String,
    },
    isRead: { type: Boolean, default: false },
    readAt: Date,
  },
  { timestamps: true }
);

notificationSchema.index({ recipient: 1, isRead: 1 });
notificationSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Notification', notificationSchema);
