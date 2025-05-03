import React, { useEffect } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { useNavigate, useLocation } from 'react-router-dom';

const NotFoundPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Log the current path that wasn't found
    console.error('404 Not Found:', location.pathname, location.search);

    // Check if this is a Google Calendar callback
    const fullPath = location.pathname + location.search;
    if (fullPath.includes('state=') || fullPath.includes('code=')) {
      console.log('Detected Google Calendar callback URL');

      // Redirect to the calendar sync page with success parameter
      console.log('Redirecting to calendar sync page');
      navigate('/calendar-sync?success=true');
    }
  }, [location, navigate]);

  return (
    <Container>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          minHeight: '80vh',
          textAlign: 'center'
        }}
      >
        <Typography variant="h1" color="primary" gutterBottom>
          404
        </Typography>
        <Typography variant="h4" gutterBottom>
          Page Not Found
        </Typography>
        <Typography variant="body1" color="textSecondary" paragraph>
          The page you are looking for doesn't exist or has been moved.
        </Typography>
        <Button variant="contained" color="primary" onClick={() => navigate('/dashboard/default')} sx={{ mt: 2 }}>
          Go to Dashboard
        </Button>
      </Box>
    </Container>
  );
};

export default NotFoundPage;
