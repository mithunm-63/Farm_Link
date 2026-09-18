/**
 * Frontend Validators
 * Client-side validation helpers used across forms
 */

import { VALIDATION, ALLOWED_IMAGE_TYPES, MAX_IMAGE_SIZE_MB } from './constants';

// ── Field validators ──────────────────────────────────────────

export const isRequired = (value) => {
  if (value === null || value === undefined) return 'This field is required';
  if (typeof value === 'string' && !value.trim()) return 'This field is required';
  return null;
};

export const isEmail = (value) => {
  if (!value) return 'Email is required';
  const re = /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/;
  return re.test(value) ? null : 'Please enter a valid email address';
};

export const isPassword = (value) => {
  if (!value) return 'Password is required';
  if (value.length < VALIDATION.PASSWORD_MIN)
    return `Password must be at least ${VALIDATION.PASSWORD_MIN} characters`;
  if (!/\d/.test(value)) return 'Password must contain at least one number';
  return null;
};

export const isPasswordMatch = (password, confirm) => {
  if (!confirm) return 'Please confirm your password';
  return password === confirm ? null : 'Passwords do not match';
};

export const isPhone = (value) => {
  if (!value) return null; // optional
  return /^[+]?[\d\s\-()]{7,15}$/.test(value) ? null : 'Please enter a valid phone number';
};

export const isPincode = (value) => {
  if (!value) return 'Pincode is required';
  return /^\d{6}$/.test(value) ? null : 'Pincode must be 6 digits';
};

export const isMinLength = (value, min, fieldName = 'Field') => {
  if (!value) return `${fieldName} is required`;
  return value.length >= min ? null : `${fieldName} must be at least ${min} characters`;
};

export const isMaxLength = (value, max, fieldName = 'Field') => {
  if (!value) return null;
  return value.length <= max ? null : `${fieldName} cannot exceed ${max} characters`;
};

export const isPositiveNumber = (value, fieldName = 'Value') => {
  if (value === '' || value === null || value === undefined) return `${fieldName} is required`;
  const num = Number(value);
  return !isNaN(num) && num > 0 ? null : `${fieldName} must be a positive number`;
};

export const isNonNegativeNumber = (value, fieldName = 'Value') => {
  if (value === '' || value === null || value === undefined) return `${fieldName} is required`;
  const num = Number(value);
  return !isNaN(num) && num >= 0 ? null : `${fieldName} must be 0 or greater`;
};

export const isDate = (value, fieldName = 'Date') => {
  if (!value) return `${fieldName} is required`;
  const d = new Date(value);
  return isNaN(d.getTime()) ? `Invalid ${fieldName}` : null;
};

export const isFutureDate = (value, fieldName = 'Date') => {
  const dateError = isDate(value, fieldName);
  if (dateError) return dateError;
  return new Date(value) > new Date() ? null : `${fieldName} must be in the future`;
};

export const isPastOrTodayDate = (value, fieldName = 'Date') => {
  const dateError = isDate(value, fieldName);
  if (dateError) return dateError;
  return new Date(value) <= new Date() ? null : `${fieldName} cannot be in the future`;
};

// ── Image validators ──────────────────────────────────────────

export const isValidImage = (file) => {
  if (!file) return 'Please select an image';
  if (!ALLOWED_IMAGE_TYPES.includes(file.type)) {
    return 'Only JPEG, PNG, and WebP images are allowed';
  }
  if (file.size > MAX_IMAGE_SIZE_MB * 1024 * 1024) {
    return `Image size cannot exceed ${MAX_IMAGE_SIZE_MB}MB`;
  }
  return null;
};

// ── Form-level validators ─────────────────────────────────────

export const validateRegistration = (form) => {
  const errors = {};

  const nameErr = isMinLength(form.name, VALIDATION.NAME_MIN, 'Name');
  if (nameErr) errors.name = nameErr;

  const emailErr = isEmail(form.email);
  if (emailErr) errors.email = emailErr;

  const passwordErr = isPassword(form.password);
  if (passwordErr) errors.password = passwordErr;

  const confirmErr = isPasswordMatch(form.password, form.confirmPassword);
  if (confirmErr) errors.confirmPassword = confirmErr;

  const phoneErr = isPhone(form.phone);
  if (phoneErr) errors.phone = phoneErr;

  if (form.role === 'farmer' && !form.farmName?.trim()) {
    errors.farmName = 'Farm name is required';
  }
  if (form.role === 'retailer' && !form.businessName?.trim()) {
    errors.businessName = 'Business name is required';
  }
  if (!form.city?.trim()) errors.city = 'City is required';
  if (!form.state?.trim()) errors.state = 'State is required';

  return { errors, isValid: Object.keys(errors).length === 0 };
};

export const validateCropForm = (form) => {
  const errors = {};

  if (!form.name?.trim()) errors.name = 'Crop name is required';
  if (!form.category) errors.category = 'Category is required';
  if (!form.description?.trim() || form.description.length < 10)
    errors.description = 'Description must be at least 10 characters';

  const priceErr = isPositiveNumber(form.pricePerUnit, 'Price');
  if (priceErr) errors.pricePerUnit = priceErr;

  const qtyErr = isNonNegativeNumber(form.availableQuantity, 'Quantity');
  if (qtyErr) errors.availableQuantity = qtyErr;

  if (!form.unit) errors.unit = 'Unit is required';

  const dateErr = isDate(form.harvestDate, 'Harvest date');
  if (dateErr) errors.harvestDate = dateErr;

  if (!form.city?.trim()) errors.city = 'City is required';
  if (!form.state?.trim()) errors.state = 'State is required';

  return { errors, isValid: Object.keys(errors).length === 0 };
};

export const validateOrderForm = (form) => {
  const errors = {};

  const qtyErr = isPositiveNumber(form.quantity, 'Quantity');
  if (qtyErr) errors.quantity = qtyErr;

  if (!form.deliveryAddress?.address?.trim()) errors.address = 'Address is required';
  if (!form.deliveryAddress?.city?.trim()) errors.city = 'City is required';
  if (!form.deliveryAddress?.state?.trim()) errors.state = 'State is required';

  const pincodeErr = isPincode(form.deliveryAddress?.pincode);
  if (pincodeErr) errors.pincode = pincodeErr;

  return { errors, isValid: Object.keys(errors).length === 0 };
};
