/*
* File to handle pagination, sorting, populate, limit and other advanced results
*/

const advnacedResults = (model, populate) => async (req, res, next) => {
    // To store any query
    let query;

    // Copy query
    let reqCopyQuery = {
        ...req.query
    };

    // Fields to exclude (we do not want to search these fields)
    const removeFields = ['select', 'sort', 'page', 'limit'];

    // Remove fields from copyQueryStr
    removeFields.forEach(param => delete reqCopyQuery[param]);

    let queryStr = JSON.stringify(reqCopyQuery);

    // Manupulate queryStr
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    // Make the query by parsing
    query = model.find(JSON.parse(queryStr));

    // Select fields
    if (req.query.select) {
        const fields = req.query.select.split(',').join(' ');
        query = query.select(fields);
    }

    // Sort field
    if (req.query.sort) {
        const sortBy = req.query.sort.split(',').join(' ');
        query = query.sort(sortBy);
    } else {
        query = query.sort('-createdAt');
    }

    // Pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 25;
    const startIndex = (page - 1) * limit;
    const endIndex = page * limit;
    const total = await model.countDocuments();

    // Run the query
    query = query.skip(startIndex).limit(limit);

    // Populate
    if (populate) {
        query = query.populate(populate);
    }

    // Pagination result
    const pagination = {};

    // Add next page
    if (endIndex < total) {
        pagination.next = {
            page: page + 1,
            limit
        }
    }

    // Add previous page
    if (startIndex > 0) {
        pagination.prev = {
            page: page - 1,
            limit
        }
    }

    // Get the result
    const results = await query;

    // Send the response
    res.advancedResults = {
        success: true,
        count: results.length,
        pagination,
        data: results
    }

    next();
};

// Export the method
module.exports = advnacedResults;