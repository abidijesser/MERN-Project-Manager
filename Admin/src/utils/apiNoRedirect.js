import axios from 'axios';

// Create an axios instance with default config that doesn't redirect on 401
const apiNoRedirect = axios.create({
  baseURL: 'http://192.168.33.10:3001/api',
  withCredentials: true,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add a request interceptor to add the auth token to every request
apiNoRedirect.interceptors.request.use(
  (config) => {
    console.log('Admin API (No Redirect) - Request URL:', config.url);
    const token = localStorage.getItem('token');
    console.log('Admin API (No Redirect) - Token exists:', !!token);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
      console.log('Admin API (No Redirect) - Added Authorization header');
    } else {
      console.log('Admin API (No Redirect) - No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('Admin API (No Redirect) - Request error:', error);
    return Promise.reject(error);
  }
);

// Add a response interceptor to handle common errors but without redirecting
apiNoRedirect.interceptors.response.use(
  (response) => {
    console.log('Admin API (No Redirect) - Response success:', response.config.url);
    return response;
  },
  (error) => {
    console.log('Admin API (No Redirect) - Response error:', error.config?.url);
    console.error('Admin API (No Redirect) - Error details:', error.response?.status, error.response?.data);
    
    // Log the error but don't redirect
    if (error.response && error.response.status === 401) {
      console.log('Admin API (No Redirect) - 401 Unauthorized error, but not redirecting');
    }
    
    return Promise.reject(error);
  }
);

export default apiNoRedirect;
