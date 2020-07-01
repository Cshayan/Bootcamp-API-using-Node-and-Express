/*
 * Controller file for User Authentication API
 */

// Dependencies
const crypto = require('crypto'); 

// Bring in the models
const User = require('../models/User');

// ErrorResponse Class
const ErrorResponse = require('../utils/errorResponse');

// Async Handler
const asyncHandler = require('../middleware/async');

// Utils
const sendEmail = require('../utils/sendEmail');

/*
 *  POST api/v1/auth/register
 *  Purpose:- Registers a new user
 *  Access:- Public
 */
exports.registerUser = asyncHandler(async (req, res, next) => {

    // register the user
    const user = await User.create(req.body);

    // send response
    createCookieAndSendToken(user, 200, res);
});

/*
 *  POST api/v1/auth/login
 *  Purpose:- Login a user
 *  Access:- Public
 */
exports.loginUser = asyncHandler(async (req, res, next) => {

    // get email and password
    const {
        email,
        password
    } = req.body;

    // validate email and password
    if (!email || !password) {
        return next(new ErrorResponse('Please provide email and password', 400));
    }

    // check if user exists with the email
    const user = await User.findOne({
        email
    }).select('+password');

    // if user is not present
    if (!user) {
        return next(new ErrorResponse('Invalid credentials provided', 401));
    }

    // match the password
    const isMatch = await user.matchPassword(password);

    // if password doesn't match
    if (!isMatch) {
        return next(new ErrorResponse('Invalid credentials provided', 401));
    }

    // send response
    createCookieAndSendToken(user, 200, res);
});

/*
 *  GET api/v1/auth/me
 *  Purpose:- Gets the info about current logged in user
 *  Access:- Private
 */
exports.getMe = asyncHandler(async (req, res, next) => {
    
    // find the user from DB
    const user = await User.findById(req.user.id);

    // send back the response
    res.status(200).json({
        success: true,
        data: user
    });
});

/*
 *  PUT api/v1/auth/updateuserdetails
 *  Purpose:- Updates user email and name
 *  Access:- Private
 */
exports.updateUserDetails = asyncHandler(async (req, res, next) => {

    // fields to update
    const fieldsToUpdate = {
        name: req.body.name,
        email: req.body.email 
    }

    // update the user
    const user = await User.findByIdAndUpdate(req.user.id, fieldsToUpdate, {
        new: true,
        runValidators: true
    });

    // send response
    res.status(200).json({
        success: true,
        data: user 
    });
});

/*
 *  PUT api/v1/auth/updateuserpassword
 *  Purpose:- Updates user email and name
 *  Access:- Private
 */
exports.updateUserPassword = asyncHandler(async (req, res, next) => {
      
    // find the user
    const user = await User.findById(req.user.id).select('+password');

    // check if the current password is correct or not
    if (!(await user.matchPassword(req.body.currentPassword))) {
        return next(new ErrorResponse('Current password is incorrect', 401));
    }

    // else, update the new password
    user.password = req.body.newPassword;
    await user.save();

    // send response
    createCookieAndSendToken(user, 200, res);
});

/*
 *  POST api/v1/auth/forgotpassword
 *  Purpose:- Send a email with resetURL containing resetToken to reset the password
 *  Access:- Public
 */
exports.forgotPassword = asyncHandler(async (req, res, next) => {
    
    // find the user by email from DB
    const user = await User.findOne({ email: req.body.email });

    // check if the user exists
    if (!user) {
        return next(new ErrorResponse(`No account exists with email ${req.body.email}`, 404));
    }

    // get the resetToken
    const resetToken = user.generateResetToken();

    // save the user with resetToken
    await user.save({ validateBeforeSave: false });

    // Create resetURL endpoint
    const resetURL = `${req.protocol}://${req.get('host')}/api/v1/auth/resetpassword/${resetToken}`;

    // message to send
    const message = `Please make a PUT request to the following URL to reset the password - \n\n ${resetURL}`;

    try {
        
        // Now send email with resetToken
        await sendEmail({
            email: user.email,
            subject: 'Password Reset',
            message,
        });

        // send response
        res.status(200).json({
            success: true,
            data: 'Email sent'
        });
    } catch (error) {
        
        // Email cannot be sent
        console.error(error);

        // make the fields in DB undefined
        user.resetPasswordToken = undefined;
        user.resetPasswordExpire = undefined;

        // save to DB
        await user.save({ validateBeforeSave: false });

        // send error as response
        return next(new ErrorResponse('Email cannot be sent', 500));
    }
});

/*
 *  PUT api/v1/auth/resetpassword/:resettoken
 *  Purpose:- Resets the token 
 *  Access:- Public
 */
exports.resetPassword = asyncHandler(async (req, res, next) => {
   
    // Make the resetToken a hashed one to find it in DB
    const resetPasswordToken = crypto.createHash('sha256').update(req.params.resettoken).digest('hex');

    // Search in DB by resetToken and make sure expiration has not passed
    const user = await User.findOne({
        resetPasswordToken,
        resetPasswordExpire: { $gt: Date.now() }
    });

    // If wrong token sent or expiration has passed
    if (!user) {
        return next(new ErrorResponse('Invalid token', 400));
    }

    // else, set password and make two resetpassword fields undefined
    user.password = req.body.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpire = undefined;

    // save the user
    await user.save();

    // send response
    createCookieAndSendToken(user, 200, res);
});

/*
 *  GET api/v1/auth/logout
 *  Purpose:- Logs out a user and clears the cookie
 *  Access:- Private
 */
exports.logOut = asyncHandler(async (req, res, next) => {
    
    // Clear the cookie
    res.cookie('DevelopmentCamp', 'none', {
        expires: new Date(Date.now() + 10 * 1000),
        httpOnly: true
    });

    // send back the response
    res.status(200).json({
        success: true,
        data: {}
    });
});


// Method to create cookie and send back response with token and cookie
const createCookieAndSendToken = (user, statusCode, res) => {

    // get the JWT token
    const token = user.generateJWTToken();

    // set options for cookie-parser
    const options = {
        expires: new Date(Date.now() + process.env.JWT_COOKIE_EXPIRE * 24 * 60 * 60 * 1000),
        httpOnly: true
    }

    // if in production, set secure to true
    if (process.env.NODE_ENV === 'production') {
        options.secure = true;
    }

    // create cookie and send response
    res.status(statusCode).cookie('DevelopmentCamp', token, options).json({
        success: true,
        token
    });
}