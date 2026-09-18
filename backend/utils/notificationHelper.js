/**
 * Notification Helper
 * Creates DB notification + emits socket event
 */

const Notification = require('../models/Notification');

exports.createNotification = async ({ recipient, type, title, message, data = {}, io, socketId }) => {
  try {
    const notification = await Notification.create({ recipient, type, title, message, data });

    // Emit real-time via socket
    if (io) {
      io.to(`user_${recipient}`).emit('notification', {
        ...notification.toObject(),
        isNew: true,
      });
    }

    return notification;
  } catch (err) {
    console.error('Failed to create notification:', err.message);
  }
};
