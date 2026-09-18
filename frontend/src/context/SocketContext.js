/**
 * Socket Context - Real-time connection
 */

import React, { createContext, useContext, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { useDispatch, useSelector } from 'react-redux';
import { addNotification } from '../store';
import toast from 'react-hot-toast';

const SocketContext = createContext(null);

export const SocketProvider = ({ children }) => {
  const socketRef = useRef(null);
  const dispatch = useDispatch();
  const { user, isAuthenticated } = useSelector((s) => s.auth);

  useEffect(() => {
    if (!isAuthenticated || !user) return;

    const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';
    socketRef.current = io(SOCKET_URL, {
      transports: ['websocket', 'polling'],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
    });

    const socket = socketRef.current;

    socket.on('connect', () => {
      socket.emit('join', user._id);
    });

    socket.on('notification', (notification) => {
      dispatch(addNotification(notification));
      // Show toast
      const icons = {
        order_placed: '🛒',
        order_accepted: '✅',
        order_rejected: '❌',
        order_shipped: '🚚',
        order_delivered: '📦',
        payment_received: '💰',
      };
      toast(notification.message, {
        icon: icons[notification.type] || '🔔',
        duration: 5000,
        style: {
          background: '#1a2e1a',
          color: '#e8f5e9',
          border: '1px solid #4caf50',
          borderRadius: '12px',
        },
      });
    });

    socket.on('order_update', (data) => {
      toast.success(`Order ${data.orderNumber}: ${data.status}`);
    });

    socket.on('disconnect', () => {
      console.log('Socket disconnected');
    });

    socket.on('connect_error', (err) => {
      console.error('Socket connection error:', err.message);
    });

    return () => {
      socket.disconnect();
    };
  }, [isAuthenticated, user, dispatch]);

  return (
    <SocketContext.Provider value={socketRef.current}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => useContext(SocketContext);
export default SocketContext;
