/**
 * Redux Store - Redux Toolkit
 */

import { configureStore, createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import { authAPI, cropsAPI, ordersAPI, notificationsAPI } from './services/api';

// ==================== AUTH SLICE ====================
const storedUser = localStorage.getItem('farmlink_user');
const storedToken = localStorage.getItem('farmlink_token');

export const loginUser = createAsyncThunk('auth/login', async (credentials, { rejectWithValue }) => {
  try {
    const data = await authAPI.login(credentials);
    localStorage.setItem('farmlink_token', data.token);
    localStorage.setItem('farmlink_user', JSON.stringify(data.user));
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const registerUser = createAsyncThunk('auth/register', async (userData, { rejectWithValue }) => {
  try {
    const data = await authAPI.register(userData);
    localStorage.setItem('farmlink_token', data.token);
    localStorage.setItem('farmlink_user', JSON.stringify(data.user));
    return data;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const getMe = createAsyncThunk('auth/getMe', async (_, { rejectWithValue }) => {
  try {
    return await authAPI.getMe();
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

export const updateProfile = createAsyncThunk('auth/updateProfile', async (data, { rejectWithValue }) => {
  try {
    const res = await authAPI.updateProfile(data);
    localStorage.setItem('farmlink_user', JSON.stringify(res.user));
    return res;
  } catch (err) {
    return rejectWithValue(err.message);
  }
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: storedUser ? JSON.parse(storedUser) : null,
    token: storedToken || null,
    loading: false,
    error: null,
    isAuthenticated: !!storedToken,
  },
  reducers: {
    logout: (state) => {
      state.user = null;
      state.token = null;
      state.isAuthenticated = false;
      localStorage.removeItem('farmlink_token');
      localStorage.removeItem('farmlink_user');
    },
    clearError: (state) => { state.error = null; },
    setUser: (state, action) => { state.user = action.payload; },
  },
  extraReducers: (builder) => {
    const handlePending = (state) => { state.loading = true; state.error = null; };
    const handleRejected = (state, action) => { state.loading = false; state.error = action.payload; };
    builder
      .addCase(loginUser.pending, handlePending)
      .addCase(loginUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, handleRejected)
      .addCase(registerUser.pending, handlePending)
      .addCase(registerUser.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload.user;
        state.token = action.payload.token;
        state.isAuthenticated = true;
      })
      .addCase(registerUser.rejected, handleRejected)
      .addCase(getMe.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
      })
      .addCase(updateProfile.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.loading = false;
      })
      .addCase(updateProfile.pending, handlePending)
      .addCase(updateProfile.rejected, handleRejected);
  },
});

// ==================== CROPS SLICE ====================
export const fetchCrops = createAsyncThunk('crops/fetchAll', async (params, { rejectWithValue }) => {
  try { return await cropsAPI.getAll(params); }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchFeaturedCrops = createAsyncThunk('crops/featured', async (_, { rejectWithValue }) => {
  try { return await cropsAPI.getFeatured(); }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchCrop = createAsyncThunk('crops/fetchOne', async (id, { rejectWithValue }) => {
  try { return await cropsAPI.getOne(id); }
  catch (err) { return rejectWithValue(err.message); }
});

export const fetchMyListings = createAsyncThunk('crops/myListings', async (params, { rejectWithValue }) => {
  try { return await cropsAPI.getMyListings(params); }
  catch (err) { return rejectWithValue(err.message); }
});

export const createCrop = createAsyncThunk('crops/create', async (data, { rejectWithValue }) => {
  try { return await cropsAPI.create(data); }
  catch (err) { return rejectWithValue(err.message); }
});

export const updateCrop = createAsyncThunk('crops/update', async ({ id, data }, { rejectWithValue }) => {
  try { return await cropsAPI.update(id, data); }
  catch (err) { return rejectWithValue(err.message); }
});

export const deleteCrop = createAsyncThunk('crops/delete', async (id, { rejectWithValue }) => {
  try { await cropsAPI.delete(id); return id; }
  catch (err) { return rejectWithValue(err.message); }
});

const cropsSlice = createSlice({
  name: 'crops',
  initialState: {
    items: [], featured: [], currentCrop: null, myListings: [],
    total: 0, page: 1, pages: 1,
    loading: false, error: null,
    filters: { search: '', category: '', city: '', state: '', minPrice: '', maxPrice: '', isOrganic: '', sort: '-createdAt' },
  },
  reducers: {
    setFilters: (state, action) => { state.filters = { ...state.filters, ...action.payload }; },
    clearFilters: (state) => {
      state.filters = { search: '', category: '', city: '', state: '', minPrice: '', maxPrice: '', isOrganic: '', sort: '-createdAt' };
    },
    clearCurrentCrop: (state) => { state.currentCrop = null; },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCrops.pending, (state) => { state.loading = true; state.error = null; })
      .addCase(fetchCrops.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.crops;
        state.total = action.payload.total;
        state.page = action.payload.page;
        state.pages = action.payload.pages;
      })
      .addCase(fetchCrops.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchFeaturedCrops.fulfilled, (state, action) => { state.featured = action.payload.crops; })
      .addCase(fetchCrop.pending, (state) => { state.loading = true; })
      .addCase(fetchCrop.fulfilled, (state, action) => { state.loading = false; state.currentCrop = action.payload.crop; })
      .addCase(fetchCrop.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(fetchMyListings.fulfilled, (state, action) => { state.myListings = action.payload.crops; })
      .addCase(createCrop.fulfilled, (state, action) => { state.myListings.unshift(action.payload.crop); })
      .addCase(deleteCrop.fulfilled, (state, action) => {
        state.myListings = state.myListings.filter((c) => c._id !== action.payload);
      });
  },
});

// ==================== ORDERS SLICE ====================
export const fetchOrders = createAsyncThunk('orders/fetchAll', async (params, { rejectWithValue }) => {
  try { return await ordersAPI.getAll(params); }
  catch (err) { return rejectWithValue(err.message); }
});

export const placeOrder = createAsyncThunk('orders/place', async (data, { rejectWithValue }) => {
  try { return await ordersAPI.place(data); }
  catch (err) { return rejectWithValue(err.message); }
});

export const updateOrderStatus = createAsyncThunk('orders/updateStatus', async ({ id, data }, { rejectWithValue }) => {
  try { return await ordersAPI.updateStatus(id, data); }
  catch (err) { return rejectWithValue(err.message); }
});

const ordersSlice = createSlice({
  name: 'orders',
  initialState: { items: [], total: 0, loading: false, error: null },
  reducers: {
    addOrder: (state, action) => { state.items.unshift(action.payload); },
    updateOrder: (state, action) => {
      const idx = state.items.findIndex((o) => o._id === action.payload._id);
      if (idx !== -1) state.items[idx] = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchOrders.pending, (state) => { state.loading = true; })
      .addCase(fetchOrders.fulfilled, (state, action) => {
        state.loading = false;
        state.items = action.payload.orders;
        state.total = action.payload.total;
      })
      .addCase(fetchOrders.rejected, (state, action) => { state.loading = false; state.error = action.payload; })
      .addCase(placeOrder.fulfilled, (state, action) => { state.items.unshift(action.payload.order); })
      .addCase(updateOrderStatus.fulfilled, (state, action) => {
        const idx = state.items.findIndex((o) => o._id === action.payload.order._id);
        if (idx !== -1) state.items[idx] = action.payload.order;
      });
  },
});

// ==================== NOTIFICATIONS SLICE ====================
const notificationsSlice = createSlice({
  name: 'notifications',
  initialState: { items: [], unreadCount: 0 },
  reducers: {
    addNotification: (state, action) => {
      state.items.unshift(action.payload);
      state.unreadCount += 1;
    },
    setNotifications: (state, action) => {
      state.items = action.payload.notifications;
      state.unreadCount = action.payload.unreadCount;
    },
    markRead: (state, action) => {
      const n = state.items.find((n) => n._id === action.payload);
      if (n && !n.isRead) { n.isRead = true; state.unreadCount = Math.max(0, state.unreadCount - 1); }
    },
    markAllRead: (state) => {
      state.items.forEach((n) => { n.isRead = true; });
      state.unreadCount = 0;
    },
  },
});

// ==================== STORE ====================
export const store = configureStore({
  reducer: {
    auth: authSlice.reducer,
    crops: cropsSlice.reducer,
    orders: ordersSlice.reducer,
    notifications: notificationsSlice.reducer,
  },
});

export const { logout, clearError, setUser } = authSlice.actions;
export const { setFilters, clearFilters, clearCurrentCrop } = cropsSlice.actions;
export const { addOrder, updateOrder } = ordersSlice.actions;
export const { addNotification, setNotifications, markRead, markAllRead } = notificationsSlice.actions;

export default store;
