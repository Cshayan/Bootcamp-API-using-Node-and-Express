/*
* Controller file for bootcamps API
*/

/*
*  GET api/v1/bootcamps
*  Purpose:- Get all the bootcamps
*  Access:- Public
*/
exports.getAllBootcamps = (req, res, next) => {
    res.status(200).json({
        success: true,
        msg: 'Show all bootcamps'
    });
};

/*
*  GET api/v1/bootcamps/:id
*  Purpose:- Get a single bootcamp specified by id
*  Access:- Public
*/
exports.getSingleBootcamp = (req, res, next) => {
    res.status(200).json({
        success: true,
        msg: `Show bootcamp with id ${req.params.id}`
    });
};

/*
*  POST api/v1/bootcamps
*  Purpose:- Create a the bootcamp
*  Access:- Private
*/
exports.createBootcamp = (req, res, next) => {
    res.status(200).json({
        success: true,
        msg: 'Create a new bootcamp'
    });
};

/*
*  PUT api/v1/bootcamps/:id
*  Purpose:- Update a specific bootcamp specified by id
*  Access:- Private
*/
exports.updateBootcamp = (req, res, next) => {
    res.status(200).json({
        success: true,
        msg: `Update bootcamp with id ${req.params.id}`
    });
};

/*
*  DELETE api/v1/bootcamps/:id
*  Purpose:- Delete a specific bootcamp specified by id
*  Access:- Private
*/
exports.deleteBootcamp = (req, res, next) => {
    res.status(200).json({
        success: true,
        msg: `Delete bootcamp with id ${req.params.id}`
    });
};
