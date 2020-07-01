/*
 *  User Model file for the database
 */

// Dependencies
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

const UserSchema = new mongoose.Schema({
    name: {
        type: String,
        required: [true, 'Please add a name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    role: {
        type: String,
        enum: ['user', 'publisher'],
        default: 'user'
    },
    password: {
        type: String,
        required: [true, 'Please add a password'],
        minlength: [6, 'Password should be minimum of 6 characters'],
        select: false 
    }, 
    resetPasswordToken: String,
    resetPasswordExpire: String,
    createdAt: {
        type: Date,
        default: Date.now
    }
});

// Encrypt the password before saving user details
UserSchema.pre('save', async function (next) {

    // check if password field is modified or not
    if (!this.isModified('password')) {
        next();
    }

    // generate salt
    const salt = await bcrypt.genSalt(10);

    // hash the password
    this.password = await bcrypt.hash(this.password, salt);
});

// Generate the JWT token
UserSchema.methods.generateJWTToken = function () {
    return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
        expiresIn: process.env.JWT_EXPIRE
    });
}

// Compare user entered password with hashed password
UserSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
}

// Generate a reset token
UserSchema.methods.generateResetToken = function () {
    
    // generate resetToken
    const resetToken = crypto.randomBytes(20).toString('hex');

    // Hash the resetToken and save to save to DB
    this.resetPasswordToken = crypto.createHash('sha256').update(resetToken).digest('hex');

    // Save the resetTokenExpire field
    this.resetPasswordExpire = Date.now() + 10 * 60 * 1000;

    // return the resetToken
    return resetToken;
}

// Export the model
module.exports = mongoose.model('User', UserSchema);