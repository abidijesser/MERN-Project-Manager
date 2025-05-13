import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Box, Typography, CircularProgress } from '@mui/material';

// ==============================|| AUTH TRANSFER ||============================== //

const AuthTransfer = () => {
  const navigate = useNavigate();
  const [error, setError] = useState('');

  useEffect(() => {
    const processAuthData = () => {
      try {
        // Get form data from POST request
        const urlParams = new URLSearchParams(window.location.search);
        const token = urlParams.get('token');
        const role = urlParams.get('role');
        
        console.log('AuthTransfer - Token exists:', !!token);
        console.log('AuthTransfer - Role:', role);
        
        if (token && role === 'Admin') {
          // Store token and role in localStorage
          localStorage.setItem('token', token);
          localStorage.setItem('userRole', role);
          console.log('AuthTransfer - Auth data stored in localStorage');
          
          // Redirect to dashboard
          console.log('AuthTransfer - Redirecting to dashboard');
          navigate('/dashboard/default');
        } else {
          console.error('AuthTransfer - Invalid auth data');
          setError('Invalid authentication data');
          
          // Redirect to login page after a delay
          setTimeout(() => {
            window.location.href = 'http://192.168.33.10:3000/#/login';
          }, 3000);
        }
      } catch (error) {
        console.error('AuthTransfer - Error processing auth data:', error);
        setError('Error processing authentication data');
        
        // Redirect to login page after a delay
        setTimeout(() => {
          window.location.href = 'http://192.168.33.10:3000/#/login';
        }, 3000);
      }
    };
    
    processAuthData();
  }, [navigate]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      {error ? (
        <Typography variant="h5" color="error" gutterBottom>
          {error}
        </Typography>
      ) : (
        <>
          <Typography variant="h5" gutterBottom>
            Transferring authentication...
          </Typography>
          <CircularProgress sx={{ mt: 2 }} />
        </>
      )}
    </Box>
  );
};

export default AuthTransfer;
