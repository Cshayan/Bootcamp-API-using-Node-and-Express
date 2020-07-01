/*
 * Authentication API for Users
 */

// Dependencies
const express = require('express');
const router = express.Router();

// Bring in the controller methods
const {
    registerUser,
    loginUser,
    logOut,
    getMe,
    forgotPassword,
    resetPassword,
    updateUserDetails,
    updateUserPassword
} = require('../controllers/auth');

// Middleware to protect routes
const { protect } = require('../middleware/auth');

// Route the URL to specific methods
router.route('/register').post(registerUser);
router.route('/login').post(loginUser);
router.route('/me').get(protect, getMe);
router.route('/logout').get(protect, logOut);
router.route('/updateuserdetails').put(protect, updateUserDetails);
router.route('/updateuserpassword').put(protect, updateUserPassword);
router.route('/forgotpassword').post(forgotPassword);
router.route('/resetpassword/:resettoken').put(resetPassword);

// Export the router
module.exports = router;