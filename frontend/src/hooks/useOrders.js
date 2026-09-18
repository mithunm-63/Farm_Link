/**
 * useOrders Hook
 * Manages order state and lifecycle actions
 */

import { useSelector, useDispatch } from 'react-redux';
import { useCallback } from 'react';
import {
  fetchOrders,
  placeOrder,
  updateOrderStatus,
  addOrder,
  updateOrder,
} from '../store';
import { ordersAPI } from '../services/api';
import toast from 'react-hot-toast';

const useOrders = () => {
  const dispatch = useDispatch();
  const { items: orders, total, loading, error } = useSelector((s) => s.orders);
  const { user } = useSelector((s) => s.auth);

  const loadOrders = useCallback(
    (params) => dispatch(fetchOrders(params)),
    [dispatch]
  );

  const submitOrder = useCallback(
    async (orderData) => {
      try {
        const res = await dispatch(placeOrder(orderData)).unwrap();
        toast.success('Order placed! Waiting for farmer confirmation. 🛒');
        return res;
      } catch (err) {
        toast.error(err || 'Failed to place order');
        throw err;
      }
    },
    [dispatch]
  );

  const changeStatus = useCallback(
    async (id, status, note) => {
      try {
        const res = await dispatch(
          updateOrderStatus({ id, data: { status, rejectionReason: note } })
        ).unwrap();

        const messages = {
          accepted: '✅ Order accepted!',
          rejected: '❌ Order rejected.',
          shipped: '🚚 Order marked as shipped!',
          delivered: '📦 Order marked as delivered!',
          cancelled: '🚫 Order cancelled.',
        };
        toast.success(messages[status] || `Order ${status}`);
        return res;
      } catch (err) {
        toast.error(err || 'Failed to update order');
        throw err;
      }
    },
    [dispatch]
  );

  const getOrder = useCallback((id) => ordersAPI.getOne(id), []);

  const getStats = useCallback(() => {
    if (user?.role === 'farmer') return ordersAPI.getAll({ limit: 0 }); // use from store
    return ordersAPI.getRetailerStats();
  }, [user]);

  // Derived counts
  const pendingOrders = orders.filter((o) => o.status === 'pending');
  const activeOrders = orders.filter((o) =>
    ['accepted', 'processing', 'shipped'].includes(o.status)
  );
  const completedOrders = orders.filter((o) => o.status === 'delivered');
  const cancelledOrders = orders.filter((o) =>
    ['cancelled', 'rejected'].includes(o.status)
  );

  const ordersByStatus = (status) =>
    status ? orders.filter((o) => o.status === status) : orders;

  // Total spent / earned
  const totalAmount = completedOrders.reduce((sum, o) => sum + o.totalAmount, 0);

  return {
    orders,
    total,
    loading,
    error,
    pendingOrders,
    activeOrders,
    completedOrders,
    cancelledOrders,
    totalAmount,
    ordersByStatus,
    loadOrders,
    submitOrder,
    changeStatus,
    getOrder,
    getStats,
  };
};

export default useOrders;
