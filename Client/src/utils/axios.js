import axios from 'axios'

// Créer une instance axios avec une configuration de base
const instance = axios.create({
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
})

// Ajouter un intercepteur pour les requêtes
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    console.log('Axios interceptor - Token exists:', !!token)
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
      console.log('Axios interceptor - Added Authorization header')
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Ajouter un intercepteur pour les réponses
instance.interceptors.response.use(
  (response) => {
    return response
  },
  (error) => {
    if (error.response && error.response.status === 401) {
      // Si le token est invalide ou expiré
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      window.location.href = '/login'
    }
    return Promise.reject(error)
  },
)

export default instance
