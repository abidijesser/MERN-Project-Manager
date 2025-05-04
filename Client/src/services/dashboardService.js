import axios from '../utils/axios';

/**
 * Récupère les projets avec leurs tâches pour l'affichage dans le tableau de bord
 * @param {number} limit - Nombre de projets à récupérer (optionnel)
 * @returns {Promise<Array>} Liste des projets avec leurs statistiques
 */
export const getProjectsForDashboard = async (limit = 3) => {
  try {
    // Récupérer tous les projets
    const response = await axios.get('/api/projects');
    
    if (!response.data || !response.data.success) {
      throw new Error('Échec de la récupération des projets');
    }
    
    let projects = response.data.projects;
    
    // Trier les projets par date de fin (les plus proches d'abord)
    projects.sort((a, b) => new Date(a.endDate) - new Date(b.endDate));
    
    // Limiter le nombre de projets si nécessaire
    if (limit > 0) {
      projects = projects.slice(0, limit);
    }
    
    // Calculer les statistiques pour chaque projet
    const projectsWithStats = projects.map(project => {
      // Compter les tâches terminées
      const completedTasks = project.tasks.filter(task => 
        task.status === 'Done'
      ).length;
      
      // Calculer le pourcentage de progression
      const progress = project.tasks.length > 0 
        ? Math.round((completedTasks / project.tasks.length) * 100) 
        : 0;
      
      // Déterminer le statut du projet
      let status = 'En cours';
      let statusColor = 'primary';
      
      if (project.status === 'Completed') {
        status = 'Terminé';
        statusColor = 'success';
      } else if (progress >= 90) {
        status = 'Presque terminé';
        statusColor = 'success';
      } else if (new Date(project.endDate) < new Date()) {
        status = 'En retard';
        statusColor = 'danger';
      }
      
      // Formater la date d'échéance
      const dueDate = new Date(project.endDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
      
      return {
        id: project._id,
        title: project.projectName,
        progress,
        status,
        statusColor,
        tasks: project.tasks.length,
        completedTasks,
        dueDate
      };
    });
    
    return projectsWithStats;
  } catch (error) {
    console.error('Erreur lors de la récupération des projets pour le tableau de bord:', error);
    throw error;
  }
};
