import React, { useState, useEffect, useContext, useCallback } from 'react';
import {
  Container,
  Grid,
  Card,
  CardMedia,
  Typography,
  Rating,
  Box,
  CircularProgress,
  Alert,
  TextField,
  InputAdornment,
  IconButton,
  Tabs,
  Tab,
  Pagination,
  Button,
  useTheme,
  Chip,
  Fade,
  Zoom,
  Divider,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import SearchIcon from '@mui/icons-material/Search';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import StarIcon from '@mui/icons-material/Star';
import LocalOfferIcon from '@mui/icons-material/LocalOffer';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

// Define API base URL
const API_BASE_URL = 'http://localhost:5001/api';

const Home = () => {
  const theme = useTheme();
  const { currentUser } = useContext(AuthContext);
  
  // Separate state for trending and search results
  const [trendingMovies, setTrendingMovies] = useState([]);
  const [searchResults, setSearchResults] = useState([]);
  
  // Loading states
  const [trendingLoading, setTrendingLoading] = useState(true);
  const [searchLoading, setSearchLoading] = useState(false);
  const [initialLoad, setInitialLoad] = useState(true);
  
  // Other state
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  
  // Pagination states
  const [trendingPage, setTrendingPage] = useState(1);
  const [searchPage, setSearchPage] = useState(1);
  const [trendingTotalPages, setTrendingTotalPages] = useState(1);
  const [searchTotalPages, setSearchTotalPages] = useState(1);

  // Animation controls
  const [searchFocused, setSearchFocused] = useState(false);

  // Debounce search query
  useEffect(() => {
    const timerId = setTimeout(() => {
      if (searchQuery.trim()) {
        setDebouncedQuery(searchQuery);
        if (activeTab === 1) {
          setSearchPage(1); // Reset to page 1 when search query changes
        }
      }
    }, 500); // Wait 500ms after user stops typing before updating

    return () => {
      clearTimeout(timerId);
    };
  }, [searchQuery, activeTab]);

  // Function to fetch trending movies
  const fetchTrendingMovies = useCallback(async (pageNum) => {
    try {
      setTrendingLoading(true);
      const response = await axios.get(`${API_BASE_URL}/movies/trending?page=${pageNum}`);
      console.log('Trending API response:', response.data);
      setTrendingMovies(response.data.movies);
      setTrendingTotalPages(response.data.totalPages > 10 ? 10 : response.data.totalPages); // Limit to 10 pages
      setError(null);
    } catch (err) {
      console.error('Error fetching trending movies:', err);
      setError('Failed to load trending movies. Please try again later.');
    } finally {
      setTrendingLoading(false);
      setInitialLoad(false);
    }
  }, []);

  // Function to fetch search results
  const fetchSearchResults = useCallback(async (query, pageNum) => {
    if (!query.trim()) return;
    
    try {
      setSearchLoading(true);
      const response = await axios.get(`${API_BASE_URL}/movies/search?query=${encodeURIComponent(query)}&page=${pageNum}`);
      console.log('Search API response:', response.data);
      setSearchResults(response.data.movies);
      setSearchTotalPages(response.data.totalPages > 10 ? 10 : response.data.totalPages); // Limit to 10 pages
      setError(null);
    } catch (err) {
      console.error('Error fetching search results:', err);
      setError('Failed to load search results. Please try again later.');
    } finally {
      setSearchLoading(false);
    }
  }, []);

  // Fetch trending movies on initial load and when trending page changes
  useEffect(() => {
    fetchTrendingMovies(trendingPage);
  }, [trendingPage, fetchTrendingMovies]);

  // Fetch search results when debounced query changes or search page changes
  useEffect(() => {
    if (debouncedQuery) {
      fetchSearchResults(debouncedQuery, searchPage);
    }
  }, [debouncedQuery, searchPage, fetchSearchResults]);

  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // No need to reset pages here as we maintain separate pagination for each tab
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setDebouncedQuery(searchQuery);
      setActiveTab(1); // Switch to search tab
      setSearchPage(1); // Reset to page 1
    }
  };

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchQuery(value);
    
    // If search field is cleared, go back to trending tab
    if (!value.trim() && activeTab === 1) {
      setActiveTab(0);
      setDebouncedQuery('');
    }
  };

  const handlePageChange = (event, value) => {
    if (activeTab === 0) {
      setTrendingPage(value);
    } else {
      setSearchPage(value);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' }); // Smooth scroll to top when changing pages
  };

  // Generate a random rating color for visual diversity
  const getRatingColor = (rating) => {
    if (!rating) return theme.palette.grey[500];
    if (rating < 2) return theme.palette.error.main;
    if (rating < 3) return theme.palette.warning.main;
    if (rating < 4) return theme.palette.info.main;
    return theme.palette.success.main;
  };

  // Extract first genre for movie card chip
  const getFirstGenre = (movie) => {
    if (movie.genres && movie.genres.length > 0) {
      return movie.genres[0];
    }
    return null;
  };

  const renderMovieGrid = (moviesToRender) => {
    if (!moviesToRender || moviesToRender.length === 0) {
      return (
        <Box sx={{ py: 6, textAlign: 'center', mt: 2 }}>
          <Zoom in={true} style={{ transitionDelay: '100ms' }}>
            <Box>
              <Box 
                component="img" 
                src="https://cdn-icons-png.flaticon.com/512/3875/3875172.png" 
                alt="No movies found"
                sx={{ 
                  width: 120, 
                  height: 120, 
                  opacity: 0.5, 
                  mb: 3,
                  filter: 'grayscale(100%)'
                }}
              />
              <Typography variant="h6" color="text.secondary" gutterBottom>
                No movies found
              </Typography>
              <Typography variant="body1" color="text.secondary">
                Try adjusting your search or browse trending movies
              </Typography>
            </Box>
          </Zoom>
        </Box>
      );
    }

    return (
      <Grid container spacing={3} className="staggered-list">
        {moviesToRender.map((movie, index) => {
          const ratingColor = getRatingColor(movie.averageRating);
          const firstGenre = getFirstGenre(movie);
          
          return (
            <Grid item key={movie.tmdbId || movie._id} xs={12} sm={6} md={4} lg={3} className="staggered-item">
              <Card
                component={RouterLink}
                to={`/movie/${movie._id || movie.tmdbId}`}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  textDecoration: 'none',
                  transition: 'all 0.3s ease',
                  borderRadius: 3,
                  overflow: 'hidden',
                  boxShadow: theme.shadows[4],
                  position: 'relative',
                  '&:hover': {
                    transform: 'translateY(-12px)',
                    boxShadow: theme.shadows[15],
                    '& .movie-overlay': {
                      opacity: 1,
                    },
                    '& .movie-rating': {
                      opacity: 1,
                      transform: 'translateY(0)',
                    },
                    '& .movie-image': {
                      filter: 'brightness(0.65) saturate(1.2)',
                    },
                    '& .movie-genre-chip': {
                      transform: 'translateY(0)',
                      opacity: 1,
                    }
                  },
                }}
                className="shine-effect"
              >
                {firstGenre && (
                  <Chip
                    label={firstGenre}
                    size="small"
                    color="primary"
                    icon={<LocalOfferIcon fontSize="small" />}
                    className="movie-genre-chip"
                    sx={{
                      position: 'absolute',
                      top: 10,
                      right: 10,
                      zIndex: 10,
                      transform: 'translateY(-10px)',
                      opacity: 0.9,
                      transition: 'all 0.3s ease',
                      backgroundColor: 'rgba(0,0,0,0.6)',
                      backdropFilter: 'blur(5px)',
                      fontWeight: 500,
                    }}
                  />
                )}
                
                <CardMedia
                  component="img"
                  height="350"
                  image={movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'}
                  alt={movie.title}
                  className="movie-image"
                  sx={{
                    transition: 'all 0.4s ease',
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster';
                  }}
                />
                
                <Box 
                  className="movie-overlay" 
                  sx={{ 
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    background: 'linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.5) 70%, transparent 100%)',
                    p: 2,
                    opacity: 0.9,
                    transition: 'all 0.3s ease',
                    height: '60%',
                    display: 'flex',
                    flexDirection: 'column',
                    justifyContent: 'flex-end',
                  }}
                >
                  <Typography 
                    gutterBottom 
                    variant="h6" 
                    component="h2"
                    sx={{ 
                      color: 'white',
                      fontWeight: 'bold',
                      textShadow: '1px 1px 3px rgba(0,0,0,0.7)'
                    }}
                  >
                    {movie.title}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        color: 'rgba(255,255,255,0.85)',
                        display: 'inline-block'
                      }}
                    >
                      {movie.releaseYear}
                    </Typography>
                    
                    <Box 
                      className="movie-rating"
                      sx={{ 
                        display: 'flex', 
                        alignItems: 'center',
                        opacity: 0.7,
                        transform: 'translateY(10px)',
                        transition: 'all 0.3s ease',
                      }}
                    >
                      <Rating
                        value={movie.averageRating || 0}
                        precision={0.5}
                        readOnly
                        size="small"
                        icon={<StarIcon fontSize="inherit" />}
                        emptyIcon={<StarIcon fontSize="inherit" style={{ opacity: 0.3 }} />}
                        sx={{
                          '& .MuiRating-iconFilled': {
                            color: ratingColor,
                          },
                          '& .MuiRating-iconEmpty': {
                            color: 'rgba(255,255,255,0.3)',
                          }
                        }}
                      />
                    </Box>
                  </Box>
                </Box>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  // Only show full page loading on initial load
  if (trendingLoading && initialLoad) {
    return (
      <Container maxWidth="lg" sx={{ py: 12, textAlign: 'center' }}>
        <CircularProgress size={60} sx={{ color: theme.palette.primary.main }} />
        <Typography variant="h5" sx={{ mt: 4, fontWeight: 500 }}>
          Loading the best movies for you...
        </Typography>
      </Container>
    );
  }

  if (error && 
      ((activeTab === 0 && !trendingMovies.length) || 
       (activeTab === 1 && !searchResults.length))) {
    return (
      <Container maxWidth="lg" sx={{ py: 8 }}>
        <Alert 
          severity="error" 
          variant="filled"
          sx={{ 
            borderRadius: 2, 
            boxShadow: theme.shadows[3],
            animation: 'fadeIn 0.5s ease-out'
          }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  // Only show "no movies found" for search tab
  if (searchResults.length === 0 && debouncedQuery && activeTab === 1 && !searchLoading) {
    return (
      <Container maxWidth="lg" sx={{ py: 4 }}>
        <Alert 
          severity="info"
          variant="filled"
          sx={{ 
            borderRadius: 2, 
            boxShadow: theme.shadows[3],
            animation: 'fadeIn 0.5s ease-out'
          }}
        >
          No movies found matching "{debouncedQuery}". Try a different search term.
        </Alert>
      </Container>
    );
  }

  return (
    <Container maxWidth="lg" sx={{ py: { xs: 4, md: 6 } }}>
      {/* Hero Banner */}
      <Fade in={true} timeout={800}>
        <Box 
          sx={{ 
            mb: 6, 
            textAlign: 'center',
            px: { xs: 2, md: 8 },
          }}
        >
          <Typography 
            variant="h3" 
            component="h1" 
            gutterBottom
            sx={{ 
              fontWeight: 700,
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.secondary.main} 90%)`,
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
              mb: 2
            }}
          >
            Discover Amazing Movies
          </Typography>
          <Typography 
            variant="h6" 
            color="text.secondary"
            sx={{ 
              maxWidth: '800px', 
              mx: 'auto', 
              mb: 4,
              fontWeight: 400,
              fontSize: '1.1rem'
            }}
          >
            Find trending movies, search for your favorites, and explore the best of cinema
          </Typography>
        </Box>
      </Fade>

      {/* Search bar with enhanced styling */}
      <Fade in={true} timeout={1000}>
        <Box 
          component="form" 
          onSubmit={handleSearchSubmit} 
          sx={{ 
            mb: 5,
            position: 'relative',
            maxWidth: '800px',
            mx: 'auto',
            transformOrigin: 'center',
            transform: searchFocused ? 'scale(1.02)' : 'scale(1)',
            transition: 'all 0.3s ease',
          }}
        >
          <TextField
            fullWidth
            placeholder="Search for movies..."
            value={searchQuery}
            onChange={handleSearchChange}
            onFocus={() => setSearchFocused(true)}
            onBlur={() => setSearchFocused(false)}
            variant="outlined"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
              endAdornment: searchQuery && (
                <InputAdornment position="end">
                  {searchLoading ? (
                    <CircularProgress size={20} sx={{ mr: 1 }} />
                  ) : (
                    <IconButton 
                      edge="end" 
                      onClick={() => {
                        setSearchQuery('');
                        setDebouncedQuery('');
                        setActiveTab(0);
                      }}
                      size="small"
                      sx={{ mr: 0.5 }}
                    >
                      <Box 
                        component="span" 
                        sx={{ 
                          fontSize: '18px',
                          lineHeight: 0,
                          fontWeight: 'bold',
                          color: 'text.secondary',
                          opacity: 0.7,
                          '&:hover': {
                            opacity: 1
                          }
                        }}
                      >
                        ×
                      </Box>
                    </IconButton>
                  )}
                </InputAdornment>
              ),
              sx: { 
                pr: 1,
                borderRadius: 5,
                backgroundColor: theme.palette.background.paper,
                height: 56,
                boxShadow: searchFocused ? theme.shadows[8] : theme.shadows[4],
                transition: 'all 0.3s ease',
                '&:hover': {
                  backgroundColor: theme.palette.mode === 'dark' 
                    ? 'rgba(255, 255, 255, 0.09)'
                    : 'rgba(0, 0, 0, 0.09)',
                },
              }
            }}
            sx={{
              '& .MuiOutlinedInput-notchedOutline': {
                borderWidth: '1px',
                borderColor: 'transparent !important',
              },
              '& .MuiOutlinedInput-root.Mui-focused': {
                boxShadow: `0 0 0 2px ${theme.palette.primary.main}`,
              },
            }}
          />
          <Button 
            type="submit" 
            variant="contained" 
            sx={{ 
              position: 'absolute',
              right: 8,
              top: '50%',
              transform: 'translateY(-50%)',
              borderRadius: 5,
              zIndex: 2,
              px: 3,
              py: 1,
              minWidth: 'auto',
              boxShadow: theme.shadows[2],
              background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
              '&:hover': {
                boxShadow: theme.shadows[8],
                background: `linear-gradient(45deg, ${theme.palette.primary.dark} 30%, ${theme.palette.primary.main} 90%)`,
              }
            }}
          >
            Search
          </Button>
        </Box>
      </Fade>

      {/* Divider */}
      <Divider sx={{ mb: 4, opacity: 0.1 }} />

      {/* Tabs */}
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange} 
        sx={{ 
          mb: 4, 
          borderBottom: 1, 
          borderColor: 'divider',
          '& .MuiTabs-flexContainer': {
            justifyContent: { xs: 'flex-start', md: 'center' },
          },
          '& .MuiTabs-indicator': {
            height: 3,
            borderTopLeftRadius: 3,
            borderTopRightRadius: 3,
            backgroundColor: theme.palette.primary.main,
          },
          '& .MuiTab-root': {
            textTransform: 'none',
            minWidth: 'auto',
            px: { xs: 2, sm: 3 },
            py: 2,
            fontSize: { xs: '1rem', sm: '1.1rem' },
            fontWeight: 500,
            transition: 'all 0.2s ease',
            '&.Mui-selected': {
              fontWeight: 700,
              color: theme.palette.primary.main,
            }
          }
        }} 
        variant="scrollable" 
        scrollButtons="auto"
      >
        <Tab 
          icon={<TrendingUpIcon />} 
          iconPosition="start" 
          label="Trending" 
          sx={{ 
            borderRadius: '8px 8px 0 0',
            mr: 1,
          }}
        />
        {searchQuery && (
          <Tab 
            icon={<SearchIcon />} 
            iconPosition="start" 
            label="Search Results" 
            sx={{ 
              borderRadius: '8px 8px 0 0',
              ml: 1,
            }}
          />
        )}
      </Tabs>

      {/* Content based on active tab */}
      {activeTab === 0 && (
        <Fade in={true} timeout={500}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 600,
                  position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: 0,
                    width: 60,
                    height: 3,
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: 4,
                  }
                }}
              >
                Trending Movies
              </Typography>
              
              {!trendingLoading && (
                <Chip 
                  label={`${trendingMovies.length} movies`}
                  size="medium"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
            
            {trendingLoading && !initialLoad ? (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress size={40} color="primary" />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Loading trending movies...
                </Typography>
              </Box>
            ) : (
              renderMovieGrid(trendingMovies)
            )}
            
            {/* Pagination */}
            {trendingTotalPages > 1 && !trendingLoading && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 2 }}>
                <Pagination 
                  count={trendingTotalPages} 
                  page={trendingPage} 
                  onChange={handlePageChange} 
                  color="primary" 
                  size="large"
                  shape="rounded"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      mx: 0.5,
                    },
                    '& .Mui-selected': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                      boxShadow: theme.shadows[2],
                    }
                  }}
                />
              </Box>
            )}
          </Box>
        </Fade>
      )}

      {activeTab === 1 && searchQuery && (
        <Fade in={true} timeout={500}>
          <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
              <Typography 
                variant="h4" 
                component="h1" 
                sx={{ 
                  fontWeight: 600,
                  position: 'relative',
                  '&:after': {
                    content: '""',
                    position: 'absolute',
                    bottom: -8,
                    left: 0,
                    width: 60,
                    height: 3,
                    backgroundColor: theme.palette.primary.main,
                    borderRadius: 4,
                  }
                }}
              >
                Results for "{searchQuery}"
              </Typography>
              
              {!searchLoading && searchResults.length > 0 && (
                <Chip 
                  label={`${searchResults.length} results`}
                  size="medium"
                  color="primary"
                  variant="outlined"
                />
              )}
            </Box>
            
            {searchLoading ? (
              <Box sx={{ py: 8, textAlign: 'center' }}>
                <CircularProgress size={40} color="primary" />
                <Typography variant="body1" sx={{ mt: 2 }}>
                  Searching for "{searchQuery}"...
                </Typography>
              </Box>
            ) : (
              renderMovieGrid(searchResults)
            )}
            
            {/* Pagination */}
            {searchTotalPages > 1 && !searchLoading && searchResults.length > 0 && (
              <Box sx={{ display: 'flex', justifyContent: 'center', mt: 6, mb: 2 }}>
                <Pagination 
                  count={searchTotalPages} 
                  page={searchPage} 
                  onChange={handlePageChange} 
                  color="primary" 
                  size="large"
                  shape="rounded"
                  sx={{
                    '& .MuiPaginationItem-root': {
                      fontWeight: 500,
                      transition: 'all 0.2s',
                      mx: 0.5,
                    },
                    '& .Mui-selected': {
                      background: `linear-gradient(45deg, ${theme.palette.primary.main} 30%, ${theme.palette.primary.light} 90%)`,
                      boxShadow: theme.shadows[2],
                    }
                  }}
                />
              </Box>
            )}
          </Box>
        </Fade>
      )}
    </Container>
  );
};

export default Home;