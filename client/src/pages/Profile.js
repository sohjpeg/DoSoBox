import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Container,
  Grid,
  Paper,
  Typography,
  Avatar,
  Box,
  Tabs,
  Tab,
  Rating,
  Button,
  CircularProgress,
  Card,
  CardMedia,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
  TextField,
  Alert,
  Snackbar
} from '@mui/material';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Profile = () => {
  const { username } = useParams();
  const { currentUser, updateUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [user, setUser] = useState(null);
  const [reviews, setReviews] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [tabValue, setTabValue] = useState(0);
  
  // Edit profile state
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [profileForm, setProfileForm] = useState({
    username: '',
    email: '',
    bio: '',
    profilePicture: ''
  });
  const [formError, setFormError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  
  const isCurrentUser = username === 'me' || (currentUser && currentUser.username === username);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Determine which API endpoint to use based on whether viewing own profile
        const targetUsername = username === 'me' ? (currentUser ? currentUser.username : null) : username;
        
        if (!targetUsername) {
          setError('Please log in to view your profile');
          setLoading(false);
          return;
        }
        
        // Get user data
        let userId;
        let userData;
        
        if (username === 'me' && currentUser) {
          userData = currentUser;
          userId = currentUser._id;
        } else {
          const userResponse = await axios.get(`http://localhost:5001/api/users/${targetUsername}`);
          userData = userResponse.data;
          userId = userData._id;
        }
        
        setUser(userData);
        
        // Initialize profile form with current user data
        if (isCurrentUser) {
          setProfileForm({
            username: userData.username || '',
            email: userData.email || '',
            bio: userData.bio || '',
            profilePicture: userData.profilePicture || ''
          });
        }
        
        // Get reviews and watchlist in parallel
        const [reviewsResponse, watchlistResponse] = await Promise.all([
          axios.get(`http://localhost:5001/api/users/${userId}/reviews`),
          axios.get(`http://localhost:5001/api/users/${targetUsername}/watchlist`)
        ]);
        
        setReviews(reviewsResponse.data);
        setWatchlist(watchlistResponse.data);
      } catch (error) {
        console.error('Error fetching user data:', error);
        setError('Failed to load profile. Please try again.');
      } finally {
        setLoading(false);
      }
    };

    if (username === 'me' && !currentUser) {
      setError('Please log in to view your profile');
      setLoading(false);
    } else {
      fetchUserData();
    }
  }, [username, currentUser, isCurrentUser]);

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleOpenEditDialog = () => {
    setOpenEditDialog(true);
    setFormError('');
  };
  
  const handleCloseEditDialog = () => {
    setOpenEditDialog(false);
    setFormError('');
  };
  
  const handleProfileChange = (e) => {
    const { name, value } = e.target;
    setProfileForm(prev => ({ ...prev, [name]: value }));
    if (formError) setFormError('');
  };
  
  const handleProfileUpdate = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError('');
    
    try {
      console.log('Sending profile update:', profileForm);
      const response = await axios.put('http://localhost:5001/api/users/me', profileForm);
      
      // Update local state
      setUser(response.data);
      
      // Update global auth context
      updateUser(response.data);
      
      // If username changed, redirect to new profile URL
      if (response.data.username !== currentUser.username) {
        navigate(`/profile/${response.data.username}`);
      }
      
      handleCloseEditDialog();
      setSuccessMessage('Profile updated successfully!');
      
    } catch (error) {
      console.error('Error updating profile:', error);
      if (error.response && error.response.data) {
        setFormError(error.response.data.msg || 'Failed to update profile');
      } else {
        setFormError('An error occurred. Please try again.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSuccessMessage('');
  };

  if (loading) {
    return (
      <Container sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography variant="h6" sx={{ mt: 2 }}>
          Loading profile...
        </Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" color="error" gutterBottom>
            {error}
          </Typography>
          {!currentUser && (
            <Button 
              variant="contained" 
              component={RouterLink} 
              to="/login" 
              sx={{ mt: 2 }}
            >
              Login
            </Button>
          )}
        </Paper>
      </Container>
    );
  }

  if (!user) {
    return (
      <Container sx={{ py: 4 }}>
        <Paper elevation={3} sx={{ p: 4, textAlign: 'center' }}>
          <Typography variant="h5" gutterBottom>
            User not found
          </Typography>
          <Button variant="contained" component={RouterLink} to="/" sx={{ mt: 2 }}>
            Go Home
          </Button>
        </Paper>
      </Container>
    );
  }

  return (
    <Container sx={{ py: 4 }}>
      <Snackbar
        open={Boolean(successMessage)}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        message={successMessage}
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
      />
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={4}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <Avatar
                src={user.profilePicture || `https://ui-avatars.com/api/?name=${user.username}&background=random`}
                sx={{ width: 120, height: 120, mb: 2 }}
              />
              <Typography variant="h4" gutterBottom>
                {user.username}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {user.bio || 'No bio yet'}
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, mt: 2 }}>
                <Typography variant="body2">
                  <strong>{user.followers?.length || 0}</strong> Followers
                </Typography>
                <Typography variant="body2">
                  <strong>{user.following?.length || 0}</strong> Following
                </Typography>
              </Box>
              
              {/* Show edit profile button for own profile */}
              {isCurrentUser && (
                <Button 
                  variant="outlined" 
                  color="primary" 
                  sx={{ mt: 3, width: '100%' }}
                  onClick={handleOpenEditDialog}
                >
                  Edit Profile
                </Button>
              )}
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper elevation={3} sx={{ p: 3 }}>
            <Tabs value={tabValue} onChange={handleTabChange} sx={{ mb: 3 }}>
              <Tab label="Reviews" />
              <Tab label="Watchlist" />
            </Tabs>

            {tabValue === 0 && (
              <Box>
                {reviews.length > 0 ? (
                  reviews.map((review) => (
                    <Paper key={review._id} sx={{ p: 2, mb: 2 }}>
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 1 }}>
                        <Box sx={{ mr: 2, flexShrink: 0 }}>
                          <img 
                            src={review.movie.poster || 'https://via.placeholder.com/60x90?text=No+Poster'} 
                            alt={review.movie.title}
                            style={{ width: 60, height: 90, objectFit: 'cover', borderRadius: 4 }}
                          />
                        </Box>
                        <Box sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" component={RouterLink} to={`/movie/${review.movie._id}`} sx={{ textDecoration: 'none' }}>
                            {review.movie.title} ({review.movie.releaseYear})
                          </Typography>
                          <Box sx={{ display: 'flex', alignItems: 'center', my: 1 }}>
                            <Rating value={review.rating} precision={0.5} readOnly size="small" />
                          </Box>
                          <Typography variant="body1">{review.text}</Typography>
                        </Box>
                      </Box>
                    </Paper>
                  ))
                ) : (
                  <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                    No reviews yet
                  </Typography>
                )}
              </Box>
            )}

            {tabValue === 1 && (
              <Grid container spacing={2}>
                {watchlist.length > 0 ? (
                  watchlist.map((movie) => (
                    <Grid item xs={6} sm={4} key={movie._id}>
                      <Card 
                        component={RouterLink} 
                        to={`/movie/${movie._id}`}
                        sx={{ 
                          height: '100%',
                          display: 'flex', 
                          flexDirection: 'column',
                          textDecoration: 'none',
                          transition: 'transform 0.2s',
                          '&:hover': { transform: 'scale(1.02)' }
                        }}
                      >
                        <CardMedia
                          component="img"
                          image={movie.poster || 'https://via.placeholder.com/300x450?text=No+Poster'}
                          alt={movie.title}
                          sx={{ height: 200 }}
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/300x450?text=No+Poster';
                          }}
                        />
                        <CardContent sx={{ flexGrow: 1 }}>
                          <Typography gutterBottom variant="subtitle2">
                            {movie.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {movie.releaseYear}
                          </Typography>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))
                ) : (
                  <Grid item xs={12}>
                    <Typography variant="body1" sx={{ textAlign: 'center', py: 4 }}>
                      No movies in watchlist
                    </Typography>
                  </Grid>
                )}
              </Grid>
            )}
          </Paper>
        </Grid>
      </Grid>
      
      {/* Edit Profile Dialog */}
      <Dialog
        open={openEditDialog}
        onClose={handleCloseEditDialog}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>Edit Your Profile</DialogTitle>
        <form onSubmit={handleProfileUpdate}>
          <DialogContent>
            {formError && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {formError}
              </Alert>
            )}
            <DialogContentText sx={{ mb: 2 }}>
              Update your profile information below.
            </DialogContentText>
            <TextField
              autoFocus
              margin="dense"
              name="username"
              label="Username"
              type="text"
              fullWidth
              variant="outlined"
              value={profileForm.username}
              onChange={handleProfileChange}
              disabled={isSubmitting}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="email"
              label="Email Address"
              type="email"
              fullWidth
              variant="outlined"
              value={profileForm.email}
              onChange={handleProfileChange}
              disabled={isSubmitting}
              required
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="bio"
              label="Bio"
              type="text"
              fullWidth
              variant="outlined"
              value={profileForm.bio}
              onChange={handleProfileChange}
              disabled={isSubmitting}
              multiline
              rows={4}
              sx={{ mb: 2 }}
            />
            <TextField
              margin="dense"
              name="profilePicture"
              label="Profile Picture URL"
              type="text"
              fullWidth
              variant="outlined"
              value={profileForm.profilePicture}
              onChange={handleProfileChange}
              disabled={isSubmitting}
              helperText="Enter a URL to an image (leave empty for a generated avatar)"
            />
          </DialogContent>
          <DialogActions sx={{ px: 3, pb: 2 }}>
            <Button onClick={handleCloseEditDialog} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
              disabled={isSubmitting}
            >
              {isSubmitting ? 'Saving...' : 'Save Changes'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </Container>
  );
};

export default Profile;