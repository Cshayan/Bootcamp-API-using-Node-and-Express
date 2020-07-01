/*
 * CRUD API for Courses features
 */

// Dependencies
const express = require('express');
const router = express.Router({
    mergeParams: true
});

// Bring in the Course Controller Methods
const {
    getAllCourses,
    getSingleCourse,
    createCourse,
    updateCourse,
    deleteCourse
} = require('../controllers/courses');

// Bring the model
const Course = require('../models/Course');

// AdvancedResult middleware
const advancedResult = require('../middleware/advancedResults');

// Middleware to protect routes and to grant access different roles to user
const {
    protect,
    authorize
} = require('../middleware/auth');

// Route the URL to specific methods
router.route('/')
    .get(advancedResult(Course, {
        path: 'bootcamp',
        select: 'name description'
    }), getAllCourses)
    .post(protect, authorize('admin', 'publisher'), createCourse);
    
router.route('/:id')
    .get(getSingleCourse)
    .put(protect, authorize('admin', 'publisher'), updateCourse)
    .delete(protect, authorize('admin', 'publisher'), deleteCourse);

// Export the router
module.exports = router;