import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true // Include credentials in requests
});

// Add request interceptor to include token in headers
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Function to check if user is authenticated
export const isAuthenticated = () => {
  return localStorage.getItem('token') !== null;
};

// Function to get the current user's information
export const getCurrentUser = async () => {
  try {
    const token = localStorage.getItem('token');
    if (!token) {
      return null;
    }

    const response = await api.get('/auth/profile');
    return response.data.user;
  } catch (error) {
    console.error('Error fetching current user:', error);
    return null;
  }
};

// Function to check if user has admin role
export const isAdmin = async () => {
  try {
    const user = await getCurrentUser();
    return user && user.role === 'Admin';
  } catch (error) {
    console.error('Error checking admin role:', error);
    return false;
  }
};

// Function to handle login
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      return { success: true, user: response.data.user, token: response.data.token };
    } else if (response.data.message === '2FA required') {
      return { success: false, requires2FA: true };
    } else {
      return { success: false, error: response.data.error || 'Login failed' };
    }
  } catch (error) {
    console.error('Login error:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'An error occurred during login'
    };
  }
};

// Function to handle 2FA verification
export const verify2FA = async (email, password, twoFactorToken) => {
  try {
    const response = await api.post('/auth/login', { email, password }, { headers: { 'x-2fa-token': twoFactorToken } });

    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      return { success: true, user: response.data.user, token: response.data.token };
    } else {
      return { success: false, error: response.data.error || 'Verification failed' };
    }
  } catch (error) {
    console.error('2FA verification error:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'An error occurred during verification'
    };
  }
};

// Function to handle registration
export const register = async (userData) => {
  try {
    const response = await api.post('/auth/register', userData);
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      return { success: true, user: response.data.user };
    } else {
      return { success: false, error: response.data.error || 'Registration failed' };
    }
  } catch (error) {
    console.error('Registration error:', error);
    return {
      success: false,
      error: error.response?.data?.error || 'An error occurred during registration'
    };
  }
};

// Function to handle logout
export const logout = async () => {
  try {
    // Call the logout endpoint
    const response = await api.get('/auth/logout');

    // Remove token from localStorage
    localStorage.removeItem('token');

    return {
      success: true,
      message: response.data?.message || 'Déconnexion réussie'
    };
  } catch (error) {
    console.error('Logout error:', error);

    // Still remove token from localStorage even if the server request fails
    localStorage.removeItem('token');

    return {
      success: true, // Still return success since we've removed the token
      message: 'Déconnexion réussie'
    };
  }
};

// Export the api instance for use in other files
export default api;
