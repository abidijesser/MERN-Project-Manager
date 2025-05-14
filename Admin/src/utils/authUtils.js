import axios from 'axios';

// Create axios instance with base URL
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://192.168.33.10:3001',
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
  const token = localStorage.getItem('token');
  console.log('Admin Dashboard - isAuthenticated - Token exists:', !!token);
  console.log('Admin Dashboard - isAuthenticated - Token value:', token);
  return token !== null;
};

// Function to get the current user's information
export const getCurrentUser = async () => {
  try {
    console.log('Admin Dashboard - Getting current user...');
    const token = localStorage.getItem('token');
    console.log('Admin Dashboard - Token exists:', !!token);
    console.log('Admin Dashboard - Token value:', token);

    if (!token) {
      console.log('Admin Dashboard - No token found, returning null');
      return null;
    }

    console.log('Admin Dashboard - Fetching user profile...');
    try {
      const response = await api.get('/auth/profile');
      console.log('Admin Dashboard - Profile response status:', response.status);
      console.log('Admin Dashboard - Profile response data:', response.data);

      if (response.data && response.data.user) {
        console.log('Admin Dashboard - User found:', response.data.user);
        return response.data.user;
      } else {
        console.log('Admin Dashboard - No user data in response');
        return null;
      }
    } catch (apiError) {
      console.error('Admin Dashboard - API error fetching profile:', apiError.message);
      console.error('Admin Dashboard - API error details:', apiError.response?.status, apiError.response?.data);
      return null;
    }
  } catch (error) {
    console.error('Admin Dashboard - Error fetching current user:', error);
    return null;
  }
};

// Function to check if user has admin role
export const isAdmin = async () => {
  try {
    console.log('Admin Dashboard - Checking if user has admin role...');
    console.log('Admin Dashboard - Token:', localStorage.getItem('token'));

    // D'abord, vérifier le rôle dans localStorage pour une réponse rapide
    const storedRole = localStorage.getItem('userRole');
    console.log('Admin Dashboard - Role from localStorage:', storedRole);

    if (storedRole) {
      const isAdminRole = storedRole === 'Admin';
      console.log('Admin Dashboard - Is admin based on localStorage:', isAdminRole);
      return isAdminRole;
    }

    // Si pas de rôle dans localStorage, faire un appel API
    console.log('Admin Dashboard - No role in localStorage, checking with server');
    const user = await getCurrentUser();
    console.log('Admin Dashboard - Current user from API:', user);

    const isAdminUser = user && user.role === 'Admin';
    console.log('Admin Dashboard - Is admin user based on API response:', isAdminUser);

    // Stocker le rôle pour les prochaines vérifications
    if (user && user.role) {
      console.log('Admin Dashboard - Storing role in localStorage:', user.role);
      localStorage.setItem('userRole', user.role);
    } else {
      console.log('Admin Dashboard - No user or role from API');
    }

    return isAdminUser;
  } catch (error) {
    console.error('Admin Dashboard - Error checking admin role:', error);
    return false;
  }
};

// Function to handle login
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    if (response.data.success) {
      localStorage.setItem('token', response.data.token);
      // Store user role in localStorage
      if (response.data.user && response.data.user.role) {
        localStorage.setItem('userRole', response.data.user.role);
      }

      // Store user name in localStorage
      if (response.data.user && response.data.user.name) {
        localStorage.setItem('userName', response.data.user.name);
      }

      // Store user data in localStorage
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

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

      // Store user role in localStorage
      if (response.data.user && response.data.user.role) {
        localStorage.setItem('userRole', response.data.user.role);
      }

      // Store user name in localStorage
      if (response.data.user && response.data.user.name) {
        localStorage.setItem('userName', response.data.user.name);
      }

      // Store user data in localStorage
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

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

      // Store user role in localStorage
      if (response.data.user && response.data.user.role) {
        localStorage.setItem('userRole', response.data.user.role);
      }

      // Store user name in localStorage
      if (response.data.user && response.data.user.name) {
        localStorage.setItem('userName', response.data.user.name);
      }

      // Store user data in localStorage
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

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

    // Remove all user data from localStorage
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('user');

    return {
      success: true,
      message: response.data?.message || 'Déconnexion réussie'
    };
  } catch (error) {
    console.error('Logout error:', error);

    // Still remove all user data from localStorage even if the server request fails
    localStorage.removeItem('token');
    localStorage.removeItem('userRole');
    localStorage.removeItem('userName');
    localStorage.removeItem('user');

    return {
      success: true, // Still return success since we've removed the token
      message: 'Déconnexion réussie'
    };
  }
};

// Export the api instance for use in other files
export default api;
