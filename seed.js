const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Movie = require('./models/Movie');

// Load environment variables
dotenv.config();

const movies = [
  {
    title: 'The Shawshank Redemption',
    releaseYear: 1994,
    director: 'Frank Darabont',
    cast: ['Tim Robbins', 'Morgan Freeman', 'Bob Gunton'],
    genres: ['Drama'],
    plot: 'Two imprisoned men bond over a number of years, finding solace and eventual redemption through acts of common decency.',
    poster: 'https://m.media-amazon.com/images/M/MV5BNDE3ODcxYzMtY2YzZC00NmNlLWJiNDMtZDViZWM2MzIxZDYwXkEyXkFqcGdeQXVyNjAwNDUxODI@._V1_.jpg',
    averageRating: 4.7
  },
  {
    title: 'The Godfather',
    releaseYear: 1972,
    director: 'Francis Ford Coppola',
    cast: ['Marlon Brando', 'Al Pacino', 'James Caan'],
    genres: ['Crime', 'Drama'],
    plot: 'The aging patriarch of an organized crime dynasty transfers control of his clandestine empire to his reluctant son.',
    poster: 'https://m.media-amazon.com/images/M/MV5BM2MyNjYxNmUtYTAwNi00MTYxLWJmNWYtYzZlODY3ZTk3OTFlXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg',
    averageRating: 4.8
  },
  {
    title: 'The Dark Knight',
    releaseYear: 2008,
    director: 'Christopher Nolan',
    cast: ['Christian Bale', 'Heath Ledger', 'Aaron Eckhart'],
    genres: ['Action', 'Crime', 'Drama'],
    plot: 'When the menace known as the Joker wreaks havoc and chaos on the people of Gotham, Batman must accept one of the greatest psychological and physical tests of his ability to fight injustice.',
    poster: 'https://m.media-amazon.com/images/M/MV5BMTMxNTMwODM0NF5BMl5BanBnXkFtZTcwODAyMTk2Mw@@._V1_.jpg',
    averageRating: 4.6
  },
  {
    title: 'Pulp Fiction',
    releaseYear: 1994,
    director: 'Quentin Tarantino',
    cast: ['John Travolta', 'Uma Thurman', 'Samuel L. Jackson'],
    genres: ['Crime', 'Drama'],
    plot: 'The lives of two mob hitmen, a boxer, a gangster and his wife, and a pair of diner bandits intertwine in four tales of violence and redemption.',
    poster: 'https://m.media-amazon.com/images/M/MV5BNGNhMDIzZTUtNTBlZi00MTRlLWFjM2ItYzViMjE3YzI5MjljXkEyXkFqcGdeQXVyNzkwMjQ5NzM@._V1_.jpg',
    averageRating: 4.5
  },
  {
    title: 'Inception',
    releaseYear: 2010,
    director: 'Christopher Nolan',
    cast: ['Leonardo DiCaprio', 'Joseph Gordon-Levitt', 'Ellen Page'],
    genres: ['Action', 'Adventure', 'Sci-Fi'],
    plot: 'A thief who steals corporate secrets through the use of dream-sharing technology is given the inverse task of planting an idea into the mind of a C.E.O.',
    poster: 'https://m.media-amazon.com/images/M/MV5BMjAxMzY3NjcxNF5BMl5BanBnXkFtZTcwNTI5OTM0Mw@@._V1_.jpg',
    averageRating: 4.4
  },
  {
    title: 'The Matrix',
    releaseYear: 1999,
    director: 'Lana Wachowski, Lilly Wachowski',
    cast: ['Keanu Reeves', 'Laurence Fishburne', 'Carrie-Anne Moss'],
    genres: ['Action', 'Sci-Fi'],
    plot: 'A computer hacker learns from mysterious rebels about the true nature of his reality and his role in the war against its controllers.',
    poster: 'https://m.media-amazon.com/images/M/MV5BNzQzOTk3OTAtNDQ0Zi00ZTVkLWI0MTEtMDllZjNkYzNjNTc4L2ltYWdlXkEyXkFqcGdeQXVyNjU0OTQ0OTY@._V1_.jpg',
    averageRating: 4.3
  },
  {
    title: 'Parasite',
    releaseYear: 2019,
    director: 'Bong Joon Ho',
    cast: ['Song Kang-ho', 'Lee Sun-kyun', 'Cho Yeo-jeong'],
    genres: ['Comedy', 'Drama', 'Thriller'],
    plot: 'Greed and class discrimination threaten the newly formed symbiotic relationship between the wealthy Park family and the destitute Kim clan.',
    poster: 'https://m.media-amazon.com/images/M/MV5BYWZjMjk3ZTItODQ2ZC00NTY5LWE0ZDYtZTI3MjcwN2Q5NTVkXkEyXkFqcGdeQXVyODk4OTc3MTY@._V1_.jpg',
    averageRating: 4.6
  },
  {
    title: 'Everything Everywhere All at Once',
    releaseYear: 2022,
    director: 'Daniel Kwan, Daniel Scheinert',
    cast: ['Michelle Yeoh', 'Stephanie Hsu', 'Ke Huy Quan'],
    genres: ['Action', 'Adventure', 'Comedy'],
    plot: 'An aging Chinese immigrant is swept up in an insane adventure, where she alone can save the world by exploring other universes connecting with the lives she could have led.',
    poster: 'https://m.media-amazon.com/images/M/MV5BYTdiOTIyZTQtNmQ1OS00NjZlLWIyMTgtYzk5Y2M3ZDVmMDk1XkEyXkFqcGdeQXVyMTAzMDg4NzU0._V1_.jpg',
    averageRating: 4.7
  }
];

// Connect to MongoDB
mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/letterboxd-clone')
  .then(() => {
    console.log('MongoDB Connected');
    seedDB();
  })
  .catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1);
  });

// Seed the database
async function seedDB() {
  try {
    // Clear existing movies
    await Movie.deleteMany({});
    console.log('Movies collection cleared');

    // Add new movies
    await Movie.insertMany(movies);
    console.log('Sample movies added to the database');

    // Close connection
    mongoose.connection.close();
  } catch (error) {
    console.error('Error seeding database:', error);
    mongoose.connection.close();
  }
}