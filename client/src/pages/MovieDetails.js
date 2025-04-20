import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link as RouterLink } from 'react-router-dom';
import {
  Container,
  Grid,
  Typography,
  Box,
  Chip,
  Rating,
  Button,
  Paper,
  CircularProgress,
  Alert,
  List,
  ListItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Card,
  CardMedia,
  Avatar,
  Stack,
  alpha,
  Fade,
  useTheme,
} from '@mui/material';
import BookmarkAddIcon from '@mui/icons-material/BookmarkAdd';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import StarIcon from '@mui/icons-material/Star';
import TheatersIcon from '@mui/icons-material/Theaters';
import GroupIcon from '@mui/icons-material/Group';
import DescriptionIcon from '@mui/icons-material/Description';
import FormatQuoteIcon from '@mui/icons-material/FormatQuote';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const MovieDetails = () => {
  const { id } = useParams();
  const { currentUser } = useContext(AuthContext);
  const theme = useTheme();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [inWatchlist, setInWatchlist] = useState(false);
  const [reviews, setReviews] = useState([]);
  
  const [openReviewDialog, setOpenReviewDialog] = useState(false);
  const [reviewText, setReviewText] = useState('');
  const [reviewRating, setReviewRating] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [reviewError, setReviewError] = useState('');

  useEffect(() => {
    const fetchMovie = async () => {
      try {
        setLoading(true);
        setError(null);
        console.log(`Fetching movie with ID: ${id}`);
        
        // Try to get the movie details
        const response = await axios.get(`http://localhost:5001/api/movies/${id}`);
        console.log('Movie data received:', response.data);
        setMovie(response.data);
        
        try {
          // Get reviews for the movie
          const reviewsResponse = await axios.get(`http://localhost:5001/api/reviews/movie/${response.data._id}`);
          setReviews(reviewsResponse.data);
        } catch (reviewError) {
          console.error('Error fetching reviews:', reviewError);
          // Don't fail the whole page if just reviews fail to load
        }

        // Check if the movie is in user's watchlist
        if (currentUser) {
          try {
            const watchlistResponse = await axios.get(`http://localhost:5001/api/users/${currentUser.username}/watchlist`);
            const isInWatchlist = watchlistResponse.data.some(watchlistMovie => watchlistMovie._id === response.data._id);
            setInWatchlist(isInWatchlist);
          } catch (error) {
            console.error('Error checking watchlist status:', error);
          }
        }
      } catch (error) {
        console.error('Error fetching movie:', error);
        let errorMsg = 'Failed to load movie details. Please try again later.';
        
        if (error.response) {
          console.error('Error response:', error.response.status, error.response.data);
          if (error.response.status === 404) {
            errorMsg = 'Movie not found. It may have been removed or doesn\'t exist.';
          }
        }
        
        setError(errorMsg);
      } finally {
        setLoading(false);
      }
    };

    fetchMovie();
  }, [id, currentUser]);

  const handleWatchlistToggle = async () => {
    if (!currentUser) return;

    try {
      if (inWatchlist) {
        await axios.delete(`http://localhost:5001/api/users/me/watchlist/${movie._id}`);
        setInWatchlist(false);
      } else {
        await axios.post(`http://localhost:5001/api/users/me/watchlist`, {
          movieId: movie._id
        });
        setInWatchlist(true);
      }
    } catch (error) {
      console.error('Error updating watchlist:', error);
    }
  };

  const handleOpenReviewDialog = () => {
    setOpenReviewDialog(true);
  };

  const handleCloseReviewDialog = () => {
    setOpenReviewDialog(false);
    setReviewText('');
    setReviewRating(0);
    setReviewError('');
  };

  const handleSubmitReview = async () => {
    if (!currentUser) {
      setReviewError('You must be logged in to submit a review.');
      return;
    }

    if (reviewRating === 0) {
      setReviewError('Please select a rating.');
      return;
    }

    if (reviewText.trim() === '') {
      setReviewError('Please enter a review.');
      return;
    }

    try {
      setSubmitting(true);
      setReviewError('');

      const reviewData = {
        movieId: movie._id, // Use the MongoDB _id instead of the URL id parameter
        text: reviewText,
        rating: reviewRating
      };

      const response = await axios.post('http://localhost:5001/api/reviews', reviewData);
      
      // Add the current user's username to the new review for display
      const newReview = {
        ...response.data,
        user: {
          _id: currentUser._id,
          username: currentUser.username
        }
      };
      
      setReviews([newReview, ...reviews]);
      
      // Refresh movie data to get updated average rating
      const movieResponse = await axios.get(`http://localhost:5001/api/movies/${movie._id}`);
      setMovie(movieResponse.data);

      handleCloseReviewDialog();
    } catch (error) {
      console.error('Error submitting review:', error);
      setReviewError(error.response?.data?.msg || 'Failed to submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress size={60} thickness={4} color="primary" />
        <Typography variant="h6" sx={{ mt: 3, fontWeight: 300 }}>
          Loading movie details...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" 
          sx={{ 
            py: 3, 
            borderRadius: 2, 
            boxShadow: theme.shadows[3]
          }}
        >
          {error}
        </Alert>
      </Container>
    );
  }

  if (!movie) {
    return (
      <Container sx={{ py: 4 }}>
        <Alert severity="error" 
          sx={{ 
            py: 3, 
            borderRadius: 2, 
            boxShadow: theme.shadows[3]
          }}
        >
          Movie not found
        </Alert>
      </Container>
    );
  }

  return (
    <>
      {/* Movie backdrop hero section */}
      <Box
        sx={{
          position: 'relative',
          height: { xs: '300px', md: '400px' },
          width: '100%',
          overflow: 'hidden',
          mb: 4,
        }}
      >
        <Box
          sx={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: movie.backdrop 
              ? `url(${movie.backdrop})` 
              : `url(${movie.poster})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            '&::after': {
              content: '""',
              position: 'absolute',
              top: 0,
              left: 0,
              right: 0,
              bottom: 0,
              background: `linear-gradient(to top, ${theme.palette.background.default} 0%, transparent 60%, rgba(0,0,0,0.7) 100%)`,
            }
          }}
        />
      </Box>
      
      <Container maxWidth="lg" sx={{ position: 'relative', mt: -10 }}>
        <Grid container spacing={5}>
          <Grid item xs={12} md={4}>
            <Fade in={true} timeout={500}>
              <Card
                elevation={5}
                sx={{
                  borderRadius: 2,
                  overflow: 'hidden',
                  transition: 'transform 0.3s',
                  '&:hover': {
                    transform: 'scale(1.02)',
                  },
                }}
              >
                <CardMedia
                  component="img"
                  image={movie.poster || 'https://via.placeholder.com/500x750?text=No+Poster'}
                  alt={movie.title}
                  sx={{
                    height: 'auto',
                    width: '100%',
                  }}
                  onError={(e) => {
                    e.target.src = 'https://via.placeholder.com/500x750?text=No+Poster';
                  }}
                />
              </Card>
            </Fade>
            {currentUser && (
              <Button
                variant="contained"
                color={inWatchlist ? "secondary" : "primary"}
                startIcon={inWatchlist ? <BookmarkAddedIcon /> : <BookmarkAddIcon />}
                onClick={handleWatchlistToggle}
                fullWidth
                size="large"
                sx={{ 
                  mt: 3, 
                  py: 1.5,
                  fontWeight: 'bold',
                  borderRadius: 2,
                  boxShadow: 3
                }}
              >
                {inWatchlist ? 'Remove from Watchlist' : 'Add to Watchlist'}
              </Button>
            )}
          </Grid>

          <Grid item xs={12} md={8}>
            <Paper 
              elevation={4} 
              sx={{ 
                p: 4, 
                borderRadius: 3,
                background: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(8px)',
              }}
            >
              <Typography 
                variant="h3" 
                component="h1" 
                gutterBottom
                sx={{ 
                  fontWeight: 700,
                  color: theme.palette.primary.light
                }}
              >
                {movie.title}
                <Typography 
                  component="span" 
                  variant="h3" 
                  color="text.secondary"
                  sx={{ 
                    ml: 1, 
                    fontWeight: 300
                  }}
                >
                  ({movie.releaseYear})
                </Typography>
              </Typography>

              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  mb: 3,
                  p: 2,
                  borderRadius: 2,
                  background: alpha(theme.palette.background.default, 0.5)
                }}
              >
                <Rating
                  value={movie.averageRating || 0}
                  precision={0.5}
                  readOnly
                  size="large"
                  emptyIcon={<StarIcon style={{ opacity: 0.3 }} fontSize="inherit" />}
                  sx={{ 
                    mr: 2, 
                    '& .MuiRating-iconFilled': {
                      color: theme.palette.primary.main
                    }
                  }}
                />
                <Typography variant="h6" fontWeight={300}>
                  {movie.averageRating ? movie.averageRating.toFixed(1) : 'Not rated'} 
                  <Typography component="span" variant="body1" color="text.secondary" sx={{ ml: 1 }}>
                    ({movie.reviews?.length || 0} reviews)
                  </Typography>
                </Typography>
              </Box>

              <Box sx={{ mb: 4 }}>
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {movie.genres.map((genre) => (
                    <Chip
                      key={genre}
                      label={genre}
                      size="medium"
                      variant="filled"
                      color="primary"
                      sx={{ 
                        m: 0.5, 
                        fontWeight: 500,
                      }}
                    />
                  ))}
                </Stack>
              </Box>

              <Stack spacing={3}>
                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TheatersIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight={600}>
                      Director
                    </Typography>
                  </Box>
                  <Typography variant="body1" paragraph sx={{ ml: 4 }}>
                    {movie.director}
                  </Typography>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <GroupIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight={600}>
                      Cast
                    </Typography>
                  </Box>
                  <Typography variant="body1" paragraph sx={{ ml: 4 }}>
                    {movie.cast.join(', ')}
                  </Typography>
                </Box>

                <Box>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <DescriptionIcon color="primary" sx={{ mr: 1 }} />
                    <Typography variant="h6" fontWeight={600}>
                      Plot
                    </Typography>
                  </Box>
                  <Typography variant="body1" paragraph sx={{ ml: 4, fontStyle: 'italic' }}>
                    {movie.plot}
                  </Typography>
                </Box>
              </Stack>
            </Paper>

            <Paper 
              elevation={3} 
              sx={{ 
                mt: 4, 
                p: 3, 
                borderRadius: 3,
                background: alpha(theme.palette.background.paper, 0.9),
                backdropFilter: 'blur(8px)',
              }}
            >
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <FormatQuoteIcon color="primary" fontSize="large" sx={{ mr: 1 }} />
                <Typography variant="h5" fontWeight={600}>
                  Reviews
                </Typography>
              </Box>
              
              {reviews && reviews.length > 0 ? (
                <List>
                  {reviews.map((review, index) => (
                    <React.Fragment key={review._id || index}>
                      <ListItem 
                        alignItems="flex-start" 
                        sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          mb: 1,
                          bgcolor: alpha(theme.palette.background.default, 0.4)
                        }}
                      >
                        <Box sx={{ display: 'flex', width: '100%' }}>
                          <Avatar 
                            sx={{ 
                              mr: 2, 
                              bgcolor: theme.palette.primary.main 
                            }}
                            src={`https://ui-avatars.com/api/?name=${review.user?.username}&background=random`}
                          >
                            {review.user?.username?.charAt(0) || 'A'}
                          </Avatar>
                          <Box sx={{ flex: 1 }}>
                            <Box sx={{ 
                              display: 'flex', 
                              justifyContent: 'space-between',
                              alignItems: 'flex-start',
                              mb: 1
                            }}>
                              <Box>
                                <Typography 
                                  variant="subtitle1" 
                                  component={RouterLink}
                                  to={`/profile/${review.user?.username}`}
                                  sx={{ 
                                    fontWeight: 'bold', 
                                    color: theme.palette.primary.light,
                                    textDecoration: 'none',
                                    '&:hover': {
                                      textDecoration: 'underline'
                                    }
                                  }}
                                >
                                  {review.user?.username || 'Anonymous User'}
                                </Typography>
                              </Box>
                              <Rating 
                                value={review.rating} 
                                precision={0.5} 
                                readOnly 
                                size="small"
                                sx={{ mt: 0.5 }}
                              />
                            </Box>
                            <Typography variant="body1" sx={{ fontStyle: 'italic' }}>
                              "{review.text}"
                            </Typography>
                          </Box>
                        </Box>
                      </ListItem>
                      {index < reviews.length - 1 && <Box sx={{ my: 1 }} />}
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Box sx={{ 
                  p: 4, 
                  textAlign: 'center',
                  borderRadius: 2,
                  bgcolor: alpha(theme.palette.background.default, 0.4)
                }}>
                  <Typography variant="body1" color="text.secondary">
                    No reviews yet. Be the first to share your thoughts!
                  </Typography>
                </Box>
              )}
              
              {currentUser ? (
                <Button
                  variant="contained"
                  color="primary"
                  fullWidth
                  size="large"
                  sx={{ 
                    mt: 3,
                    py: 1.5,
                    fontWeight: 'bold',
                    borderRadius: 2,
                    boxShadow: 3
                  }}
                  onClick={handleOpenReviewDialog}
                >
                  Write a Review
                </Button>
              ) : (
                <Paper 
                  elevation={0}
                  sx={{ 
                    mt: 3, 
                    p: 2, 
                    textAlign: 'center',
                    borderRadius: 2,
                    bgcolor: alpha(theme.palette.background.default, 0.4)
                  }}
                >
                  <Typography variant="body1">
                    <RouterLink 
                      to="/login"
                      style={{
                        color: theme.palette.primary.main,
                        fontWeight: 'bold',
                        textDecoration: 'none'
                      }}
                    >
                      Sign in
                    </RouterLink> to leave a review
                  </Typography>
                </Paper>
              )}
            </Paper>
          </Grid>
        </Grid>

        <Dialog 
          open={openReviewDialog} 
          onClose={handleCloseReviewDialog}
          PaperProps={{
            sx: {
              borderRadius: 3,
              p: 1
            }
          }}
          maxWidth="sm"
          fullWidth
        >
          <DialogTitle sx={{ fontWeight: 700 }}>
            Review: {movie?.title}
          </DialogTitle>
          <DialogContent>
            <DialogContentText sx={{ mb: 3 }}>
              Share your thoughts and help others discover great movies.
            </DialogContentText>
            
            {reviewError && (
              <Alert severity="error" sx={{ mb: 3, borderRadius: 1 }}>
                {reviewError}
              </Alert>
            )}
            
            <Box sx={{ mb: 4, display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column' }}>
              <Typography component="legend" variant="h6" sx={{ mb: 1 }}>
                Your Rating
              </Typography>
              <Rating
                name="review-rating"
                value={reviewRating}
                onChange={(event, newValue) => {
                  setReviewRating(newValue);
                }}
                precision={0.5}
                size="large"
                sx={{ 
                  fontSize: '2rem',
                  '& .MuiRating-iconFilled': {
                    color: theme.palette.primary.main
                  }
                }}
              />
            </Box>
            
            <TextField
              autoFocus
              label="Your Review"
              fullWidth
              multiline
              rows={5}
              value={reviewText}
              onChange={(e) => setReviewText(e.target.value)}
              variant="outlined"
              placeholder="What did you think about this movie? (No spoilers please!)"
              sx={{ '& .MuiOutlinedInput-root': { borderRadius: 2 } }}
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <Button 
              onClick={handleCloseReviewDialog} 
              variant="outlined"
              sx={{ borderRadius: 2, px: 3 }}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleSubmitReview} 
              variant="contained"
              disabled={submitting}
              sx={{ borderRadius: 2, px: 3 }}
            >
              {submitting ? 'Submitting...' : 'Submit Review'}
            </Button>
          </DialogActions>
        </Dialog>
      </Container>
    </>
  );
};

export default MovieDetails;