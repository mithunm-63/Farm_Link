/**
 * useCrops Hook
 * Manages crop listings state and actions
 */

import { useSelector, useDispatch } from 'react-redux';
import { useCallback, useEffect } from 'react';
import {
  fetchCrops,
  fetchFeaturedCrops,
  fetchCrop,
  fetchMyListings,
  createCrop,
  updateCrop,
  deleteCrop,
  setFilters,
  clearFilters,
  clearCurrentCrop,
} from '../store';
import { cropsAPI } from '../services/api';
import toast from 'react-hot-toast';

const useCrops = ({ autoLoad = false, autoLoadFeatured = false } = {}) => {
  const dispatch = useDispatch();
  const { items, featured, currentCrop, myListings, total, page, pages, loading, error, filters } =
    useSelector((s) => s.crops);

  // Auto-load on mount if requested
  useEffect(() => {
    if (autoLoad) dispatch(fetchCrops(filters));
  }, [autoLoad]);

  useEffect(() => {
    if (autoLoadFeatured) dispatch(fetchFeaturedCrops());
  }, [autoLoadFeatured]);

  const loadCrops = useCallback(
    (params) => dispatch(fetchCrops({ ...filters, ...params })),
    [dispatch, filters]
  );

  const loadFeatured = useCallback(() => dispatch(fetchFeaturedCrops()), [dispatch]);

  const loadCrop = useCallback((id) => dispatch(fetchCrop(id)), [dispatch]);

  const loadMyListings = useCallback(
    (params) => dispatch(fetchMyListings(params)),
    [dispatch]
  );

  const addCrop = useCallback(
    async (data) => {
      try {
        const res = await dispatch(createCrop(data)).unwrap();
        toast.success('Crop listing created! 🌱');
        return res;
      } catch (err) {
        toast.error(err || 'Failed to create listing');
        throw err;
      }
    },
    [dispatch]
  );

  const editCrop = useCallback(
    async (id, data) => {
      try {
        const res = await dispatch(updateCrop({ id, data })).unwrap();
        toast.success('Crop listing updated!');
        return res;
      } catch (err) {
        toast.error(err || 'Failed to update listing');
        throw err;
      }
    },
    [dispatch]
  );

  const removeCrop = useCallback(
    async (id) => {
      try {
        await dispatch(deleteCrop(id)).unwrap();
        toast.success('Crop listing deleted.');
      } catch (err) {
        toast.error(err || 'Failed to delete listing');
        throw err;
      }
    },
    [dispatch]
  );

  const applyFilters = useCallback(
    (newFilters) => dispatch(setFilters(newFilters)),
    [dispatch]
  );

  const resetFilters = useCallback(() => dispatch(clearFilters()), [dispatch]);

  const clearCrop = useCallback(() => dispatch(clearCurrentCrop()), [dispatch]);

  // Stats (farmer only)
  const getFarmerStats = useCallback(() => cropsAPI.getFarmerStats(), []);

  // Active filter count
  const activeFilterCount = Object.values(filters).filter(
    (v) => v && v !== '-createdAt'
  ).length;

  return {
    // State
    crops: items,
    featured,
    currentCrop,
    myListings,
    total,
    page,
    pages,
    loading,
    error,
    filters,
    activeFilterCount,
    // Actions
    loadCrops,
    loadFeatured,
    loadCrop,
    loadMyListings,
    addCrop,
    editCrop,
    removeCrop,
    applyFilters,
    resetFilters,
    clearCrop,
    getFarmerStats,
  };
};

export default useCrops;
