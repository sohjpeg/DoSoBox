const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Movie = require('./models/Movie');
const Review = require('./models/Review');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/letterboxd-clone')
  .then(() => console.log('MongoDB Connected'))
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Function to count and display entities
const displayStats = async () => {
  try {
    const userCount = await User.countDocuments();
    const movieCount = await Movie.countDocuments();
    const reviewCount = await Review.countDocuments();
    
    console.log('----------------------------------------');
    console.log('DosoBox Database Statistics:');
    console.log('----------------------------------------');
    console.log(`Users: ${userCount}`);
    console.log(`Movies: ${movieCount}`);
    console.log(`Reviews: ${reviewCount}`);
    console.log('----------------------------------------');
    
    // Get sample data for each collection
    if (userCount > 0) {
      const users = await User.find().limit(5).select('username email createdAt');
      console.log('\nSample Users:');
      users.forEach(user => {
        console.log(`- ${user.username} (${user.email}), created: ${user.createdAt}`);
      });
    }
    
    if (movieCount > 0) {
      const movies = await Movie.find().limit(5).select('title releaseYear reviews');
      console.log('\nSample Movies:');
      movies.forEach(movie => {
        console.log(`- ${movie.title} (${movie.releaseYear}) - Reviews: ${movie.reviews.length}`);
      });
    }
    
    if (reviewCount > 0) {
      const reviews = await Review.find().limit(5).populate('user', 'username').populate('movie', 'title');
      console.log('\nSample Reviews:');
      reviews.forEach(review => {
        const username = review.user ? review.user.username : 'Unknown User';
        const movieTitle = review.movie ? review.movie.title : 'Unknown Movie';
        console.log(`- Rating ${review.rating}/5 for "${movieTitle}" by ${username}`);
      });
    }
    
    mongoose.disconnect();
  } catch (error) {
    console.error('Error checking database:', error);
    mongoose.disconnect();
  }
};

displayStats();