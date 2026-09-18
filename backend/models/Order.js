/**
 * Order Model
 * Manages transactions between retailers and farmers
 */

const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema(
  {
    orderNumber: {
      type: String,
      unique: true,
    },
    retailer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Retailer is required'],
    },
    farmer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: [true, 'Farmer is required'],
    },
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: [true, 'Crop is required'],
    },

    // Order details (snapshot at time of order)
    cropSnapshot: {
      name: String,
      category: String,
      pricePerUnit: Number,
      unit: String,
      imageUrl: String,
    },

    quantity: {
      type: Number,
      required: [true, 'Quantity is required'],
      min: [1, 'Quantity must be at least 1'],
    },
    pricePerUnit: {
      type: Number,
      required: true,
    },
    subtotal: {
      type: Number,
      required: true,
    },
    shippingCost: {
      type: Number,
      default: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
    },

    // Order status lifecycle
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'processing', 'shipped', 'delivered', 'cancelled', 'refunded'],
      default: 'pending',
    },

    // Status history timeline
    statusHistory: [
      {
        status: String,
        timestamp: { type: Date, default: Date.now },
        note: String,
        updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
      },
    ],

    // Delivery info
    deliveryAddress: {
      name: String,
      phone: String,
      address: { type: String, required: true },
      city: { type: String, required: true },
      state: { type: String, required: true },
      pincode: { type: String, required: true },
    },
    expectedDeliveryDate: Date,
    actualDeliveryDate: Date,
    trackingNumber: String,

    // Retailer notes
    notes: {
      type: String,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    rejectionReason: String,

    // Payment
    payment: {
      method: {
        type: String,
        enum: ['cod', 'online', 'bank_transfer'],
        default: 'cod',
      },
      status: {
        type: String,
        enum: ['pending', 'paid', 'failed', 'refunded'],
        default: 'pending',
      },
      transactionId: String,
      paidAt: Date,
      stripePaymentIntentId: String,
    },

    // Review flags
    farmerReviewed: { type: Boolean, default: false },
    retailerReviewed: { type: Boolean, default: false },

    // Cancellation
    cancelledBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    cancellationReason: String,
    cancelledAt: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  }
);

// Auto-generate order number
orderSchema.pre('save', async function (next) {
  if (!this.orderNumber) {
    const count = await mongoose.model('Order').countDocuments();
    this.orderNumber = `FL-${Date.now()}-${String(count + 1).padStart(4, '0')}`;
  }

  // Add to status history when status changes
  if (this.isModified('status')) {
    this.statusHistory.push({
      status: this.status,
      timestamp: new Date(),
    });
  }

  // Calculate totals
  this.subtotal = this.pricePerUnit * this.quantity;
  this.totalAmount = this.subtotal + (this.shippingCost || 0);

  next();
});

// Indexes
orderSchema.index({ retailer: 1 });
orderSchema.index({ farmer: 1 });
orderSchema.index({ crop: 1 });
orderSchema.index({ status: 1 });
orderSchema.index({ orderNumber: 1 });
orderSchema.index({ createdAt: -1 });

module.exports = mongoose.model('Order', orderSchema);
