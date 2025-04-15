import React, { useEffect, useState } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';
import { isAuthenticated, isAdmin } from 'utils/authUtils';
import Loader from './Loader';

const ProtectedRoute = ({ children }) => {
  const location = useLocation();
  const [loading, setLoading] = useState(true);
  const [authorized, setAuthorized] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        console.log('Checking authentication...');
        // First check if user is authenticated
        const authenticated = isAuthenticated();
        console.log('Is authenticated:', authenticated);

        if (!authenticated) {
          console.log('Not authenticated, redirecting to login');
          setLoading(false);
          return;
        }

        // Then check if user has admin role
        console.log('Checking admin role...');
        const hasAdminRole = await isAdmin();
        console.log('Has admin role:', hasAdminRole);

        setAuthorized(hasAdminRole);
        setLoading(false);
      } catch (error) {
        console.error('Error checking authentication:', error);
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (!isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (!authorized) {
    // Redirect to unauthorized page if not admin
    return <Navigate to="/unauthorized" state={{ from: location }} replace />;
  }

  return children;
};

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired
};

export default ProtectedRoute;
