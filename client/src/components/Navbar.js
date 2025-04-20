import React, { useContext, useState, useEffect } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Avatar,
  Menu,
  MenuItem,
  Tooltip,
  Container,
  useScrollTrigger,
  Slide,
  Fade,
  useTheme,
  alpha
} from '@mui/material';
import MovieIcon from '@mui/icons-material/Movie';
import AccountCircleIcon from '@mui/icons-material/AccountCircle';
import { AuthContext } from '../context/AuthContext';

// Hide AppBar on scroll down
function HideOnScroll(props) {
  const { children, window } = props;
  const trigger = useScrollTrigger({
    target: window ? window() : undefined,
  });
  
  return (
    <Slide appear={false} direction="down" in={!trigger}>
      {children}
    </Slide>
  );
}

const Navbar = (props) => {
  const { currentUser, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const theme = useTheme();
  const [anchorEl, setAnchorEl] = useState(null);
  const [scrolled, setScrolled] = useState(false);
  
  // Track scroll position for navbar styling
  useEffect(() => {
    const handleScroll = () => {
      const isScrolled = window.scrollY > 20;
      if (isScrolled !== scrolled) {
        setScrolled(isScrolled);
      }
    };
    
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, [scrolled]);
  
  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    logout();
    handleClose();
    navigate('/');
  };
  
  const isActive = (path) => location.pathname === path;

  return (
    <HideOnScroll {...props}>
      <AppBar 
        position="sticky"
        elevation={scrolled ? 4 : 0}
        sx={{ 
          transition: 'all 0.3s ease',
          backdropFilter: 'blur(10px)',
          backgroundColor: scrolled 
            ? alpha(theme.palette.background.default, 0.9) 
            : theme.palette.primary.main,
        }}
      >
        <Container maxWidth="xl">
          <Toolbar disableGutters sx={{ justifyContent: 'space-between' }}>
            {/* Logo and Brand */}
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Fade in={true} timeout={800}>
                <IconButton
                  component={RouterLink}
                  to="/"
                  edge="start"
                  color="inherit"
                  aria-label="home"
                  sx={{ 
                    mr: 1, 
                    transform: scrolled ? 'scale(0.9)' : 'scale(1)',
                    transition: 'transform 0.3s ease',
                  }}
                >
                  <MovieIcon fontSize="large" />
                </IconButton>
              </Fade>
              <Typography
                variant="h5"
                component={RouterLink}
                to="/"
                sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  fontWeight: 700,
                  letterSpacing: 1,
                  fontSize: scrolled ? '1.3rem' : '1.5rem',
                  transition: 'all 0.3s ease'
                }}
              >
                DosoBox
              </Typography>
            </Box>

            {/* Navigation Links */}
            <Box 
              sx={{ 
                display: { xs: 'none', md: 'flex' }, 
                gap: 1,
                alignItems: 'center'
              }}
            >
              <Button
                component={RouterLink}
                to="/"
                color="inherit"
                sx={{ 
                  transition: 'all 0.2s ease',
                  borderRadius: 2,
                  px: 2,
                  ...(isActive('/') && {
                    backgroundColor: alpha(theme.palette.common.white, 0.15)
                  })
                }}
              >
                Home
              </Button>
              
              <Box sx={{ ml: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
                {currentUser ? (
                  <>
                    <Tooltip title="Account">
                      <IconButton
                        onClick={handleMenu}
                        color="inherit"
                        sx={{ 
                          border: '2px solid',
                          borderColor: alpha(theme.palette.common.white, 0.3),
                          transition: 'all 0.3s ease',
                          '&:hover': {
                            borderColor: theme.palette.common.white
                          }
                        }}
                      >
                        {currentUser.profilePicture ? (
                          <Avatar 
                            src={currentUser.profilePicture}
                            alt={currentUser.username}
                            sx={{ width: 32, height: 32 }}
                          />
                        ) : (
                          <AccountCircleIcon />
                        )}
                      </IconButton>
                    </Tooltip>
                    <Menu
                      id="menu-appbar"
                      anchorEl={anchorEl}
                      anchorOrigin={{
                        vertical: 'bottom',
                        horizontal: 'right',
                      }}
                      keepMounted
                      transformOrigin={{
                        vertical: 'top',
                        horizontal: 'right',
                      }}
                      open={Boolean(anchorEl)}
                      onClose={handleClose}
                      PaperProps={{
                        elevation: 3,
                        sx: { 
                          mt: 1.5, 
                          borderRadius: 2,
                          minWidth: 180
                        }
                      }}
                    >
                      <MenuItem 
                        component={RouterLink} 
                        to="/profile/me" 
                        onClick={handleClose}
                        dense
                      >
                        My Profile
                      </MenuItem>
                      <MenuItem 
                        onClick={handleLogout}
                        dense
                      >
                        Logout
                      </MenuItem>
                    </Menu>
                  </>
                ) : (
                  <>
                    <Button
                      component={RouterLink}
                      to="/login"
                      color="inherit"
                      sx={{ 
                        borderRadius: 2,
                        transition: 'all 0.2s ease',
                        px: 2
                      }}
                    >
                      Login
                    </Button>
                    <Button
                      component={RouterLink}
                      to="/register"
                      variant="outlined"
                      color="inherit"
                      sx={{ 
                        borderRadius: 2,
                        fontWeight: 'bold',
                        transition: 'all 0.2s ease',
                        boxShadow: '0 0 10px rgba(255,255,255,0.1)',
                        '&:hover': {
                          boxShadow: '0 0 12px rgba(255,255,255,0.2)',
                          backgroundColor: alpha(theme.palette.common.white, 0.15)
                        }
                      }}
                    >
                      Register
                    </Button>
                  </>
                )}
              </Box>
            </Box>
          </Toolbar>
        </Container>
      </AppBar>
    </HideOnScroll>
  );
};

export default Navbar;



