/*
*  Entry point (server.js)
*  Main File for Bootcamp API
*/

// All dependencies
const path = require('path');
const express = require('express');
const dotenv = require('dotenv'); 
const colors = require('colors');
const fileUpload = require('express-fileupload');
const cookieParser = require('cookie-parser');
const cors = require('cors');
const rateLimiter = require('express-rate-limit');
const errorHandler = require('./middleware/error');

// Dependencies for security purposes
const mongoSantize = require('express-mongo-sanitize');
const helmet = require('helmet');
const xss = require('xss-clean');
const hpp = require('hpp');


// Load environment file
dotenv.config({ path: "./config/config.env" });

// Load Database file
const connectDB = require('./config/db');

// Connect to DB
connectDB();

// Import the routes
const bootcampsRoute = require('./routes/bootcamps');
const coursesRoute = require('./routes/courses');
const authRoute = require('./routes/auth');
const userRoute = require('./routes/users');
const reviewsRoute = require('./routes/reviews');

// Init express
const app = express();

// Body Parser Middleware
app.use(express.json());

// Set public as the static folder
app.use(express.static(path.join(__dirname, 'public')));

// File upload middleware
app.use(fileUpload());

// Cookie Parser middleware
app.use(cookieParser());

/** Middleware for extra Security Purposes starts here **/

// Mongo Sanitize data
app.use(mongoSantize());

// Set Security Headers
app.use(helmet());

// Prevent XSS attacks
app.use(xss());

// Prevent HTTP Param pollution
app.use(hpp());

/** Middleware for extra Security Purposes ends here **/

// Enable CORS middleware
app.use(cors());

// Make our API to respond to 100 requests per 10 min from a specific IP Address
const limiter = rateLimiter({
    windowMs: 10 * 60 * 1000, // 10 min in ms
    max: 100,  // number of requests
    message: "Too many accounts created from this IP, please try again after an 10 minutes"
});
app.use(limiter);

/* Route settings */
// GET POST PUT DELETE api/v1/bootcamps
app.use('/api/v1/bootcamps', bootcampsRoute);
app.use('/api/v1/courses', coursesRoute);
app.use('/api/v1/auth', authRoute);
app.use('/api/v1/users', userRoute);
app.use('/api/v1/reviews', reviewsRoute);

// ErrorHandler Middleware
app.use(errorHandler);

// Listen to server
const PORT = process.env.PORT || 5000;

const server = app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode in port ${PORT}`.yellow.bold);
})

// Handle unhandled promise rejections
process.on('unhandledRejection', (err, promise) => {
    console.log(`Error: ${err}`.red.bold);
    // Close the server and exit
    server.close(() => process.exit(1));
})