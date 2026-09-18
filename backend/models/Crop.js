/**
 * Crop (Product) Model
 * Represents crop listings by farmers
 */

const mongoose = require('mongoose');

const cropSchema = new mongoose.Schema(
  {
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer is required'],
    },
    name: {
      type: String,
      required: [true, 'Crop name is required'],
      trim: true,
      maxlength: [100, 'Crop name cannot exceed 100 characters'],
    },
    category: {
      type: String,
      required: [true, 'Category is required'],
      enum: [
        'vegetables',
        'fruits',
        'grains',
        'pulses',
        'spices',
        'dairy',
        'poultry',
        'herbs',
        'oilseeds',
        'other',
      ],
    },
    description: {
      type: String,
      required: [true, 'Description is required'],
      maxlength: [1000, 'Description cannot exceed 1000 characters'],
    },
    images: [
      {
        public_id: String,
        url: { type: String, required: true },
        isMain: { type: Boolean, default: false },
      },
    ],

    // Pricing
    pricePerUnit: {
      type: Number,
      required: [true, 'Price per unit is required'],
      min: [0, 'Price cannot be negative'],
    },
    unit: {
      type: String,
      required: [true, 'Unit is required'],
      enum: ['kg', 'quintal', 'ton', 'dozen', 'piece', 'liter', 'bundle'],
    },
    minimumOrderQuantity: {
      type: Number,
      default: 1,
      min: [1, 'Minimum order must be at least 1'],
    },

    // Quantity
    availableQuantity: {
      type: Number,
      required: [true, 'Available quantity is required'],
      min: [0, 'Quantity cannot be negative'],
    },
    reservedQuantity: {
      type: Number,
      default: 0,
    },

    // Crop details
    harvestDate: {
      type: Date,
      required: [true, 'Harvest date is required'],
    },
    expiryDate: Date,
    grade: {
      type: String,
      enum: ['A', 'B', 'C', 'premium', 'standard'],
      default: 'standard',
    },
    isOrganic: {
      type: Boolean,
      default: false,
    },
    certifications: [String], // e.g., ['USDA Organic', 'Fair Trade']

    // Location
    location: {
      address: String,
      city: { type: String, required: [true, 'City is required'] },
      state: { type: String, required: [true, 'State is required'] },
      pincode: String,
      coordinates: {
        lat: Number,
        lng: Number,
      },
    },

    // Status
    status: {
      type: String,
      enum: ['active', 'inactive', 'sold_out', 'expired'],
      default: 'active',
    },
    isFeatured: { type: Boolean, default: false },

    // Ratings/Reviews
    rating: {
      average: { type: Number, default: 0, min: 0, max: 5 },
      count: { type: Number, default: 0 },
    },

    // Analytics
    views: { type: Number, default: 0 },
    orderCount: { type: Number, default: 0 },

    // Shipping
    shippingAvailable: { type: Boolean, default: false },
    shippingCost: { type: Number, default: 0 },
    deliveryDays: { type: Number, default: 3 },

    // Tags for search
    tags: [String],
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Virtual: effective available quantity
cropSchema.virtual('effectiveQuantity').get(function () {
  return Math.max(0, this.availableQuantity - this.reservedQuantity);
});

// Virtual: main image
cropSchema.virtual('mainImage').get(function () {
  if (!this.images || this.images.length === 0) return null;
  return this.images.find((img) => img.isMain) || this.images[0];
});

// Auto-update status based on quantity and expiry
cropSchema.pre('save', function (next) {
  if (this.effectiveQuantity <= 0) {
    this.status = 'sold_out';
  }
  if (this.expiryDate && new Date() > this.expiryDate) {
    this.status = 'expired';
  }
  next();
});

// Indexes for search and filtering
cropSchema.index({ farmer: 1 });
cropSchema.index({ category: 1 });
cropSchema.index({ status: 1 });
cropSchema.index({ 'location.city': 1 });
cropSchema.index({ 'location.state': 1 });
cropSchema.index({ pricePerUnit: 1 });
cropSchema.index({ harvestDate: -1 });
cropSchema.index({ createdAt: -1 });
cropSchema.index({ name: 'text', description: 'text', tags: 'text' }); // Full-text search
cropSchema.index({ isFeatured: 1 });

module.exports = mongoose.model('Crop', cropSchema);
