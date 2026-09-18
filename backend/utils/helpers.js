/**
 * Utility Helpers
 * Reusable helper functions across the backend
 */

const crypto = require('crypto');

// ── Pagination ───────────────────────────────────────────────
exports.getPagination = (page = 1, limit = 10, maxLimit = 100) => {
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(maxLimit, Math.max(1, parseInt(limit)));
  const skip = (pageNum - 1) * limitNum;
  return { page: pageNum, limit: limitNum, skip };
};

exports.paginationResponse = (total, page, limit) => ({
  total,
  page,
  pages: Math.ceil(total / limit),
  hasNextPage: page < Math.ceil(total / limit),
  hasPrevPage: page > 1,
});

// ── String helpers ───────────────────────────────────────────
exports.capitalize = (str) =>
  str ? str.charAt(0).toUpperCase() + str.slice(1).toLowerCase() : '';

exports.slugify = (str) =>
  str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');

exports.truncate = (str, length = 100) =>
  str && str.length > length ? `${str.substring(0, length)}...` : str;

// ── Token generators ─────────────────────────────────────────
exports.generateRandomToken = (bytes = 32) =>
  crypto.randomBytes(bytes).toString('hex');

exports.hashToken = (token) =>
  crypto.createHash('sha256').update(token).digest('hex');

// ── Order number generator ───────────────────────────────────
exports.generateOrderNumber = async (Model) => {
  const count = await Model.countDocuments();
  const timestamp = Date.now().toString().slice(-6);
  const seq = String(count + 1).padStart(4, '0');
  return `FL-${timestamp}-${seq}`;
};

// ── Price formatter ──────────────────────────────────────────
exports.formatCurrency = (amount, currency = 'INR') => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
  }).format(amount);
};

// ── Date helpers ─────────────────────────────────────────────
exports.addDays = (date, days) => {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
};

exports.isExpired = (date) => new Date() > new Date(date);

exports.formatDate = (date, locale = 'en-IN') =>
  new Date(date).toLocaleDateString(locale, {
    year: 'numeric', month: 'short', day: 'numeric',
  });

// ── Sort query builder ───────────────────────────────────────
exports.buildSortQuery = (sortStr, allowed) => {
  if (!sortStr) return { createdAt: -1 };
  const field = sortStr.startsWith('-') ? sortStr.slice(1) : sortStr;
  if (!allowed.includes(field)) return { createdAt: -1 };
  return { [field]: sortStr.startsWith('-') ? -1 : 1 };
};

// ── Filter cleaner ───────────────────────────────────────────
exports.cleanObject = (obj) =>
  Object.fromEntries(
    Object.entries(obj).filter(([, v]) => v !== undefined && v !== null && v !== '')
  );

// ── Array utilities ──────────────────────────────────────────
exports.uniqueArray = (arr) => [...new Set(arr)];

exports.chunkArray = (arr, size) =>
  Array.from({ length: Math.ceil(arr.length / size) }, (_, i) =>
    arr.slice(i * size, i * size + size)
  );

// ── Response helpers ─────────────────────────────────────────
exports.successResponse = (res, data, message = 'Success', statusCode = 200) =>
  res.status(statusCode).json({ success: true, message, ...data });

exports.errorResponse = (res, message = 'Error', statusCode = 400) =>
  res.status(statusCode).json({ success: false, message });
