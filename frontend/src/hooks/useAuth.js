/**
 * useAuth Hook
 * Convenient access to auth state and actions
 */

import { useSelector, useDispatch } from 'react-redux';
import { useNavigate } from 'react-router-dom';
import { useCallback } from 'react';
import { logout, loginUser, registerUser, updateProfile, clearError } from '../store';
import toast from 'react-hot-toast';

const useAuth = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { user, token, isAuthenticated, loading, error } = useSelector((s) => s.auth);

  const login = useCallback(
    async (credentials) => {
      try {
        const res = await dispatch(loginUser(credentials)).unwrap();
        toast.success(`Welcome back, ${res.user.name.split(' ')[0]}! 🌾`);
        navigate(res.user.role === 'farmer' ? '/farmer/dashboard' : '/retailer/dashboard');
        return res;
      } catch (err) {
        toast.error(err || 'Login failed');
        throw err;
      }
    },
    [dispatch, navigate]
  );

  const register = useCallback(
    async (userData) => {
      try {
        const res = await dispatch(registerUser(userData)).unwrap();
        toast.success('Account created! Welcome to FarmLink 🎉');
        navigate(res.user.role === 'farmer' ? '/farmer/dashboard' : '/retailer/dashboard');
        return res;
      } catch (err) {
        toast.error(err || 'Registration failed');
        throw err;
      }
    },
    [dispatch, navigate]
  );

  const signOut = useCallback(() => {
    dispatch(logout());
    toast.success('Logged out successfully');
    navigate('/');
  }, [dispatch, navigate]);

  const updateUserProfile = useCallback(
    async (data) => {
      try {
        const res = await dispatch(updateProfile(data)).unwrap();
        toast.success('Profile updated!');
        return res;
      } catch (err) {
        toast.error(err || 'Update failed');
        throw err;
      }
    },
    [dispatch]
  );

  const clearAuthError = useCallback(() => {
    dispatch(clearError());
  }, [dispatch]);

  // Role helpers
  const isFarmer = user?.role === 'farmer';
  const isRetailer = user?.role === 'retailer';
  const isAdmin = user?.role === 'admin';

  // Dashboard link based on role
  const dashboardPath = isFarmer
    ? '/farmer/dashboard'
    : isRetailer
    ? '/retailer/dashboard'
    : '/';

  return {
    user,
    token,
    isAuthenticated,
    loading,
    error,
    isFarmer,
    isRetailer,
    isAdmin,
    dashboardPath,
    login,
    register,
    signOut,
    updateUserProfile,
    clearAuthError,
  };
};

export default useAuth;
