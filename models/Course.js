/*
 *  Courses Model file for the database
 */

// Dependencies
const mongoose = require('mongoose');

const CoursesSchema = new mongoose.Schema({
    title: {
        type: String,
        trim: true,
        required: [true, 'Please add a course title']
    },
    description: {
        type: String,
        required: [true, 'Please add a description']
    },
    weeks: {
        type: String,
        required: [true, 'Please add number of weeks']
    },
    tuition: {
        type: Number,
        required: [true, 'Please add a tuition cost']
    },
    minimumSkill: {
        type: String,
        required: [true, 'Please add a minimum skill'],
        enum: ['beginner', 'intermediate', 'advanced']
    },
    scholarshipAvailable: {
        type: Boolean,
        default: false
    },
    createdAt: {
        type: Date,
        default: Date.now
    },
    bootcamp: {
        type: mongoose.Schema.ObjectId,
        ref: 'Bootcamp',
        required: true
    },
    user: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
});

// Static method to calculate the average cost of the course tuition
CoursesSchema.statics.getAverageCost = async function (bootcampId) {

    const avgCostObj = await this.aggregate([{
            $match: {
                bootcamp: bootcampId
            }
        },
        {
            $group: {
                _id: '$bootcamp',
                averageCost: {
                    $avg: '$tuition'
                }
            }
        }
    ]);

    // Add the averageCost to Bootcamp model accordingly
    try {
        await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
            averageCost: Math.ceil(avgCostObj[0].averageCost / 10) * 10
        });
    } catch (error) {
        console.log('Error while calculating average cost' + error);
    } 
}

// Call the getAverageCost method after saving the document
CoursesSchema.post('save', function () {
    this.constructor.getAverageCost(this.bootcamp);
});

// Call the getAverageCost method before removing the document
CoursesSchema.pre('remove', function () {
    this.constructor.getAverageCost(this.bootcamp);
});

// Export the model
module.exports = mongoose.model('Course', CoursesSchema);