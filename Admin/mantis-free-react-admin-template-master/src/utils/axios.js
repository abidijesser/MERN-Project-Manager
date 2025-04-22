import axios from 'axios';

// Create an instance of axios with default configuration
const axiosInstance = axios.create({
  baseURL: 'http://localhost:3001', // Your API base URL
  timeout: 30000, // Request timeout in milliseconds
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to include the auth token in all requests
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Axios interceptor - Added Authorization header');
    } else {
      console.log('Axios interceptor - No token found');
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common response issues
axiosInstance.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle unauthorized errors (401)
    if (error.response && error.response.status === 401) {
      // Clear local storage and redirect to login page
      localStorage.removeItem('token');
      localStorage.removeItem('userRole');
      window.location.href = '/login';
    }
    
    // Handle forbidden errors (403)
    if (error.response && error.response.status === 403) {
      // Redirect to unauthorized page
      window.location.href = '/unauthorized';
    }
    
    return Promise.reject(error);
  }
);

export default axiosInstance;
