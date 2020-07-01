/*
 * File to handle verify token and authorise and protect the routes
 */

// Dependencies
const jwt = require('jsonwebtoken');

// ErrorResponse Class
const ErrorResponse = require('../utils/errorResponse');

// Async Handler
const asyncHandler = require('./async');

// User Model
const User = require('../models/User');

/** Function to protect the routes **/
exports.protect = asyncHandler(async (req, res, next) => {

    let token;

    // get the token from headers sent
    const headersToken = req.headers.authorization;

    // get the token
    if (headersToken && headersToken.startsWith('Bearer')) {
        token = headersToken.split(' ')[1];
    } else if (req.cookies.token) {
        token = req.cookies.token;
    }

    // if token does not exist
    if (!token) {
        return next(new ErrorResponse('Unauthorised access', 401));
    }

    // verify the token
    try {

        const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
        req.user = await User.findById(decodedToken.id);
        next();

    } catch (error) {
        return next(new ErrorResponse('Unauthorised access', 401));
    }
});

/** Function to authorize users as per the role **/
exports.authorize = (...roles) => {
    return (req, res, next) => {

        // if the user role does not include the role that is passed in as argument, throw error
        if (!roles.includes(req.user.role)) {
            return next(new ErrorResponse(`User with role of ${req.user.role} cannot access the route`, 401));
        }
        next();
    };
};