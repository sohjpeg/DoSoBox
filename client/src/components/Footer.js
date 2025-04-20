import React from 'react';
import {
  Box,
  Container,
  Typography,
  Link,
  Grid,
  IconButton,
  Divider,
  useTheme,
  Fade,
} from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import MovieIcon from '@mui/icons-material/Movie';
import FacebookIcon from '@mui/icons-material/Facebook';
import TwitterIcon from '@mui/icons-material/Twitter';
import InstagramIcon from '@mui/icons-material/Instagram';
import GitHubIcon from '@mui/icons-material/GitHub';

const Footer = () => {
  const theme = useTheme();
  const currentYear = new Date().getFullYear();

  return (
    <Fade in={true} timeout={1000}>
      <Box
        component="footer"
        sx={{
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`,
          mt: 8,
          py: 6,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="space-between">
            {/* Brand and tagline */}
            <Grid item xs={12} md={4}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <MovieIcon fontSize="large" sx={{ mr: 1, color: theme.palette.primary.main }} />
                <Typography
                  variant="h5"
                  component={RouterLink}
                  to="/"
                  sx={{
                    textDecoration: 'none',
                    color: 'text.primary',
                    fontWeight: 700,
                    letterSpacing: 1,
                  }}
                >
                  DosoBox
                </Typography>
              </Box>
              <Typography variant="body2" color="text.secondary" paragraph>
                Your ultimate destination for discovering movies, tracking your favorites, and connecting with other film enthusiasts.
              </Typography>
              <Box sx={{ mt: 3 }}>
                <IconButton
                  aria-label="Facebook"
                  sx={{
                    color: '#4267B2',
                    '&:hover': { backgroundColor: 'rgba(66, 103, 178, 0.1)' },
                    mr: 1,
                  }}
                >
                  <FacebookIcon />
                </IconButton>
                <IconButton
                  aria-label="Twitter"
                  sx={{
                    color: '#1DA1F2',
                    '&:hover': { backgroundColor: 'rgba(29, 161, 242, 0.1)' },
                    mr: 1,
                  }}
                >
                  <TwitterIcon />
                </IconButton>
                <IconButton
                  aria-label="Instagram"
                  sx={{
                    color: '#E1306C',
                    '&:hover': { backgroundColor: 'rgba(225, 48, 108, 0.1)' },
                    mr: 1,
                  }}
                >
                  <InstagramIcon />
                </IconButton>
                <IconButton
                  aria-label="GitHub"
                  sx={{
                    color: theme.palette.text.secondary,
                    '&:hover': { backgroundColor: 'rgba(255, 255, 255, 0.1)' },
                  }}
                >
                  <GitHubIcon />
                </IconButton>
              </Box>
            </Grid>

            {/* Quick links */}
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" color="text.primary" gutterBottom fontWeight={600}>
                Navigation
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Link
                  component={RouterLink}
                  to="/"
                  variant="body2"
                  sx={{ 
                    mb: 1.5, 
                    color: 'text.secondary',
                    textDecoration: 'none',
                    '&:hover': {
                      color: theme.palette.primary.main,
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Home
                </Link>
                <Link
                  component={RouterLink}
                  to="/login"
                  variant="body2"
                  sx={{ 
                    mb: 1.5, 
                    color: 'text.secondary',
                    textDecoration: 'none',
                    '&:hover': {
                      color: theme.palette.primary.main,
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Login
                </Link>
                <Link
                  component={RouterLink}
                  to="/register"
                  variant="body2"
                  sx={{ 
                    mb: 1.5, 
                    color: 'text.secondary',
                    textDecoration: 'none',
                    '&:hover': {
                      color: theme.palette.primary.main,
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Register
                </Link>
              </Box>
            </Grid>

            {/* Resources */}
            <Grid item xs={6} md={2}>
              <Typography variant="subtitle1" color="text.primary" gutterBottom fontWeight={600}>
                Resources
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column' }}>
                <Link
                  href="#"
                  variant="body2"
                  sx={{ 
                    mb: 1.5, 
                    color: 'text.secondary',
                    textDecoration: 'none',
                    '&:hover': {
                      color: theme.palette.primary.main,
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Help Center
                </Link>
                <Link
                  href="#"
                  variant="body2"
                  sx={{ 
                    mb: 1.5, 
                    color: 'text.secondary',
                    textDecoration: 'none',
                    '&:hover': {
                      color: theme.palette.primary.main,
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Privacy Policy
                </Link>
                <Link
                  href="#"
                  variant="body2"
                  sx={{ 
                    mb: 1.5, 
                    color: 'text.secondary',
                    textDecoration: 'none',
                    '&:hover': {
                      color: theme.palette.primary.main,
                      textDecoration: 'underline'
                    }
                  }}
                >
                  Terms of Service
                </Link>
              </Box>
            </Grid>

            {/* Contact */}
            <Grid item xs={12} md={3}>
              <Typography variant="subtitle1" color="text.primary" gutterBottom fontWeight={600}>
                Contact Us
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Have questions or suggestions? We'd love to hear from you!
              </Typography>
              <Link
                href="mailto:info@dosobox.com"
                variant="body2"
                sx={{ 
                  color: theme.palette.primary.main,
                  display: 'block',
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                info@dosobox.com
              </Link>
            </Grid>
          </Grid>

          <Divider sx={{ my: 4, opacity: 0.2 }} />

          {/* Copyright */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
            <Typography variant="body2" color="text.secondary">
              © {currentYear} DosoBox. All rights reserved.
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Powered by{' '}
              <Link
                href="https://www.themoviedb.org/"
                target="_blank"
                rel="noopener"
                sx={{ 
                  color: theme.palette.primary.main,
                  textDecoration: 'none',
                  '&:hover': {
                    textDecoration: 'underline'
                  }
                }}
              >
                TMDb
              </Link>
            </Typography>
          </Box>
        </Container>
      </Box>
    </Fade>
  );
};

export default Footer; 