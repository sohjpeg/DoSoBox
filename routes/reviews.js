const express = require('express');
const router = express.Router();
const Review = require('../models/Review');
const Movie = require('../models/Movie');
const auth = require('../middleware/auth');

// @route   GET api/reviews
// @desc    Get all reviews
router.get('/', async (req, res) => {
  try {
    const reviews = await Review.find()
      .sort({ createdAt: -1 })
      .populate('user', 'username profilePicture')
      .populate('movie', 'title poster');
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/reviews/:id
// @desc    Get review by ID
router.get('/:id', async (req, res) => {
  try {
    const review = await Review.findById(req.params.id)
      .populate('user', 'username profilePicture')
      .populate('movie', 'title poster');
    if (!review) {
      return res.status(404).json({ msg: 'Review not found' });
    }
    res.json(review);
  } catch (err) {
    console.error(err.message);
    if (err.kind === 'ObjectId') {
      return res.status(404).json({ msg: 'Review not found' });
    }
    res.status(500).send('Server Error');
  }
});

// @route   GET api/reviews/movie/:movieId
// @desc    Get reviews for a movie
router.get('/movie/:movieId', async (req, res) => {
  try {
    const reviews = await Review.find({ movie: req.params.movieId })
      .populate('user', 'username')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/reviews
// @desc    Create a review
// Apply auth middleware to protect this route
router.post('/', auth, async (req, res) => {
  try {
    const { movieId, text, rating } = req.body;
    const userId = req.user.id;
    
    // Check if the movie exists
    const movie = await Movie.findById(movieId);
    if (!movie) {
      return res.status(404).json({ msg: 'Movie not found' });
    }

    // Check if user has already reviewed this movie
    const existingReview = await Review.findOne({
      user: userId,
      movie: movieId
    });

    if (existingReview) {
      return res.status(400).json({ msg: 'You have already reviewed this movie' });
    }

    // Create and save the review
    const review = new Review({
      user: userId,
      movie: movieId,
      text,
      rating
    });

    await review.save();

    // Update movie's average rating
    const reviews = await Review.find({ movie: movieId });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;

    await Movie.findByIdAndUpdate(movieId, { averageRating });

    // Add review to movie's reviews array
    movie.reviews.push(review._id);
    await movie.save();

    res.json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/reviews/:id
// @desc    Update a review
// Apply auth middleware to protect this route
router.put('/:id', auth, async (req, res) => {
  try {
    const { text, rating } = req.body;
    const userId = req.user.id;
    
    let review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ msg: 'Review not found' });
    }
    
    // Check if the user owns this review
    if (review.user.toString() !== userId) {
      return res.status(401).json({ msg: 'Not authorized to update this review' });
    }
    
    // Update review
    review.text = text;
    review.rating = rating;
    review = await review.save();
    
    // Update movie's average rating
    const movieId = review.movie;
    const reviews = await Review.find({ movie: movieId });
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    const averageRating = totalRating / reviews.length;
    
    await Movie.findByIdAndUpdate(movieId, { averageRating });
    
    res.json(review);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/reviews/:id
// @desc    Delete a review
// Apply auth middleware to protect this route
router.delete('/:id', auth, async (req, res) => {
  try {
    const userId = req.user.id;
    
    const review = await Review.findById(req.params.id);
    
    if (!review) {
      return res.status(404).json({ msg: 'Review not found' });
    }
    
    // Check if the user owns this review
    if (review.user.toString() !== userId) {
      return res.status(401).json({ msg: 'Not authorized to delete this review' });
    }
    
    const movieId = review.movie;
    
    // Remove review from movie's reviews array
    await Movie.findByIdAndUpdate(movieId, {
      $pull: { reviews: req.params.id }
    });
    
    // Delete the review using deleteOne() instead of remove()
    await Review.deleteOne({ _id: req.params.id });
    
    // Update movie's average rating
    const reviews = await Review.find({ movie: movieId });
    if (reviews.length > 0) {
      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const averageRating = totalRating / reviews.length;
      await Movie.findByIdAndUpdate(movieId, { averageRating });
    } else {
      await Movie.findByIdAndUpdate(movieId, { averageRating: 0 });
    }
    
    res.json({ msg: 'Review removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;