/*
 Script for automatically importing or deleting data from DB
*/

// All Dependencies
const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const colors = require('colors');

// Load ENV file
dotenv.config({
    path: './config/config.env'
});

// Load the models
const Bootcamp = require('./models/Bootcamp');
const Course = require('./models/Course');
const User = require('./models/User');
const Review = require('./models/Review');

// Connect to DB
mongoose.connect(process.env.MONGO_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
    useCreateIndex: true,
    useFindAndModify: false
});

// Read the JSON file
const bootCampData = JSON.parse(fs.readFileSync(`${__dirname}/_data/bootcamps.json`, 'utf-8'));
const courseData = JSON.parse(fs.readFileSync(`${__dirname}/_data/courses.json`, 'utf-8'));
const userData = JSON.parse(fs.readFileSync(`${__dirname}/_data/users.json`, 'utf-8'));
const reviewData = JSON.parse(fs.readFileSync(`${__dirname}/_data/reviews.json`, 'utf-8'));

// Import data to DB
const immportData = async () => {
    try {
        await Bootcamp.create(bootCampData);
        await Course.create(courseData);
        await User.create(userData);
        await Review.create(reviewData);

        console.log('Data Imported successfully...'.green.inverse);
        process.exit();
    } catch (error) {
        console.error(error);
    }
}

// Delete data from DB
const deleteData = async () => {
    try {
        await Bootcamp.deleteMany();
        await Course.deleteMany();
        await User.deleteMany();
        await Review.deleteMany();

        console.log('Data deleted successfully'.red.inverse);
        process.exit();
    } catch (error) {
        console.error(error);
    }
}

// Call the functions according to argument provided
/* 
 -i stands for import
 -d stands for delete 
*/
if (process.argv[2] === '-i') {
    immportData();
} else if (process.argv[2] === '-d') {
    deleteData();
}
