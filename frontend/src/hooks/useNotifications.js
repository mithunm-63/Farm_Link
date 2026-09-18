/**
 * useNotifications Hook
 * Real-time notifications with Socket.io + polling fallback
 */

import { useEffect, useCallback } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { setNotifications, markRead, markAllRead } from '../store';
import { notificationsAPI } from '../services/api';

const POLL_INTERVAL = 30000; // 30 seconds fallback polling

const useNotifications = ({ enablePolling = true } = {}) => {
  const dispatch = useDispatch();
  const { items: notifications, unreadCount } = useSelector((s) => s.notifications);

  // Initial load
  const loadNotifications = useCallback(
    async (params = {}) => {
      try {
        const data = await notificationsAPI.getAll({ limit: 20, ...params });
        dispatch(setNotifications(data));
      } catch {
        // fail silently
      }
    },
    [dispatch]
  );

  // Polling fallback when socket is unavailable
  useEffect(() => {
    loadNotifications();
    if (!enablePolling) return;
    const interval = setInterval(() => loadNotifications(), POLL_INTERVAL);
    return () => clearInterval(interval);
  }, [loadNotifications, enablePolling]);

  const markAsRead = useCallback(
    async (id) => {
      dispatch(markRead(id));
      try {
        await notificationsAPI.markRead(id);
      } catch {
        // optimistic update already applied
      }
    },
    [dispatch]
  );

  const markAllAsRead = useCallback(async () => {
    dispatch(markAllRead());
    try {
      await notificationsAPI.markAllRead();
    } catch {
      // optimistic update already applied
    }
  }, [dispatch]);

  const deleteNotification = useCallback(
    async (id) => {
      try {
        await notificationsAPI.delete(id);
        await loadNotifications();
      } catch {
        //
      }
    },
    [loadNotifications]
  );

  return {
    notifications,
    unreadCount,
    loadNotifications,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  };
};

export default useNotifications;
