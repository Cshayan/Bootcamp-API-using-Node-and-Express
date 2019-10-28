/*
*  Entry point (server.js)
*  Main File for Bootcamp API
*/

// All dependencies
const express = require('express');
const dotenv = require('dotenv'); 

// Load environment file
dotenv.config({ path: "./config/config.env" });

// Init express
const app = express();

// Listen to server
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
    console.log(`Server running in ${process.env.NODE_ENV} mode in port ${PORT}`);
})