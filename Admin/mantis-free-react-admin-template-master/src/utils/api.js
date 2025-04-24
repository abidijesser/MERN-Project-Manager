import axios from 'axios';

// Create an axios instance with default config
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add the auth token to every request
api.interceptors.request.use(
  (config) => {
    console.log('Admin API - Request URL:', config.url);
    console.log('Admin API - Request Method:', config.method);
    console.log('Admin API - Request Params:', config.params);
    console.log('Admin API - Request Data:', config.data);

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
    console.error('Admin API - Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors
api.interceptors.response.use(
  (response) => {
    console.log('Admin API - Response success:', response.config.url);
    console.log('Admin API - Response status:', response.status);
    console.log('Admin API - Response data:', response.data);
    return response;
  },
  (error) => {
    console.log('Admin API - Response error:', error.config?.url);
    console.error('Admin API - Error details:', error.response?.status, error.response?.data);
    console.error('Admin API - Error message:', error.message);

    if (error.request) {
      console.error('Admin API - Request was made but no response received');
    }

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

export default api;
