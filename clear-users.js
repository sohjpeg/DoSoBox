const mongoose = require('mongoose');
const dotenv = require('dotenv');
const User = require('./models/User');
const Review = require('./models/Review');
const Movie = require('./models/Movie');

// Load environment variables
dotenv.config();

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/letterboxd-clone')
  .then(() => {
    console.log('MongoDB Connected');
    clearUserData();
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Function to clear all user data
async function clearUserData() {
  try {
    console.log('Starting user data cleanup...');
    
    // Get counts before deletion
    const userCountBefore = await User.countDocuments();
    const reviewCountBefore = await Review.countDocuments();
    
    console.log(`Current user count: ${userCountBefore}`);
    console.log(`Current review count: ${reviewCountBefore}`);
    
    // Step 1: Find all reviews created by users and remove them
    console.log('Deleting user reviews...');
    const deletedReviews = await Review.deleteMany({});
    
    // Step 2: Remove review references from movies
    console.log('Cleaning up movie review references...');
    await Movie.updateMany(
      {}, 
      { $set: { reviews: [], averageRating: 0 } }
    );
    
    // Step 3: Delete all users
    console.log('Deleting user accounts...');
    const deletedUsers = await User.deleteMany({});
    
    console.log('----------------------------------------');
    console.log('User Database Cleanup Results:');
    console.log('----------------------------------------');
    console.log(`Deleted ${deletedUsers.deletedCount} users`);
    console.log(`Deleted ${deletedReviews.deletedCount} reviews`);
    console.log('All user watchlists and reviews have been removed');
    console.log('Movie review references and ratings have been reset');
    console.log('Users collection has been cleared successfully.');
    console.log('----------------------------------------');
    
    // Close MongoDB connection
    mongoose.connection.close();
    console.log('MongoDB connection closed');
  } catch (error) {
    console.error('Error clearing user data:', error);
    mongoose.connection.close();
    process.exit(1);
  }
}