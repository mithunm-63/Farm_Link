const express = require('express');
const router = express.Router();
const {
  getReviews, createReview, replyToReview, markHelpful, deleteReview,
} = require('../controllers/reviewController');
const { protect } = require('../middleware/auth');
const { reviewValidation, mongoIdParam, validate } = require('../middleware/validate');

router.get('/', getReviews);
router.post('/', protect, reviewValidation, validate, createReview);
router.put('/:id/reply', protect, mongoIdParam(), validate, replyToReview);
router.put('/:id/helpful', protect, mongoIdParam(), validate, markHelpful);
router.delete('/:id', protect, mongoIdParam(), validate, deleteReview);

module.exports = router;
