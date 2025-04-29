import axios from 'axios'

// Create an axios instance with base configuration
const instance = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
  timeout: 10000, // 10 second timeout
  withCredentials: true, // Allow cookies to be sent
})

// Add a request interceptor
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('Axios interceptor - Request to:', config.url)
    console.log('Axios interceptor - Token exists:', !!token)

    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Axios interceptor - Added Authorization header')
    }

    // Add request ID for tracking
    config.headers['X-Request-ID'] = Date.now().toString()

    return config
  },
  (error) => {
    console.error('Axios request interceptor error:', error)
    return Promise.reject(error)
  },
)

// Add a response interceptor
instance.interceptors.response.use(
  (response) => {
    console.log(`Axios interceptor - Response from ${response.config.url}:`, {
      status: response.status,
      success: response.data?.success,
    })
    return response
  },
  (error) => {
    console.error('Axios response error:', error.message)

    if (error.response) {
      console.error('Error response data:', error.response.data)
      console.error('Error response status:', error.response.status)

      // Handle authentication errors
      if (error.response.status === 401) {
        console.log('Authentication error detected')

        // Don't redirect if we're already on the login page
        if (!window.location.pathname.includes('/login')) {
          // If the token is invalid or expired
          localStorage.removeItem('token')
          localStorage.removeItem('user')
          localStorage.removeItem('userRole')
          localStorage.removeItem('userName')

          // Store the current URL to redirect back after login
          localStorage.setItem('redirectAfterLogin', window.location.pathname)

          // Redirect to login page
          window.location.href = '/login'
        }
      }

      // Handle server errors
      if (error.response.status >= 500) {
        console.error('Server error detected')
      }
    } else if (error.request) {
      // The request was made but no response was received
      console.error('No response received:', error.request)
    }

    return Promise.reject(error)
  },
)

export default instance
