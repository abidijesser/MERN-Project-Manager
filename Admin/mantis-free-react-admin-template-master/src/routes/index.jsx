import { createBrowserRouter, Navigate } from 'react-router-dom';
import { useEffect, useState } from 'react';

// project imports
import MainRoutes from './MainRoutes';
import LoginRoutes from './LoginRoutes';
import apiNoRedirect from 'utils/apiNoRedirect';
import Loader from 'components/Loader';

// Redirect component for root path
const RootRedirect = () => {
  const [loading, setLoading] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // Check if there are token and role in URL parameters
        const urlParams = new URLSearchParams(window.location.search);
        const urlToken = urlParams.get('token');
        const urlRole = urlParams.get('role');

        if (urlToken && urlRole) {
          console.log('Root redirect - Found token and role in URL parameters');
          // Store token and role in localStorage
          localStorage.setItem('token', urlToken);
          localStorage.setItem('userRole', urlRole);
          console.log('Root redirect - Stored token and role from URL parameters');

          // Remove parameters from URL
          const newUrl = window.location.pathname;
          window.history.replaceState({}, document.title, newUrl);
        }

        // Check if token exists
        const token = localStorage.getItem('token');
        const userRole = localStorage.getItem('userRole');

        console.log('Root redirect - Token exists:', !!token);
        console.log('Root redirect - User role:', userRole);

        if (!token) {
          console.log('Root redirect - No token found, will redirect to client login');
          setTimeout(() => {
            window.location.href = 'http://localhost:3000/#/login';
          }, 500);
          return;
        }

        // Check if user has admin role
        if (userRole === 'Admin') {
          console.log('Root redirect - User is admin based on localStorage');
          setIsAdmin(true);
          setLoading(false);
          return;
        }

        // If no role in localStorage or not admin, check with the server
        try {
          console.log('Root redirect - Checking role with server');
          const response = await apiNoRedirect.get('/auth/profile');
          console.log('Root redirect - Profile response:', response.data);

          if (response.data && response.data.user && response.data.user.role === 'Admin') {
            console.log('Root redirect - User is admin based on API response');
            localStorage.setItem('userRole', 'Admin');
            setIsAdmin(true);
          } else {
            console.log('Root redirect - User is not admin based on API response');
            if (response.data && response.data.user && response.data.user.role) {
              localStorage.setItem('userRole', response.data.user.role);
            }
            setTimeout(() => {
              window.location.href = 'http://localhost:3000/#/login';
            }, 500);
          }
        } catch (apiError) {
          console.error('Root redirect - Error fetching profile:', apiError);
          setTimeout(() => {
            window.location.href = 'http://localhost:3000/#/login';
          }, 500);
        }
      } catch (error) {
        console.error('Root redirect - Error checking authentication:', error);
        setTimeout(() => {
          window.location.href = 'http://localhost:3000/#/login';
        }, 500);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (isAdmin) {
    console.log('Root redirect - Redirecting to dashboard');
    return <Navigate to="/dashboard/default" replace />;
  }

  return <div>Redirecting...</div>;
};

// ==============================|| ROUTING RENDER ||============================== //

const router = createBrowserRouter(
  [
    {
      path: '/',
      element: <RootRedirect />
    },
    MainRoutes,
    LoginRoutes
  ],
  { basename: import.meta.env.VITE_APP_BASE_NAME }
);

export default router;
