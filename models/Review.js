const mongoose = require('mongoose');

const ReviewSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    movie: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Movie',
      required: true
    },
    text: {
      type: String,
      required: true
    },
    rating: {
      type: Number,
      required: true,
      min: 0,
      max: 5
    }
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Review', ReviewSchema);