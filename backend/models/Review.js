/**
 * Review Model
 * Ratings and reviews after completed orders
 */

const mongoose = require('mongoose');

const reviewSchema = new mongoose.Schema(
  {
    order: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Order',
      required: true,
    },
    crop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Crop',
      required: true,
    },
    reviewer: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewee: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reviewerRole: {
      type: String,
      enum: ['retailer', 'farmer'],
      required: true,
    },
    rating: {
      type: Number,
      required: [true, 'Rating is required'],
      min: 1,
      max: 5,
    },
    title: {
      type: String,
      maxlength: [100, 'Title cannot exceed 100 characters'],
    },
    comment: {
      type: String,
      required: [true, 'Comment is required'],
      maxlength: [1000, 'Comment cannot exceed 1000 characters'],
    },
    qualityRating: { type: Number, min: 1, max: 5 },
    packagingRating: { type: Number, min: 1, max: 5 },
    communicationRating: { type: Number, min: 1, max: 5 },
    images: [{ public_id: String, url: String }],
    isVerified: { type: Boolean, default: true },
    helpfulVotes: { type: Number, default: 0 },
    reply: {
      text: String,
      repliedAt: Date,
    },
  },
  {
    timestamps: true,
  }
);

// One review per order per reviewer
reviewSchema.index({ order: 1, reviewer: 1 }, { unique: true });
reviewSchema.index({ crop: 1 });
reviewSchema.index({ reviewee: 1 });
reviewSchema.index({ rating: -1 });

// Update crop and user ratings after review
reviewSchema.post('save', async function () {
  try {
    const Crop = mongoose.model('Crop');
    const User = mongoose.model('User');

    // Update crop rating
    const cropReviews = await mongoose.model('Review').find({ crop: this.crop });
    const cropAvg = cropReviews.reduce((sum, r) => sum + r.rating, 0) / cropReviews.length;
    await Crop.findByIdAndUpdate(this.crop, {
      'rating.average': Math.round(cropAvg * 10) / 10,
      'rating.count': cropReviews.length,
    });

    // Update reviewee (farmer/retailer) rating
    const userReviews = await mongoose.model('Review').find({ reviewee: this.reviewee });
    const userAvg = userReviews.reduce((sum, r) => sum + r.rating, 0) / userReviews.length;
    await User.findByIdAndUpdate(this.reviewee, {
      'rating.average': Math.round(userAvg * 10) / 10,
      'rating.count': userReviews.length,
    });
  } catch (err) {
    console.error('Error updating ratings:', err);
  }
});

module.exports = mongoose.model('Review', reviewSchema);
