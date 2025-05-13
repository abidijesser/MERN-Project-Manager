import { useEffect, useState } from 'react';
import { isAuthenticated } from 'utils/authUtils';
import apiNoRedirect from 'utils/apiNoRedirect';
import Loader from './Loader';

// This component verifies authentication and admin role
// It's used in the dashboard layout to ensure the user is authenticated and has admin role
const AuthVerifier = ({ children }) => {
  const [loading, setLoading] = useState(true);
  const [verified, setVerified] = useState(false);

  useEffect(() => {
    const verifyAuth = async () => {
      try {
        console.log('AuthVerifier - Verifying authentication and admin role...');

        // Check if there are token and role in URL parameters (from auth transfer)
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        const urlRole = urlParams.get('role');

        if (urlToken && urlRole) {
          console.log('AuthVerifier - Found token and role in URL parameters');
          // Store token and role in localStorage
          localStorage.setItem('token', urlToken);
          localStorage.setItem('userRole', urlRole);
          console.log('AuthVerifier - Stored token and role from URL parameters');

          // Remove parameters from URL
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }

        // Check if user is authenticated
        const authenticated = isAuthenticated();
        console.log('AuthVerifier - Is authenticated:', authenticated);

        if (!authenticated) {
          console.log('AuthVerifier - Not authenticated, will redirect to login');
          // Redirect to client login page
          setTimeout(() => {
            window.location.href = 'http://192.168.33.10:3000/#/login';
          }, 500);
          return;
        }

        // Check if user has admin role using our own implementation
        console.log('AuthVerifier - Checking admin role...');

        try {
          // Get user role from localStorage first
          const storedRole = localStorage.getItem('userRole');
          console.log('AuthVerifier - Role from localStorage:', storedRole);

          let hasAdminRole = false;

          if (storedRole) {
            // If role is stored in localStorage, use it
            hasAdminRole = storedRole === 'Admin';
            console.log('AuthVerifier - Has admin role (from localStorage):', hasAdminRole);
          } else {
            // If no role in localStorage, check with the server
            console.log('AuthVerifier - No role in localStorage, checking with server');
            try {
              const response = await apiNoRedirect.get('/auth/profile');
              console.log('AuthVerifier - Profile response:', response.data);

              if (response.data && response.data.user && response.data.user.role) {
                hasAdminRole = response.data.user.role === 'Admin';
                // Store the role for future checks
                localStorage.setItem('userRole', response.data.user.role);
                console.log('AuthVerifier - Has admin role (from API):', hasAdminRole);
              }
            } catch (apiError) {
              console.error('AuthVerifier - Error fetching profile:', apiError);
              hasAdminRole = false;
            }
          }

          if (!hasAdminRole) {
            console.log('AuthVerifier - Not admin, will redirect to unauthorized');
            // Redirect to unauthorized page
            setTimeout(() => {
              window.location.href = '/unauthorized';
            }, 500);
            return;
          }
        } catch (roleError) {
          console.error('AuthVerifier - Error checking admin role:', roleError);
          // Redirect to login on error
          setTimeout(() => {
            window.location.href = 'http://192.168.33.10:3000/#/login';
          }, 500);
          return;
        }

        // User is authenticated and has admin role
        console.log('AuthVerifier - User is authenticated and has admin role');
        setVerified(true);
      } catch (error) {
        console.error('AuthVerifier - Error verifying authentication:', error);
        // Redirect to login on error
        setTimeout(() => {
          window.location.href = 'http://192.168.33.10:3000/#/login';
        }, 500);
      } finally {
        setLoading(false);
      }
    };

    verifyAuth();

    // Set up an interval to periodically verify authentication
    const interval = setInterval(async () => {
      try {
        console.log('AuthVerifier - Periodic verification...');
        const authenticated = isAuthenticated();
        console.log('AuthVerifier - Periodic check - Is authenticated:', authenticated);

        if (!authenticated) {
          console.log('AuthVerifier - Periodic check - Not authenticated, will redirect');
          window.location.href = 'http://192.168.33.10:3000/#/login';
          return;
        }

        // Check admin role
        const storedRole = localStorage.getItem('userRole');
        console.log('AuthVerifier - Periodic check - Role from localStorage:', storedRole);

        if (storedRole !== 'Admin') {
          console.log('AuthVerifier - Periodic check - Not admin, will redirect');
          window.location.href = '/unauthorized';
          return;
        }

        // Verify with server silently (don't redirect on failure)
        try {
          const response = await apiNoRedirect.get('/auth/profile');
          if (response.data && response.data.user && response.data.user.role !== 'Admin') {
            console.log('AuthVerifier - Periodic check - Server says not admin, updating localStorage');
            localStorage.setItem('userRole', response.data.user.role);
            window.location.href = '/unauthorized';
          }
        } catch (apiError) {
          console.log('AuthVerifier - Periodic check - API error, but not redirecting:', apiError.message);
          // Don't redirect on API error, just log it
        }
      } catch (error) {
        console.error('AuthVerifier - Error in periodic verification:', error);
      }
    }, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (!verified) {
    return <div>Verifying authentication...</div>;
  }

  return children;
};

export default AuthVerifier;
