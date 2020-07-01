/*
* Utility file for handling Geocoder API
*/

// Bring in dependencies
const NodeGeocoder = require('node-geocoder');

// Create Geocoder options
const options = {
    provider: process.env.GEOCODER_PROVIDER,
    httpAdapter: 'https',
    apiKey: process.env.GEOCODER_API_KEY,
    formatter: null
};

// Init Geocoder
const geocoder = NodeGeocoder(options);

// Export the gecoder
module.exports = geocoder;