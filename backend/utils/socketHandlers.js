/**
 * Socket.io Event Handlers
 * Real-time notifications and order updates
 */

const User = require('../models/User');

const connectedUsers = new Map(); // userId -> socketId

exports.setupSocketHandlers = (io) => {
  io.on('connection', (socket) => {
    console.log(`🔌 Socket connected: ${socket.id}`);

    // User joins with their userId
    socket.on('join', async (userId) => {
      if (!userId) return;
      connectedUsers.set(userId.toString(), socket.id);
      socket.userId = userId.toString();
      socket.join(`user_${userId}`);

      // Update socketId in DB
      await User.findByIdAndUpdate(userId, { socketId: socket.id, lastSeen: new Date() }).catch(() => {});
      console.log(`👤 User ${userId} joined with socket ${socket.id}`);
    });

    // Handle disconnect
    socket.on('disconnect', async () => {
      if (socket.userId) {
        connectedUsers.delete(socket.userId);
        await User.findByIdAndUpdate(socket.userId, { socketId: null, lastSeen: new Date() }).catch(() => {});
      }
      console.log(`❌ Socket disconnected: ${socket.id}`);
    });

    // Typing indicator for chat (bonus)
    socket.on('typing', ({ roomId, userName }) => {
      socket.to(roomId).emit('user_typing', { userName });
    });

    socket.on('stop_typing', ({ roomId }) => {
      socket.to(roomId).emit('user_stop_typing');
    });
  });

  // Export helper to emit to a specific user
  exports.emitToUser = (userId, event, data) => {
    io.to(`user_${userId}`).emit(event, data);
  };
};

exports.getConnectedUsers = () => connectedUsers;
