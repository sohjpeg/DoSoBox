const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Movie = require('../models/Movie');
const Review = require('../models/Review');
const auth = require('../middleware/auth');

// @route   GET api/users/current
// @desc    Get current authenticated user
router.get('/current', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    res.json(user);
  } catch (err) {
    console.error('Error in /current endpoint:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/:username
// @desc    Get user by username
router.get('/:username', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username })
      .select('-password');
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    res.json(user);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/:userId/reviews
// @desc    Get reviews by user ID
router.get('/:userId/reviews', async (req, res) => {
  try {
    const reviews = await Review.find({ user: req.params.userId })
      .populate('movie', 'title poster releaseYear')
      .sort({ createdAt: -1 });
    
    res.json(reviews);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/users/:username/watchlist
// @desc    Get user's watchlist
router.get('/:username/watchlist', async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    const watchlist = await Movie.find({ _id: { $in: user.watchlist } });
    res.json(watchlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/users/me/watchlist
// @desc    Add movie to user's watchlist
router.post('/me/watchlist', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    if (user.watchlist.includes(req.body.movieId)) {
      return res.status(400).json({ msg: 'Movie already in watchlist' });
    }
    
    user.watchlist.push(req.body.movieId);
    await user.save();
    
    res.json(user.watchlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/users/me/watchlist/:movieId
// @desc    Remove movie from user's watchlist
router.delete('/me/watchlist/:movieId', auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    user.watchlist = user.watchlist.filter(
      movie => movie.toString() !== req.params.movieId
    );
    
    await user.save();
    
    res.json(user.watchlist);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/users/me
// @desc    Update user profile
router.put('/me', auth, async (req, res) => {
  try {
    const { username, email, bio, profilePicture } = req.body;
    const userId = req.user.id;
    
    // Find user by ID
    let user = await User.findById(userId);
    
    if (!user) {
      return res.status(404).json({ msg: 'User not found' });
    }
    
    // Check if username is taken (if username is being changed)
    if (username && username !== user.username) {
      const existingUser = await User.findOne({ username });
      if (existingUser) {
        return res.status(400).json({ msg: 'Username already taken' });
      }
      user.username = username;
    }
    
    // Check if email is taken (if email is being changed)
    if (email && email !== user.email) {
      const existingUser = await User.findOne({ email });
      if (existingUser) {
        return res.status(400).json({ msg: 'Email already in use' });
      }
      user.email = email;
    }
    
    // Update bio and profile picture if provided
    if (bio !== undefined) user.bio = bio;
    if (profilePicture !== undefined) user.profilePicture = profilePicture;
    
    // Save updated user
    await user.save();
    
    // Return user without password
    const updatedUser = await User.findById(userId).select('-password');
    res.json(updatedUser);
  } catch (err) {
    console.error('Error updating profile:', err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;