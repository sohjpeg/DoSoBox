const axios = require('axios');
const dotenv = require('dotenv');

dotenv.config();

const TMDB_API_KEY = process.env.TMDB_API_KEY || 'YOUR_API_KEY'; 
const BASE_URL = 'https://api.themoviedb.org/3';
const IMAGE_BASE_URL = 'https://image.tmdb.org/t/p/w500';

// Log API key status (sanitized)
console.log(`TMDb API Key status: ${TMDB_API_KEY === 'YOUR_API_KEY' ? 'Not configured properly' : 'Configured'}`);

/**
 * Get trending movies
 * @param {string} timeWindow - 'day' or 'week'
 * @param {number} page - Page number for results
 * @returns {Promise} - Promise with trending movies
 */
const getTrendingMovies = async (timeWindow = 'week', page = 1) => {
  try {
    console.log(`Fetching trending movies for ${timeWindow}, page ${page}`);
    const response = await axios.get(
      `${BASE_URL}/trending/movie/${timeWindow}?api_key=${TMDB_API_KEY}&page=${page}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching trending movies:', error.message);
    if (error.response) {
      console.error('TMDb API response status:', error.response.status);
      console.error('TMDb API response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Search movies by title
 * @param {string} query - Search query
 * @param {number} page - Page number for results
 * @returns {Promise} - Promise with search results
 */
const searchMovies = async (query, page = 1) => {
  try {
    console.log(`Searching for movies with query "${query}", page ${page}`);
    const response = await axios.get(
      `${BASE_URL}/search/movie?api_key=${TMDB_API_KEY}&query=${encodeURIComponent(query)}&page=${page}`
    );
    return response.data;
  } catch (error) {
    console.error('Error searching movies:', error.message);
    if (error.response) {
      console.error('TMDb API response status:', error.response.status);
      console.error('TMDb API response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Get movie details by TMDb ID
 * @param {number} id - TMDb movie ID
 * @returns {Promise} - Promise with movie details
 */
const getMovieDetails = async (id) => {
  try {
    console.log(`Fetching TMDb movie details for ID: ${id}`);
    const response = await axios.get(
      `${BASE_URL}/movie/${id}?api_key=${TMDB_API_KEY}&append_to_response=credits,videos`
    );
    return response.data;
  } catch (error) {
    console.error(`Error fetching TMDb movie details for ID ${id}:`, error.message);
    if (error.response) {
      console.error('TMDb API response status:', error.response.status);
      console.error('TMDb API response data:', error.response.data);
    }
    throw error;
  }
};

/**
 * Get movies by genre
 * @param {number} genreId - TMDb genre ID
 * @param {number} page - Page number for results
 * @returns {Promise} - Promise with movies in the specified genre
 */
const getMoviesByGenre = async (genreId, page = 1) => {
  try {
    const response = await axios.get(
      `${BASE_URL}/discover/movie?api_key=${TMDB_API_KEY}&with_genres=${genreId}&page=${page}`
    );
    return response.data;
  } catch (error) {
    console.error('Error fetching movies by genre:', error);
    throw error;
  }
};

/**
 * Format a TMDb movie object to match our database schema
 * @param {Object} tmdbMovie - Raw TMDb movie object
 * @returns {Object} - Formatted movie object matching our schema
 */
const formatMovie = (tmdbMovie) => {
  // Get director from crew if available
  let director = 'Unknown';
  if (tmdbMovie.credits && tmdbMovie.credits.crew) {
    const directorInfo = tmdbMovie.credits.crew.find(person => person.job === 'Director');
    if (directorInfo) {
      director = directorInfo.name;
    }
  }

  // Get cast if available
  let cast = [];
  if (tmdbMovie.credits && tmdbMovie.credits.cast) {
    cast = tmdbMovie.credits.cast.slice(0, 5).map(actor => actor.name);
  }

  // Format genres
  const genres = tmdbMovie.genres ? 
    tmdbMovie.genres.map(genre => genre.name) : 
    [];

  return {
    tmdbId: tmdbMovie.id,
    title: tmdbMovie.title,
    releaseYear: tmdbMovie.release_date ? parseInt(tmdbMovie.release_date.substring(0, 4)) : null,
    director,
    cast,
    genres,
    plot: tmdbMovie.overview || '',
    poster: tmdbMovie.poster_path ? `${IMAGE_BASE_URL}${tmdbMovie.poster_path}` : '',
    backdrop: tmdbMovie.backdrop_path ? `${IMAGE_BASE_URL}${tmdbMovie.backdrop_path}` : '',
    averageRating: 0,
    reviews: []
  };
};

module.exports = {
  getTrendingMovies,
  searchMovies,
  getMovieDetails,
  getMoviesByGenre,
  formatMovie
};