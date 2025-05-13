import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// ==============================|| LOGIN REDIRECT ||============================== //

const LoginRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    // Check if there are token and role in URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlToken = urlParams.get('token');
    const urlRole = urlParams.get('role');

    if (urlToken && urlRole) {
      console.log('LoginRedirect - Found token and role in URL parameters');
      // Store token and role in localStorage
      localStorage.setItem('token', urlToken);
      localStorage.setItem('userRole', urlRole);
      console.log('LoginRedirect - Stored token and role from URL parameters');

      // Remove parameters from URL
      const newUrl = window.location.pathname;
      window.history.replaceState({}, document.title, newUrl);
    }

    // Check if token exists in localStorage
    const token = localStorage.getItem('token');
    const userRole = localStorage.getItem('userRole');

    console.log('LoginRedirect - Token exists:', !!token);
    console.log('LoginRedirect - User role:', userRole);

    if (token) {
      // If token exists, redirect to dashboard
      console.log('LoginRedirect - Token found, redirecting to dashboard');

      // Add a delay to ensure logs are visible
      setTimeout(() => {
        console.log('LoginRedirect - Executing redirect to dashboard now');
        navigate('/dashboard/default');
      }, 500);
    } else {
      // If no token, redirect to client login page
      console.log('LoginRedirect - No token found, redirecting to client login page');

      // Add a delay to ensure logs are visible
      setTimeout(() => {
        console.log('LoginRedirect - Executing redirect to client login page now');
        window.location.href = 'http://192.168.33.10:3000/#/login';
      }, 500);
    }
  }, [navigate]);

  return <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>Redirecting...</div>;
};

export default LoginRedirect;
