const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// @route   POST api/auth/register
// @desc    Register user
router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;

  try {
    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({ msg: 'User already exists' });
    }

    // Check if username is taken
    user = await User.findOne({ username });
    if (user) {
      return res.status(400).json({ msg: 'Username already taken' });
    }

    // Create new user
    user = new User({
      username,
      email,
      password
    });

    // Save user to database (password will be hashed via pre-save hook)
    await user.save();

    // Create and return JWT
    const payload = {
      user: {
        id: user.id
      }
    };

    jwt.sign(
      payload,
      process.env.JWT_SECRET || 'secret',
      { expiresIn: '7d' },
      (err, token) => {
        if (err) throw err;
        res.json({ token });
      }
    );
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server error');
  }
});

// @route   POST api/auth/login
// @desc    Login user & get token
router.post('/login', async (req, res) => {
  const { email, password } = req.body;
  
  console.log('Login attempt for email:', email);

  try {
    // Check if user exists
    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      console.log('User not found with email:', email);
      return res.status(400).json({ msg: 'Invalid credentials' });
    }

    console.log('User found:', user.username);
    
    // Use the model's comparePassword method instead of direct bcrypt compare
    try {
      const isMatch = await user.comparePassword(password);
      console.log('Password match result:', isMatch);
      
      if (isMatch) {
        // Create and return JWT
        const payload = {
          user: {
            id: user.id
          }
        };

        jwt.sign(
          payload,
          process.env.JWT_SECRET || 'secret',
          { expiresIn: '7d' },
          (err, token) => {
            if (err) {
              console.error('JWT error:', err);
              throw err;
            }
            res.json({ token });
          }
        );
      } else {
        return res.status(400).json({ msg: 'Invalid password' });
      }
    } catch (err) {
      console.error('Password comparison error:', err);
      return res.status(500).json({ msg: 'Error verifying password' });
    }
  } catch (err) {
    console.error('Login error:', err);
    res.status(500).json({ msg: 'Server error during login' });
  }
});

module.exports = router;