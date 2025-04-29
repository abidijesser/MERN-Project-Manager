import axios from 'axios';

// Create an axios instance with default config for admin routes
const adminApi = axios.create({
  baseURL: 'http://localhost:3001/admin',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add the auth token to every request
adminApi.interceptors.request.use(
  (config) => {
    console.log('Admin API - Request URL:', config.url);
    const token = localStorage.getItem('token');
    console.log('Admin API - Token exists:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Admin API - Added Authorization header');
    } else {
      console.log('Admin API - No token found in localStorage');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
adminApi.interceptors.response.use(
  (response) => {
    console.log('Admin API - Response success:', response.config.url);
    return response;
  },
  (error) => {
    console.log('Admin API - Response error:', error.config?.url);
    console.error('Admin API - Error details:', error.response?.status, error.response?.data);

    // Handle 401 Unauthorized errors (token expired or invalid)
    if (error.response && error.response.status === 401) {
      console.log('Admin API - 401 Unauthorized error, redirecting to login');
      // Clear token and redirect to login
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      // Redirect to client login page instead of admin login
      window.location.href = 'http://localhost:3000/#/login';
    }
    return Promise.reject(error);
  }
);

export default adminApi;
