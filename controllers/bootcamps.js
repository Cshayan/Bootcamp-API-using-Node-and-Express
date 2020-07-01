/*
 * Controller file for bootcamps API
 */

// Core modules
const path = require('path');

// Bring in the models
const BootCamp = require('../models/Bootcamp');

// ErrorResponse Class
const ErrorResponse = require('../utils/errorResponse');

// Async Handler
const asyncHandler = require('../middleware/async');

// Utils
const geocoder = require('../utils/geocoder');

/*
 *  GET api/v1/bootcamps
 *  Purpose:- Get all the bootcamps
 *  Access:- Public
 */
exports.getAllBootcamps = asyncHandler(async (req, res, next) => {
    
    // Run the advanced result middleware and return the response
    res.status(200).json(res.advancedResults);
});

/*
 *  GET api/v1/bootcamps/:id
 *  Purpose:- Get a single bootcamp specified by id
 *  Access:- Public
 */
exports.getSingleBootcamp = asyncHandler(async (req, res, next) => {

    const singleBootCamp = await BootCamp.findById(req.params.id).populate('courses');

    // If the bootcamp with the specified id doesn't exist
    if (!singleBootCamp) {
        return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404));
    }

    // Bootcamp actually exists
    res.status(200).json({
        success: true,
        data: singleBootCamp
    });

});

/*
 *  POST api/v1/bootcamps
 *  Purpose:- Create a the bootcamp
 *  Access:- Private
 */
exports.createBootcamp = asyncHandler(async (req, res, next) => {

    // add user field to bootcamp
    req.body.user = req.user.id;

    // check for published bootcamp by the user
    const publishedBootcamp = await BootCamp.findOne({ user: req.user.id });

    // if publishedbootcamp exists and user is not admin, i.e user is a publisher, then he cannot publish any more bootcamp
    if (publishedBootcamp && req.user.role !== 'admin') {
        return next(new ErrorResponse(`Publisher with id ${req.user.id} has already published a bootcamp`, 400));
    }

    // create the bootcamp
    const newBootCamp = await BootCamp.create(req.body);

    // send response
    res.status(201).json({
        success: true,
        data: newBootCamp
    });
});

/*
 *  PUT api/v1/bootcamps/:id
 *  Purpose:- Update a specific bootcamp specified by id
 *  Access:- Private
 */
exports.updateBootcamp = asyncHandler(async (req, res, next) => {

    // find the bootcamp
    let bootcamp = await BootCamp.findById(req.params.id);

    // If the bootcamp exists
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404));
    }

    // make bootcamp its ownership
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with id ${req.user.id} is not authorised to update the bootcamp`, 401));
    }

    // update the bootcamp here
    bootcamp = await BootCamp.findByIdAndUpdate(req.params.id, req.body, {
        runValidators: true,
        new: true
    });

    // send the response
    res.status(200).json({
        success: true,
        data: bootcamp
    });
});

/*
 *  DELETE api/v1/bootcamps/:id
 *  Purpose:- Delete a specific bootcamp specified by id
 *  Access:- Private
 */
exports.deleteBootcamp = asyncHandler(async (req, res, next) => {

    // find the bootcamp
    let bootcamp = await BootCamp.findById(req.params.id);

    // If the bootcamp exists
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404));
    }

    // make bootcamp its owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with id ${req.user.id} is not authorised to delete the bootcamp`, 401));
    }

    // delete the bootcamp here
    bootcamp.remove();

    // send the response
    res.status(200).json({
        success: true,
        data: {}
    });
});

/*
 *  DELETE api/v1/bootcamps/radius/:zipcode/:distance
 *  Purpose:- Gets bootcamps within a specified radius in miles
 *  Access:- Private
 */
exports.getBootcampsByRadius = asyncHandler(async (req, res, next) => {

    // Get the zipcode and distance
    const {
        zipcode,
        distance
    } = req.params;

    // Get latitude and longitude using gecoder
    const location = await geocoder.geocode(zipcode);
    const latitude = location[0].latitude;
    const longitude = location[0].longitude;

    /* Get the radius
       Idea is to divide the distance given by the radius of the Earth (in miles)
       Radius of Earth = 3963 mi
    */
    const radius = distance / 3963;

    // Search in bootcamps model for that radius
    const bootcamps = await BootCamp.find({
        location: {
            $geoWithin: {
                $centerSphere: [
                    [longitude, latitude], radius
                ]
            }
        }
    });

    // Send response
    res.status(200).json({
        success: true,
        count: bootcamps.length,
        data: bootcamps
    });
});

/*
 *  PUT api/v1/bootcamps/:id/photo
 *  Purpose:- Uploads a photo to a bootcamp
 *  Access:- Private
 */
exports.bootcampPhotoUpload = asyncHandler(async (req, res, next) => {

    const bootcamp = await BootCamp.findById(req.params.id);

    // If the bootcamp exists
    if (!bootcamp) {
        return next(new ErrorResponse(`Bootcamp not found with id ${req.params.id}`, 404));
    }

    // make bootcamp its owner
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with id ${req.user.id} is not authorised to upload a photo to this bootcamp`, 401));
    }

    // Check if file is uploaded
    if (!req.files) {
        return next(new ErrorResponse(`Please upload an image`, 400));
    }

    const file = req.files.file;

    // Check if the file is an image
    if (!file.mimetype.startsWith('image')) {
        return next(new ErrorResponse(`The file uploaded is not an image`, 400));
    }

    // Check the size of the image
    if (file.size > process.env.MAX_FILE_SIZE) {
        return next(new ErrorResponse(`Please upload an image of size less than 1MB`, 400));
    }

    // Create a custom file name for the image to distinguish it from one another
    file.name = `photo_${bootcamp._id}${path.parse(file.name).ext}`;

    // Move the file to public/uploads folder
    file.mv(`${process.env.FILE_UPLOAD_PATH}/${file.name}`, async (err) => {
        if (err) {
            console.error(err);
            return next(new ErrorResponse(`Error in photo uploading`, 500));
        }

        // Save the file name to model
        await BootCamp.findByIdAndUpdate(req.params.id, {
            photo: file.name
        });

        // send the response
        res.status(200).json({
            success: true,
            data: file.name
        })
    })
});