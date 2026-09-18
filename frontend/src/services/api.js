/**
 * Axios API Service
 * Centralized HTTP client with interceptors
 */

import axios from 'axios';
import toast from 'react-hot-toast';

const API_URL = process.env.REACT_APP_API_URL || '/api';

const api = axios.create({
  baseURL: API_URL,
  timeout: 15000,
  headers: { 'Content-Type': 'application/json' },
});

// Request interceptor - attach JWT
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('farmlink_token');
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor - global error handling
api.interceptors.response.use(
  (response) => response.data,
  (error) => {
    const message = error.response?.data?.message || 'Something went wrong. Please try again.';
    
    if (error.response?.status === 401) {
      localStorage.removeItem('farmlink_token');
      localStorage.removeItem('farmlink_user');
      window.location.href = '/login';
      toast.error('Session expired. Please login again.');
    } else if (error.response?.status !== 422) {
      // Don't auto-toast validation errors
    }

    return Promise.reject({ message, status: error.response?.status });
  }
);

// ========== Auth API ==========
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateProfile: (data) => api.put('/auth/profile', data),
  changePassword: (data) => api.put('/auth/change-password', data),
  forgotPassword: (email) => api.post('/auth/forgot-password', { email }),
  resetPassword: (token, password) => api.put(`/auth/reset-password/${token}`, { password }),
};

// ========== Crops API ==========
export const cropsAPI = {
  getAll: (params) => api.get('/crops', { params }),
  getFeatured: () => api.get('/crops/featured'),
  getOne: (id) => api.get(`/crops/${id}`),
  getMyListings: (params) => api.get('/crops/my-listings', { params }),
  getFarmerStats: () => api.get('/crops/farmer-stats'),
  create: (data) => api.post('/crops', data),
  update: (id, data) => api.put(`/crops/${id}`, data),
  delete: (id) => api.delete(`/crops/${id}`),
};

// ========== Orders API ==========
export const ordersAPI = {
  place: (data) => api.post('/orders', data),
  getAll: (params) => api.get('/orders', { params }),
  getOne: (id) => api.get(`/orders/${id}`),
  updateStatus: (id, data) => api.put(`/orders/${id}/status`, data),
  getRetailerStats: () => api.get('/orders/retailer-stats'),
};

// ========== Reviews API ==========
export const reviewsAPI = {
  getAll: (params) => api.get('/reviews', { params }),
  create: (data) => api.post('/reviews', data),
};

// ========== Users API ==========
export const usersAPI = {
  getFarmers: (params) => api.get('/users/farmers', { params }),
  getOne: (id) => api.get(`/users/${id}`),
};

// ========== Notifications API ==========
export const notificationsAPI = {
  getAll: (params) => api.get('/notifications', { params }),
  markRead: (id) => api.put(`/notifications/${id}/read`),
  markAllRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// ========== Uploads API ==========
export const uploadsAPI = {
  uploadImage: (formData) =>
    api.post('/uploads/image', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
  uploadImages: (formData) =>
    api.post('/uploads/images', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),
};

export default api;
