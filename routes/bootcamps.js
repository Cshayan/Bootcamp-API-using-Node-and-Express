/*
 * CRUD API for Bootcamp features
 */

// Dependencies
const express = require('express');
const router = express.Router();

// Bring in the Bootcamp Controller Methods
const {
    getAllBootcamps,
    getSingleBootcamp,
    createBootcamp,
    updateBootcamp,
    deleteBootcamp,
    getBootcampsByRadius,
    bootcampPhotoUpload
} = require('../controllers/bootcamps');

// Model
const Bootcamp = require('../models/Bootcamp');

// AdvancedResult middleware
const advancedResults = require('../middleware/advancedResults');

// Bring in the resource router
const courseRouter = require('./courses');
const reviewsRouter = require('./reviews');

// Middleware to protect routes and to grant access different roles to user
const {
    protect,
    authorize
} = require('../middleware/auth');

// Re-route into other resource router
router.use('/:bootcampId/courses', courseRouter);
router.use('/:bootcampId/reviews', reviewsRouter);

// Route the URL to specific methods
router.route('/')
    .get(advancedResults(Bootcamp, 'courses'), getAllBootcamps)
    .post(protect, authorize('admin', 'publisher'), createBootcamp);

router.route('/:id')
    .get(getSingleBootcamp)
    .put(protect, updateBootcamp)
    .delete(protect, authorize('admin', 'publisher'), deleteBootcamp);

router.route('/radius/:zipcode/:distance').get(getBootcampsByRadius);
router.route('/:id/photo').put(protect, authorize('admin', 'publisher'), bootcampPhotoUpload);

// Export router
module.exports = router;