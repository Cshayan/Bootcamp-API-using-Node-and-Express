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
    deleteBootcamp
} = require('../controllers/bootcamps');

// Route the URL to specific methods
router.route('/').get(getAllBootcamps).post(createBootcamp);
router.route('/:id').get(getSingleBootcamp).put(updateBootcamp).delete(deleteBootcamp);

// Export router
module.exports = router;