/*
 * CRUD API for users available to users only
 */

// Dependencies
const express = require('express');
const router = express.Router();

// Bring in the controller methods
const {
    getAllUsers,
    getSingleUser,
    createUser,
    updateUser,
    deleteUser
} = require('../controllers/users');

// Middleware to protect routes
const {
    protect,
    authorize
} = require('../middleware/auth');

// Model
const User = require('../models/User');

// AdvancedResult middleware
const advancedResults = require('../middleware/advancedResults');

// Make every router private
router.use(protect);

// Make routers available to admin only
router.use(authorize('admin'));

// Route the URL to specific methods
router.route('/')
    .get(advancedResults(User), getAllUsers)
    .post(createUser);

router.route('/:id')
    .get(getSingleUser)
    .put(updateUser)
    .delete(deleteUser);

// Export the router
module.exports = router;