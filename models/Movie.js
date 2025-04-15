const mongoose = require('mongoose');

const MovieSchema = new mongoose.Schema(
  {
    tmdbId: {
      type: Number,
      index: true
    },
    title: {
      type: String,
      required: true
    },
    releaseYear: {
      type: Number,
      required: true
    },
    director: {
      type: String,
      required: true
    },
    cast: {
      type: [String],
      default: []
    },
    genres: {
      type: [String],
      default: []
    },
    plot: {
      type: String,
      default: ''
    },
    poster: {
      type: String,
      default: ''
    },
    backdrop: {
      type: String,
      default: ''
    },
    averageRating: {
      type: Number,
      default: 0
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Review'
      }
    ]
  },
  {
    timestamps: true
  }
);

module.exports = mongoose.model('Movie', MovieSchema);