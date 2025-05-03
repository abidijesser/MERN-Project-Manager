import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { isAuthenticated } from 'utils/authUtils';
import apiNoRedirect from 'utils/apiNoRedirect';
import Loader from './Loader';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Admin Dashboard - ProtectedRoute - Checking authentication...');
        // First check if user is authenticated
        const authenticated = isAuthenticated();
        console.log('Admin Dashboard - ProtectedRoute - Is authenticated:', authenticated);
        console.log('Admin Dashboard - ProtectedRoute - Token:', localStorage.getItem('token'));

        if (!authenticated) {
          console.log('Admin Dashboard - ProtectedRoute - Not authenticated, will redirect to login');
          setLoading(false);
          return;
        }

        // Then check if user has admin role using our own implementation
        console.log('Admin Dashboard - ProtectedRoute - Checking admin role...');
        try {
          // Get user role from localStorage first
          const storedRole = localStorage.getItem('userRole');
          console.log('Admin Dashboard - ProtectedRoute - Role from localStorage:', storedRole);

          let hasAdminRole = false;

          if (storedRole) {
            // If role is stored in localStorage, use it
            hasAdminRole = storedRole === 'Admin';
            console.log('Admin Dashboard - ProtectedRoute - Has admin role (from localStorage):', hasAdminRole);
          } else {
            // If no role in localStorage, check with the server
            console.log('Admin Dashboard - ProtectedRoute - No role in localStorage, checking with server');
            try {
              const response = await apiNoRedirect.get('/auth/profile');
              console.log('Admin Dashboard - ProtectedRoute - Profile response:', response.data);

              if (response.data && response.data.user && response.data.user.role) {
                hasAdminRole = response.data.user.role === 'Admin';
                // Store the role for future checks
                localStorage.setItem('userRole', response.data.user.role);
                console.log('Admin Dashboard - ProtectedRoute - Has admin role (from API):', hasAdminRole);
              }
            } catch (apiError) {
              console.error('Admin Dashboard - ProtectedRoute - Error fetching profile:', apiError);
              hasAdminRole = false;
            }
          }

          setAuthorized(hasAdminRole);
        } catch (roleError) {
          console.error('Admin Dashboard - ProtectedRoute - Error checking admin role:', roleError);
          // If there's an error checking the role, assume not authorized
          setAuthorized(false);
        }

        setLoading(false);
      } catch (error) {
        console.error('Admin Dashboard - ProtectedRoute - Error checking authentication:', error);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated()) {
    // Redirect to client login page if not authenticated
    console.log('Admin Dashboard - ProtectedRoute - Not authenticated, redirecting to client login page');
    // Use setTimeout to ensure logs are visible before redirect
    setTimeout(() => {
      window.location.href = 'http://localhost:3000/#/login';
    }, 500);
    return <div>Redirecting to login...</div>;
  }

  if (!authorized) {
    // Redirect to unauthorized page if not admin
    console.log('Admin Dashboard - ProtectedRoute - Not authorized as admin, redirecting to unauthorized page');
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default ProtectedRoute;
