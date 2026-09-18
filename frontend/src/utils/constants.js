/**
 * Application Constants
 * Shared enums, config values, and static data
 */

// ── API ───────────────────────────────────────────────────────
export const API_URL = process.env.REACT_APP_API_URL || '/api';
export const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

// ── Roles ─────────────────────────────────────────────────────
export const ROLES = {
  FARMER: 'farmer',
  RETAILER: 'retailer',
  ADMIN: 'admin',
};

// ── Crop categories ───────────────────────────────────────────
export const CROP_CATEGORIES = [
  { value: 'vegetables', label: 'Vegetables',  emoji: '🥬' },
  { value: 'fruits',     label: 'Fruits',      emoji: '🍎' },
  { value: 'grains',     label: 'Grains',      emoji: '🌾' },
  { value: 'pulses',     label: 'Pulses',      emoji: '🫘' },
  { value: 'spices',     label: 'Spices',      emoji: '🌶️' },
  { value: 'dairy',      label: 'Dairy',       emoji: '🥛' },
  { value: 'poultry',    label: 'Poultry',     emoji: '🐓' },
  { value: 'herbs',      label: 'Herbs',       emoji: '🌿' },
  { value: 'oilseeds',   label: 'Oilseeds',    emoji: '🌻' },
  { value: 'other',      label: 'Other',       emoji: '🌱' },
];

// ── Crop units ────────────────────────────────────────────────
export const CROP_UNITS = [
  { value: 'kg',      label: 'Kilogram (kg)' },
  { value: 'quintal', label: 'Quintal (100 kg)' },
  { value: 'ton',     label: 'Metric Ton' },
  { value: 'dozen',   label: 'Dozen' },
  { value: 'piece',   label: 'Piece' },
  { value: 'liter',   label: 'Liter' },
  { value: 'bundle',  label: 'Bundle' },
];

// ── Crop grades ───────────────────────────────────────────────
export const CROP_GRADES = [
  { value: 'premium',  label: '⭐ Premium' },
  { value: 'A',        label: 'Grade A' },
  { value: 'B',        label: 'Grade B' },
  { value: 'C',        label: 'Grade C' },
  { value: 'standard', label: 'Standard' },
];

// ── Farming types ─────────────────────────────────────────────
export const FARMING_TYPES = [
  { value: 'organic',      label: '🌿 Organic' },
  { value: 'conventional', label: '🌾 Conventional' },
  { value: 'mixed',        label: '🌱 Mixed' },
];

// ── Business types ────────────────────────────────────────────
export const BUSINESS_TYPES = [
  { value: 'restaurant',  label: '🍽️ Restaurant' },
  { value: 'grocery',     label: '🛒 Grocery Store' },
  { value: 'supermarket', label: '🏬 Supermarket' },
  { value: 'wholesaler',  label: '📦 Wholesaler' },
  { value: 'other',       label: '💼 Other' },
];

// ── Order statuses ────────────────────────────────────────────
export const ORDER_STATUSES = [
  { value: 'pending',    label: 'Pending',    emoji: '⏳' },
  { value: 'accepted',   label: 'Accepted',   emoji: '✅' },
  { value: 'rejected',   label: 'Rejected',   emoji: '❌' },
  { value: 'processing', label: 'Processing', emoji: '🔄' },
  { value: 'shipped',    label: 'Shipped',    emoji: '🚚' },
  { value: 'delivered',  label: 'Delivered',  emoji: '📦' },
  { value: 'cancelled',  label: 'Cancelled',  emoji: '🚫' },
];

// Transitions: which statuses a farmer can move to from current
export const FARMER_STATUS_TRANSITIONS = {
  pending:    ['accepted', 'rejected'],
  accepted:   ['shipped'],
  shipped:    ['delivered'],
};

// Transitions: which statuses a retailer can move to
export const RETAILER_STATUS_TRANSITIONS = {
  pending:  ['cancelled'],
  accepted: ['cancelled'],
};

// ── Payment methods ───────────────────────────────────────────
export const PAYMENT_METHODS = [
  { value: 'cod',           label: '💵 Cash on Delivery' },
  { value: 'online',        label: '💳 Online Payment' },
  { value: 'bank_transfer', label: '🏦 Bank Transfer' },
];

// ── Sort options ──────────────────────────────────────────────
export const CROP_SORT_OPTIONS = [
  { value: '-createdAt',   label: 'Newest First' },
  { value: 'pricePerUnit', label: 'Price: Low to High' },
  { value: '-pricePerUnit',label: 'Price: High to Low' },
  { value: '-rating',      label: 'Top Rated' },
  { value: '-views',       label: 'Most Popular' },
  { value: 'harvestDate',  label: 'Harvest Date' },
];

// ── Pagination ────────────────────────────────────────────────
export const DEFAULT_PAGE_SIZE = 12;
export const MAX_PAGE_SIZE = 50;

// ── Image ─────────────────────────────────────────────────────
export const MAX_IMAGE_SIZE_MB = 5;
export const MAX_IMAGES_PER_CROP = 5;
export const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];

// ── Validation ────────────────────────────────────────────────
export const VALIDATION = {
  NAME_MIN: 2,
  NAME_MAX: 100,
  PASSWORD_MIN: 6,
  DESCRIPTION_MIN: 10,
  DESCRIPTION_MAX: 1000,
  COMMENT_MIN: 10,
  COMMENT_MAX: 1000,
};

// ── Indian states ─────────────────────────────────────────────
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Jammu and Kashmir', 'Ladakh', 'Puducherry',
];

// ── Notification types ────────────────────────────────────────
export const NOTIFICATION_TYPES = {
  ORDER_PLACED:    { icon: '🛒', label: 'New Order' },
  ORDER_ACCEPTED:  { icon: '✅', label: 'Order Accepted' },
  ORDER_REJECTED:  { icon: '❌', label: 'Order Rejected' },
  ORDER_SHIPPED:   { icon: '🚚', label: 'Order Shipped' },
  ORDER_DELIVERED: { icon: '📦', label: 'Order Delivered' },
  ORDER_CANCELLED: { icon: '🚫', label: 'Order Cancelled' },
  NEW_REVIEW:      { icon: '⭐', label: 'New Review' },
  PAYMENT:         { icon: '💰', label: 'Payment' },
  SYSTEM:          { icon: '🔔', label: 'System' },
};

// ── Local storage keys ────────────────────────────────────────
export const STORAGE_KEYS = {
  TOKEN: 'farmlink_token',
  USER: 'farmlink_user',
  FILTERS: 'farmlink_filters',
  THEME: 'farmlink_theme',
};

// ── Route paths ───────────────────────────────────────────────
export const ROUTES = {
  HOME:              '/',
  LOGIN:             '/login',
  REGISTER:          '/register',
  MARKETPLACE:       '/marketplace',
  CROP_DETAIL:       '/crops/:id',
  FARMER_DASHBOARD:  '/farmer/dashboard',
  FARMER_ADD_CROP:   '/farmer/crops/add',
  FARMER_EDIT_CROP:  '/farmer/crops/edit/:id',
  RETAILER_DASHBOARD:'/retailer/dashboard',
  ORDERS:            '/orders',
  ORDER_DETAIL:      '/orders/:id',
  PROFILE:           '/profile',
};
