const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema({
  title: {
    type: String,
    trim: true,
    required: [true, 'Please add a title for the review'],
    maxlength: 100
  },
  text: {
    type: String,
    required: [true, 'Please add some text']
  },
  rating: {
    type: Number,
    min: 1,
    max: 10,
    required: [true, 'Please add a rating between 1 and 10']
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
ReviewSchema.statics.getAverageRating = async function (bootcampId) {

  const avgRatingObj = await this.aggregate([{
          $match: {
              bootcamp: bootcampId
          }
      },
      {
          $group: {
              _id: '$bootcamp',
              averageRating: {
                  $avg: '$rating'
              }
          }
      }
  ]);

  // Add the averageCost to Bootcamp model accordingly
  try {
      await this.model('Bootcamp').findByIdAndUpdate(bootcampId, {
          averageRating: avgRatingObj[0].averageRating
      });
  } catch (error) {
      console.log('Error while calculating average rating' + error);
  } 
}

// Call the getAverageCost method after saving the document
ReviewSchema.post('save', function () {
  this.constructor.getAverageRating(this.bootcamp);
});

// Call the getAverageCost method before removing the document
ReviewSchema.pre('remove', function () {
  this.constructor.getAverageRating(this.bootcamp);
});


module.exports = mongoose.model('Review', ReviewSchema);
