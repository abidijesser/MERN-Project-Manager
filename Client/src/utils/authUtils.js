import axios from './axios';

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

    const response = await axios.get('/auth/profile');
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

// Function to check if user has client role
export const isClient = async () => {
  try {
    const user = await getCurrentUser();
    return user && user.role === 'Client';
  } catch (error) {
    console.error('Error checking client role:', error);
    return false;
  }
};

// Function to handle login
export const login = async (email, password) => {
  try {
    const response = await axios.post('/auth/login', { email, password });
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      return { success: true, user: response.data.user };
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
    const response = await axios.post(
      '/auth/login',
      { email, password },
      { headers: { 'x-2fa-token': twoFactorToken } }
    );
    
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      return { success: true, user: response.data.user };
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
    const response = await axios.post('/auth/register', userData);
    if (response.data.success) {
      return { success: true, token: response.data.token };
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
export const logout = () => {
  localStorage.removeItem('token');
  // Optionally call the logout endpoint if needed
  // axios.get('/auth/logout');
};
