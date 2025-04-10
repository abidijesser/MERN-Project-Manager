import axios from 'axios'

// Créer une instance axios avec une configuration de base
const instance = axios.create({
<<<<<<< HEAD
  baseURL: 'http://localhost:3001/api',
  headers: {
    'Content-Type': 'application/json',
  },
})
=======
  baseURL: 'http://localhost:3001',
});
>>>>>>> doua

// Intercepteur pour ajouter le token à chaque requête
instance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token')
    if (token) {
      config.headers.Authorization = `Bearer ${token}`
    }
    return config
  },
  (error) => {
    return Promise.reject(error)
  },
)

// Intercepteur pour gérer les erreurs d'authentification
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
