import axios from './axios';

export const handleLogout = async () => {
  try {
    // Appeler l'API de déconnexion
    await axios.post('/api/auth/logout');
  } catch (error) {
    console.error('Erreur lors de la déconnexion:', error);
  } finally {
    // Dans tous les cas, supprimer les données locales
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    
    // Rediriger vers la page de login appropriée
    const currentPath = window.location.pathname;
    if (currentPath.startsWith('/free')) {
      window.location.href = '/free/login';
    } else {
      window.location.href = '/login';
    }
  }
}; 