/*
 * Controller file for User CRUD functionality available to admin only
 */

// Bring in the models
const User = require('../models/User');

// ErrorResponse Class
const ErrorResponse = require('../utils/errorResponse');

// Async Handler
const asyncHandler = require('../middleware/async');

/*
 *  GET api/v1/users
 *  Purpose:- Gets all users
 *  Access:- Private (admin)
 */
exports.getAllUsers = asyncHandler(async (req, res, next) => {
    
    // run the advanced middleware and give the result
    res.status(200).json(res.advancedResults);
});

/*
 *  GET api/v1/users/:id
 *  Purpose:- Gets a single user by id
 *  Access:- Private (admin)
 */
exports.getSingleUser = asyncHandler(async (req, res, next) => {
    
    // find the user by id
    const user = await User.findById(req.params.id);

    // if user is not found
    if (!user) {
        return next(new ErrorResponse(`No user with id ${req.params.id} is present`, 404));
    }

    // send response
    res.status(200).json({
        success: true,
        data: user
    });
});

/*
 *  POST api/v1/users
 *  Purpose:- Create a new user
 *  Access:- Private (admin)
 */
exports.createUser = asyncHandler(async (req, res, next) => {
    
    // create a user
    const user = await User.create(req.body);

    // send response
    res.status(201).json({
        success: true,
        data: user
    });
});

/*
 *  PUT api/v1/users/:id
 *  Purpose:- Update an existing user
 *  Access:- Private (admin)
 */
exports.updateUser = asyncHandler(async (req, res, next) => {
    
    // update a user
    const user = await User.findByIdAndUpdate(req.params.id, req.body, {
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
 *  DELETE api/v1/users/:id
 *  Purpose:- Delete an existing user
 *  Access:- Private (admin)
 */
exports.deleteUser = asyncHandler(async (req, res, next) => {
    
    // create a user
    await User.findByIdAndRemove(req.params.id);

    // send response
    res.status(200).json({
        success: true,
        data: {}
    });
});





