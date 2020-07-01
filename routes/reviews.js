/*
 * CRUD API for Reviews features
 */

// Dependencies
const express = require('express');
const router = express.Router({
    mergeParams: true
});

// Bring in the Course Controller Methods
const {
    getAllReviews,
    getSingleReview,
    addReview,
    updateReview,
    deleteReview
} = require('../controllers/reviews');

// Bring the model
const Review = require('../models/Review');

// AdvancedResult middleware
const advancedResult = require('../middleware/advancedResults');

// Middleware to protect routes and to grant access different roles to user
const {
    protect,
    authorize
} = require('../middleware/auth');

// Route the URL to specific methods
router.route('/')
    .get(advancedResult(Review, {
        path: 'bootcamp',
        select: 'name description'
    }), getAllReviews)
    .post(protect, authorize('user', 'admin'), addReview);    

router.route('/:id').get(getSingleReview)
    .put(protect, authorize('user', 'admin'), updateReview)
    .delete(protect, authorize('user', 'admin'), deleteReview);    
    
// Export the router
module.exports = router;