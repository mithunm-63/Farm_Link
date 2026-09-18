/**
 * User Model
 * Supports both Farmer and Retailer roles
 */

const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Please enter a valid email'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [6, 'Password must be at least 6 characters'],
      select: false, // Don't return password by default
    },
    role: {
      type: String,
      enum: ['farmer', 'retailer', 'admin'],
      required: [true, 'Role is required'],
    },
    phone: {
      type: String,
      trim: true,
      match: [/^[+]?[\d\s\-()]{7,15}$/, 'Please enter a valid phone number'],
    },
    avatar: {
      public_id: String,
      url: { type: String, default: '' },
    },
    location: {
      address: { type: String, trim: true },
      city: { type: String, trim: true },
      state: { type: String, trim: true },
      pincode: { type: String, trim: true },
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },

    // Farmer-specific fields
    farmName: {
      type: String,
      trim: true,
    },
    farmSize: {
      type: String, // e.g., "5 acres"
    },
    cropTypes: [String], // Main crops grown
    farmingType: {
      type: String,
      enum: ['organic', 'conventional', 'mixed'],
    },
    yearsOfExperience: Number,

    // Retailer-specific fields
    businessName: {
      type: String,
      trim: true,
    },
    businessType: {
      type: String,
      enum: ['restaurant', 'grocery', 'supermarket', 'wholesaler', 'other'],
    },
    gstNumber: {
      type: String,
      trim: true,
    },
    preferredCrops: [String],

    // Common stats
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },
    totalTransactions: { type: Number, default: 0 },
    totalRevenue: { type: Number, default: 0 }, // For farmers
    totalSpent: { type: Number, default: 0 }, // For retailers

    // Account status
    isVerified: { type: Boolean, default: false },
    isActive: { type: Boolean, default: true },
    verificationToken: String,
    verificationTokenExpiry: Date,
    resetPasswordToken: String,
    resetPasswordExpiry: Date,

    // Notifications preferences
    notifications: {
      email: { type: Boolean, default: true },
      inApp: { type: Boolean, default: true },
    },

    // Socket ID for real-time
    socketId: String,

    lastSeen: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: Full location string
userSchema.virtual('fullLocation').get(function () {
  const { address, city, state } = this.location || {};
  return [address, city, state].filter(Boolean).join(', ');
});

// Hash password before saving
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  const salt = await bcrypt.genSalt(12);
  this.password = await bcrypt.hash(this.password, salt);
  next();
});

// Compare password
userSchema.methods.comparePassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

// Generate JWT token
userSchema.methods.generateToken = function () {
  return jwt.sign(
    { id: this._id, role: this.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRE || '30d' }
  );
};

// Remove sensitive fields from JSON output
userSchema.methods.toJSON = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.verificationToken;
  delete obj.verificationTokenExpiry;
  delete obj.resetPasswordToken;
  delete obj.resetPasswordExpiry;
  delete obj.__v;
  return obj;
};

// Indexes
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ 'location.city': 1 });
userSchema.index({ 'location.state': 1 });
userSchema.index({ isActive: 1 });

module.exports = mongoose.model('User', userSchema);
