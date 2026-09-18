/**
 * Frontend Formatters
 * Date, currency, text, and other display formatters
 */

import { formatDistanceToNow, format, isToday, isYesterday, parseISO } from 'date-fns';

// ── Currency ─────────────────────────────────────────────────
export const formatCurrency = (amount, currency = 'INR') => {
  if (amount === null || amount === undefined) return '—';
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num) => {
  if (num === null || num === undefined) return '—';
  return new Intl.NumberFormat('en-IN').format(num);
};

export const formatCompactNumber = (num) => {
  if (!num) return '0';
  if (num >= 10000000) return `₹${(num / 10000000).toFixed(1)}Cr`;
  if (num >= 100000) return `₹${(num / 100000).toFixed(1)}L`;
  if (num >= 1000) return `₹${(num / 1000).toFixed(1)}K`;
  return `₹${num}`;
};

// ── Dates ─────────────────────────────────────────────────────
export const formatDate = (date, fmt = 'dd MMM yyyy') => {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date);
    return format(d, fmt);
  } catch {
    return '—';
  }
};

export const formatDateTime = (date) => formatDate(date, 'dd MMM yyyy, hh:mm a');

export const formatRelativeTime = (date) => {
  if (!date) return '—';
  try {
    const d = typeof date === 'string' ? parseISO(date) : new Date(date);
    if (isToday(d)) return `Today at ${format(d, 'hh:mm a')}`;
    if (isYesterday(d)) return `Yesterday at ${format(d, 'hh:mm a')}`;
    return formatDistanceToNow(d, { addSuffix: true });
  } catch {
    return '—';
  }
};

export const formatShortDate = (date) => formatDate(date, 'dd MMM');

// ── Strings ───────────────────────────────────────────────────
export const capitalize = (str) => {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
};

export const titleCase = (str) => {
  if (!str) return '';
  return str.replace(/\w\S*/g, (txt) => txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase());
};

export const truncate = (str, length = 80, suffix = '...') => {
  if (!str) return '';
  return str.length <= length ? str : `${str.substring(0, length).trim()}${suffix}`;
};

export const slugify = (str) => {
  if (!str) return '';
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
};

// ── Order status ──────────────────────────────────────────────
export const statusLabels = {
  pending:    { label: 'Pending',    emoji: '⏳', color: '#e65100', bg: '#fff3e0' },
  accepted:   { label: 'Accepted',   emoji: '✅', color: '#2e7d32', bg: '#e8f5e9' },
  rejected:   { label: 'Rejected',   emoji: '❌', color: '#c62828', bg: '#ffebee' },
  processing: { label: 'Processing', emoji: '🔄', color: '#1565c0', bg: '#e3f2fd' },
  shipped:    { label: 'Shipped',    emoji: '🚚', color: '#6a1b9a', bg: '#f3e5f5' },
  delivered:  { label: 'Delivered',  emoji: '📦', color: '#1b5e20', bg: '#e8f5e9' },
  cancelled:  { label: 'Cancelled',  emoji: '🚫', color: '#757575', bg: '#fafafa' },
  refunded:   { label: 'Refunded',   emoji: '↩️', color: '#0277bd', bg: '#e1f5fe' },
};

export const getStatusInfo = (status) =>
  statusLabels[status] || { label: status, emoji: '•', color: '#757575', bg: '#f5f5f5' };

// ── Crop category ─────────────────────────────────────────────
export const categoryEmoji = {
  vegetables: '🥬', fruits: '🍎',   grains: '🌾', pulses: '🫘',
  spices: '🌶️',   dairy: '🥛',    poultry: '🐓', herbs: '🌿',
  oilseeds: '🌻',  other: '🌱',
};

export const getCategoryEmoji = (cat) => categoryEmoji[cat] || '🌱';

// ── Rating ────────────────────────────────────────────────────
export const formatRating = (rating, count) => {
  if (!rating) return 'No ratings yet';
  return `${rating.toFixed(1)} ★ (${count || 0} reviews)`;
};

// ── File size ─────────────────────────────────────────────────
export const formatFileSize = (bytes) => {
  if (!bytes) return '0 B';
  const units = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return `${(bytes / Math.pow(1024, i)).toFixed(1)} ${units[i]}`;
};

// ── Phone number ──────────────────────────────────────────────
export const formatPhone = (phone) => {
  if (!phone) return '—';
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
  }
  return phone;
};

// ── Percentage ────────────────────────────────────────────────
export const formatPercent = (value, total) => {
  if (!total) return '0%';
  return `${Math.round((value / total) * 100)}%`;
};
