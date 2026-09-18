/**
 * Validation Middleware
 * Request body validation using express-validator
 */

const { body, param, query, validationResult } = require('express-validator');

// ── Run validation and return errors ────────────────────────
exports.validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(422).json({
      success: false,
      message: 'Validation failed',
      errors: errors.array().map((e) => ({ field: e.path, message: e.msg })),
    });
  }
  next();
};

// ── Auth validators ──────────────────────────────────────────
exports.registerValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Name is required')
    .isLength({ min: 2, max: 100 }).withMessage('Name must be 2-100 characters'),

  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email')
    .normalizeEmail(),

  body('password')
    .notEmpty().withMessage('Password is required')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters')
    .matches(/\d/).withMessage('Password must contain at least one number'),

  body('role')
    .notEmpty().withMessage('Role is required')
    .isIn(['farmer', 'retailer']).withMessage('Role must be farmer or retailer'),

  body('phone')
    .optional()
    .matches(/^[+]?[\d\s\-()]{7,15}$/).withMessage('Please enter a valid phone number'),
];

exports.loginValidation = [
  body('email')
    .trim()
    .notEmpty().withMessage('Email is required')
    .isEmail().withMessage('Please enter a valid email'),

  body('password')
    .notEmpty().withMessage('Password is required'),
];

// ── Crop validators ──────────────────────────────────────────
exports.cropValidation = [
  body('name')
    .trim()
    .notEmpty().withMessage('Crop name is required')
    .isLength({ max: 100 }).withMessage('Name cannot exceed 100 characters'),

  body('category')
    .notEmpty().withMessage('Category is required')
    .isIn(['vegetables','fruits','grains','pulses','spices','dairy','poultry','herbs','oilseeds','other'])
    .withMessage('Invalid category'),

  body('description')
    .trim()
    .notEmpty().withMessage('Description is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Description must be 10-1000 characters'),

  body('pricePerUnit')
    .notEmpty().withMessage('Price is required')
    .isFloat({ min: 0.01 }).withMessage('Price must be a positive number'),

  body('unit')
    .notEmpty().withMessage('Unit is required')
    .isIn(['kg','quintal','ton','dozen','piece','liter','bundle']).withMessage('Invalid unit'),

  body('availableQuantity')
    .notEmpty().withMessage('Available quantity is required')
    .isFloat({ min: 0 }).withMessage('Quantity must be a non-negative number'),

  body('harvestDate')
    .notEmpty().withMessage('Harvest date is required')
    .isISO8601().withMessage('Invalid date format'),

  body('location.city')
    .trim()
    .notEmpty().withMessage('City is required'),

  body('location.state')
    .trim()
    .notEmpty().withMessage('State is required'),
];

// ── Order validators ─────────────────────────────────────────
exports.orderValidation = [
  body('cropId')
    .notEmpty().withMessage('Crop ID is required')
    .isMongoId().withMessage('Invalid crop ID'),

  body('quantity')
    .notEmpty().withMessage('Quantity is required')
    .isFloat({ min: 1 }).withMessage('Quantity must be at least 1'),

  body('deliveryAddress.address')
    .trim()
    .notEmpty().withMessage('Delivery address is required'),

  body('deliveryAddress.city')
    .trim()
    .notEmpty().withMessage('Delivery city is required'),

  body('deliveryAddress.state')
    .trim()
    .notEmpty().withMessage('Delivery state is required'),

  body('deliveryAddress.pincode')
    .trim()
    .notEmpty().withMessage('Pincode is required')
    .matches(/^\d{6}$/).withMessage('Invalid pincode (must be 6 digits)'),
];

// ── Review validators ────────────────────────────────────────
exports.reviewValidation = [
  body('orderId')
    .notEmpty().withMessage('Order ID is required')
    .isMongoId().withMessage('Invalid order ID'),

  body('rating')
    .notEmpty().withMessage('Rating is required')
    .isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),

  body('comment')
    .trim()
    .notEmpty().withMessage('Comment is required')
    .isLength({ min: 10, max: 1000 }).withMessage('Comment must be 10-1000 characters'),

  body('qualityRating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Quality rating must be between 1 and 5'),

  body('packagingRating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Packaging rating must be between 1 and 5'),

  body('communicationRating')
    .optional()
    .isInt({ min: 1, max: 5 }).withMessage('Communication rating must be between 1 and 5'),
];

// ── Param validators ─────────────────────────────────────────
exports.mongoIdParam = (paramName = 'id') => [
  param(paramName).isMongoId().withMessage(`Invalid ${paramName}`),
];
