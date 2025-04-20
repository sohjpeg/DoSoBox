const express = require('express');
const router = express.Router();
const Movie = require('../models/Movie');
const Review = require('../models/Review');
const tmdbApi = require('../utils/tmdbApi');
const auth = require('../middleware/auth');

// @route   GET api/movies
// @desc    Get all movies from the database
router.get('/', async (req, res) => {
  try {
    // Support sorting options
    const sortOption = req.query.sort || 'title';
    let sortQuery = {};
    
    switch(sortOption) {
      case 'rating':
        sortQuery = { averageRating: -1 };
        break;
      case 'newest':
        sortQuery = { releaseYear: -1 };
        break;
      case 'oldest':
        sortQuery = { releaseYear: 1 };
        break;
      default:
        sortQuery = { title: 1 };
    }
    
    const movies = await Movie.find().sort(sortQuery);
    res.json(movies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/movies/trending
// @desc    Get trending movies from TMDb
router.get('/trending', async (req, res) => {
  try {
    const page = req.query.page || 1;
    const timeWindow = req.query.time || 'week';
    
    const trendingData = await tmdbApi.getTrendingMovies(timeWindow, page);
    
    // Format the response to match our API structure
    const movies = trendingData.results.map(movie => ({
      tmdbId: movie.id,
      title: movie.title,
      releaseYear: movie.release_date ? parseInt(movie.release_date.substring(0, 4)) : null,
      director: "TMDb", // We'll get full details only when needed
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
      backdrop: movie.backdrop_path ? `https://image.tmdb.org/t/p/w500${movie.backdrop_path}` : '',
      plot: movie.overview,
      averageRating: movie.vote_average / 2, // TMDb uses 10-point scale, we use 5
    }));
    
    res.json({
      movies,
      page: trendingData.page,
      totalPages: trendingData.total_pages,
      totalResults: trendingData.total_results
    });
  } catch (err) {
    console.error('Error fetching trending movies:', err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/movies/search
// @desc    Search movies via TMDb
router.get('/search', async (req, res) => {
  try {
    const { query, page = 1 } = req.query;
    
    if (!query) {
      return res.status(400).json({ msg: 'Search query is required' });
    }
    
    const searchData = await tmdbApi.searchMovies(query, page);
    
    // Format the response
    const movies = searchData.results.map(movie => ({
      tmdbId: movie.id,
      title: movie.title,
      releaseYear: movie.release_date ? parseInt(movie.release_date.substring(0, 4)) : null,
      director: "TMDb", // We'll get full details only when needed
      poster: movie.poster_path ? `https://image.tmdb.org/t/p/w500${movie.poster_path}` : '',
      plot: movie.overview,
      averageRating: movie.vote_average / 2, // TMDb uses 10-point scale, we use 5
    }));
    
    res.json({
      movies,
      page: searchData.page,
      totalPages: searchData.total_pages,
      totalResults: searchData.total_results
    });
  } catch (err) {
    console.error('Error searching movies:', err);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/movies/:id
// @desc    Get movie by ID (either MongoDB ID or TMDb ID)
router.get('/:id', async (req, res) => {
  try {
    let movie;
    console.log(`Movie ID request received: ${req.params.id}`);
    
    // Check if the ID is a valid MongoDB ObjectId
    if (req.params.id.match(/^[0-9a-fA-F]{24}$/)) {
      // It's a MongoDB ID
      console.log('Treating as MongoDB ID');
      movie = await Movie.findById(req.params.id);
      
      if (!movie) {
        console.log('Movie not found in database');
        return res.status(404).json({ msg: 'Movie not found in database' });
      }
    } else {
      // Check if it's a TMDb ID (should be numeric)
      const tmdbId = parseInt(req.params.id);
      console.log(`Treating as TMDb ID: ${tmdbId}`);
      
      if (isNaN(tmdbId)) {
        console.log('Invalid movie ID format');
        return res.status(400).json({ msg: 'Invalid movie ID format' });
      }
      
      // Check if we already have this movie in our database
      movie = await Movie.findOne({ tmdbId });
      
      if (!movie) {
        console.log(`Movie with TMDb ID ${tmdbId} not found in database, fetching from TMDb API`);
        try {
          // Fetch from TMDb API
          const tmdbMovie = await tmdbApi.getMovieDetails(tmdbId);
          console.log('Successfully fetched movie from TMDb API');
          
          const formattedMovie = tmdbApi.formatMovie(tmdbMovie);
          
          // Save to our database for future reference
          movie = new Movie(formattedMovie);
          await movie.save();
          console.log('Saved TMDb movie to database');
        } catch (tmdbError) {
          console.error('Error fetching from TMDb:', tmdbError.message);
          if (tmdbError.response) {
            console.error('TMDb response status:', tmdbError.response.status);
          }
          throw tmdbError;  // Let the outer catch handle it
        }
      } else {
        console.log('TMDb movie found in local database');
      }
    }
    
    console.log('Sending movie response');
    res.json(movie);
  } catch (err) {
    console.error('Error in GET movie/:id route:', err.message);
    
    if (err.response && err.response.status === 404) {
      return res.status(404).json({ msg: 'Movie not found in TMDb' });
    }
    
    res.status(500).send('Server Error');
  }
});

// @route   GET api/movies/genre/:genre
// @desc    Get movies by genre
router.get('/genre/:genre', async (req, res) => {
  try {
    // Get the requested genre from the URL param
    const genreName = req.params.genre;
    
    // Support pagination for large genre collections
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 20;
    const skip = (page - 1) * limit;
    
    // Find movies by genre (case-insensitive search)
    const genreRegex = new RegExp(genreName, 'i');
    
    // First, count total matching documents
    const total = await Movie.countDocuments({ 
      genres: { $elemMatch: { $regex: genreRegex } }
    });
    
    // Then get paginated result
    const movies = await Movie.find({ 
      genres: { $elemMatch: { $regex: genreRegex } }
    })
    .sort({ averageRating: -1 }) // Sort by rating
    .skip(skip)
    .limit(limit);
    
    // Return with pagination metadata
    res.json({
      movies,
      page,
      totalPages: Math.ceil(total / limit),
      totalResults: total,
      genre: genreName
    });
  } catch (err) {
    console.error('Error fetching movies by genre:', err.message);
    res.status(500).send('Server Error');
  }
});

// @route   GET api/movies/search/:query
// @desc    Search movies by title in database
router.get('/search/:query', async (req, res) => {
  try {
    const searchRegex = new RegExp(req.params.query, 'i');
    const movies = await Movie.find({ title: { $regex: searchRegex } }).sort({ title: 1 });
    res.json(movies);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   POST api/movies
// @desc    Create a movie
router.post('/', async (req, res) => {
  try {
    const newMovie = new Movie(req.body);
    const movie = await newMovie.save();
    res.json(movie);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   PUT api/movies/:id
// @desc    Update a movie
router.put('/:id', async (req, res) => {
  try {
    const movie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );
    if (!movie) {
      return res.status(404).json({ msg: 'Movie not found' });
    }
    res.json(movie);
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

// @route   DELETE api/movies/:id
// @desc    Delete a movie
router.delete('/:id', async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    if (!movie) {
      return res.status(404).json({ msg: 'Movie not found' });
    }

    // Delete all reviews associated with this movie
    await Review.deleteMany({ movie: req.params.id });

    // Use deleteOne() instead of remove()
    await Movie.deleteOne({ _id: req.params.id });
    res.json({ msg: 'Movie removed' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Server Error');
  }
});

module.exports = router;