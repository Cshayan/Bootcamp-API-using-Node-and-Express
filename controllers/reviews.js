/*
 * Controller file for reviews API
 */

// Bring in the models
const Review = require('../models/Review');
const Bootcamp = require('../models/Bootcamp');

// ErrorResponse Class
const ErrorResponse = require('../utils/errorResponse');

// Async Handler
const asyncHandler = require('../middleware/async');

/*
 *  GET api/v1/reviews (for all reviews)
 *  GET api/v1/bootcamps/:bootcampId/reviews (for reviews under a specific bootcamp)
 *  Purpose:- Get all the reviews
 *  Access:- Public
 */
exports.getAllReviews = asyncHandler(async (req, res, next) => {

    if (req.params.bootcampId) {

        // Here we are selecting reviews for a specific bootcamp, hence does not need advanced results

        const reviews = await Review.find({
            bootcamp: req.params.bootcampId
        });

        // Send the response
        res.status(200).json({
            success: true,
            count: reviews.length,
            data: reviews
        })
    } else {

        // Here we are selecting all the reviews of all the bootcamps, hence needs advanced results
        res.status(200).json(res.advancedResults);
    }

});

/*
 *  GET api/v1/reviews/:id
 *  Purpose:- Get a single review
 *  Access:- Public
 */
exports.getSingleReview = asyncHandler(async (req, res, next) => {

    // find review by id
    const review = await Review.findById(req.params.id);

    // if review not found
    if (!review) {
        return next(new ErrorResponse(`No review found with id ${req.params.id}`, 404));
    }

    // else send the response
    res.status(200).json({
        success: true,
        data: review
    });
});

/*
 *  POST api/v1/bootcamps/:bootcampId/reviews
 *  Purpose:- Add a review for a bootcamp
 *  Access:- Private
 */
exports.addReview = asyncHandler(async (req, res, next) => {

    // add bootcamp and user field into the request
    req.body.bootcamp = req.params.bootcampId;
    req.body.user = req.user.id;

    // search for the bootcamp to add the review
    const bootcamp = await Bootcamp.findById(req.params.bootcampId);

    // if bootcamp does not exist
    if (!bootcamp) {
        return next(new ErrorResponse(`No bootcamp exists with id ${req.params.bootcampId}`, 404));
    }

    // search the review database, if for same bootcamp, a same user has already submiited a review or not
    const alreadyReviewSubmitted = await Review.find({
        bootcamp: req.params.bootcampId,
        user: req.user.id
    });

    if (alreadyReviewSubmitted.length) {
        return next(new ErrorResponse(`User with id ${req.user.id} has already submitted a review for this bootcamp with id ${req.params.bootcampId}`, 400));
    }

    // else, add the review
    const review = await Review.create(req.body);

    // else send the response
    res.status(201).json({
        success: true,
        data: review
    });
});

/*
 *  PUT api/v1/reviews/:id
 *  Purpose:- Update a review for a bootcamp
 *  Access:- Private
 */
exports.updateReview = asyncHandler(async (req, res, next) => {

    // search for the review to update
    let review = await Review.findById(req.params.id);

    // if review does not exist
    if (!review) {
        return next(new ErrorResponse(`No review exists with id ${req.params.id}`, 404));
    }

    // make sure only the owner of the review can update it
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with id ${req.user.id} is not authorised to update the review`, 401));
    }

    // else, update the review
    review = await Review.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    });

    // else send the response
    res.status(201).json({
        success: true,
        data: review
    });
});

/*
 *  PUT api/v1/reviews/:id
 *  Purpose:- Delete a review for a bootcamp
 *  Access:- Private
 */
exports.deleteReview = asyncHandler(async (req, res, next) => {

    // search for the review to delete
    let review = await Review.findById(req.params.id);

    // if review does not exist
    if (!review) {
        return next(new ErrorResponse(`No review exists with id ${req.params.id}`, 404));
    }

    // make sure only the owner of the review can update it
    if (review.user.toString() !== req.user.id && req.user.role !== 'admin') {
        return next(new ErrorResponse(`User with id ${req.user.id} is not authorised to delete the review`, 401));
    }

    // else, delete the review
    await review.remove();

    // else send the response
    res.status(201).json({
        success: true,
        data: {}
    });
});