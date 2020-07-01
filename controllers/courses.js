/*
 * Controller file for courses API
 */

// Bring in the models
const Course = require('../models/Course');
const Bootcamp = require('../models/Bootcamp');

// ErrorResponse Class
const ErrorResponse = require('../utils/errorResponse');

// Async Handler
const asyncHandler = require('../middleware/async');

/*
 *  GET api/v1/courses (for all courses)
 *  GET api/v1/bootcamps/:bootcampId/courses (for courses under a specific bootcamp)
 *  Purpose:- Get all the courses
 *  Access:- Public
 */
exports.getAllCourses = asyncHandler(async (req, res, next) => {

    if (req.params.bootcampId) {

        // Here we are selecting courses for a specific bootcamp, hence does not need advanced results

        const courses = await Course.find({
            bootcamp: req.params.bootcampId
        });

        // Send the response
        res.status(200).json({
            success: true,
            count: courses.length,
            data: courses
        })
    } else {

        // Here we are selecting all the courses of all the bootcamps, hence needs advanced results

        res.status(200).json(res.advancedResults);
    }

});

/*
 *  GET api/v1/courses/:id
 *  Purpose:- Get a single course
 *  Access:- Public
 */
exports.getSingleCourse = asyncHandler(async (req, res, next) => {
    const course = await Course.findById(req.params.id).populate({
        path: 'bootcamp',
        select: 'name description'
    });

    if (!course) {
        return next(new ErrorResponse(`No course with id ${req.params.id}`, 404));
    }

    res.status(200).json({
        success: true,
        data: course
    });
});

/*
 *  POST api/v1/bootcamps/:bootcampId/courses
 *  Purpose:- Create a new course
 *  Access:- Private
 */
exports.createCourse = asyncHandler(async (req, res, next) => {
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    // find the bootcamp to add a course to it
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    // if the bootcamp does not exist, then course cannot be added
    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp with id ${req.params.id}`, 404));
    }

    // make sure only the actual owner can add course to its bootcamp
    if (bootcamp.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with id ${req.user.id} is not authorised to add a course to this bootcamp`, 401));
    }

    // Bootcamp exits, hence create the course
    const course = await Course.create(req.body);

    res.status(201).json({
        success: true,
        data: course
    })
});

/*
 *  PUT api/v1/courses/:id
 *  Purpose:- Updates an existing course
 *  Access:- Private
 */
exports.updateCourse = asyncHandler(async (req, res, next) => {

    // find the course to update
    const course = await Course.findById(req.params.id);

    // if course does not exist
    if (!course) {
        return next(new ErrorResponse(`No course with id ${req.params.id}`, 404));
    }

    // make sure only the actual owner can update course
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with id ${req.user.id} is not authorised to update the course`, 401));
    }

    // Course exits, hence update the course
    const updatedCourse = await Course.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    // send the response
    res.status(201).json({
        success: true,
        data: updatedCourse
    });
});

/*
 *  DELETE api/v1/courses/:id
 *  Purpose:- Deletes an existing course
 *  Access:- Private
 */
exports.deleteCourse = asyncHandler(async (req, res, next) => {

    // find the course
    const course = await Course.findById(req.params.id);

    // if the course does not exist
    if (!course) {
        return next(new ErrorResponse(`No course with id ${req.params.id}`, 404));
    }

    // make sure only the actual owner can delete course
    if (course.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with id ${req.user.id} is not authorised to delete the course`, 401));
    }

    // Bootcamp exits, hence update the course
    await course.remove();

    res.status(201).json({
        success: true,
        data: {}
    });
});