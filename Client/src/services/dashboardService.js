import axios from '../utils/axios'

/**
 * Récupère les projets avec leurs tâches pour l'affichage dans le tableau de bord
 * @param {number} limit - Nombre de projets à récupérer (optionnel)
 * @returns {Promise<Array>} Liste des projets avec leurs statistiques
 */
export const getProjectsForDashboard = async (limit = 3) => {
  try {
    // Récupérer tous les projets
    const response = await axios.get('/projects')
    console.log('API Response:', response.data)

    if (!response.data || !response.data.success) {
      throw new Error('Échec de la récupération des projets')
    }

    let projects = response.data.projects

    // Log each project and its tasks
    projects.forEach((project) => {
      console.log(
        `Project ${project.projectName} has ${project.tasks ? project.tasks.length : 0} tasks`,
      )
      if (project.tasks && project.tasks.length > 0) {
        console.log('First task:', project.tasks[0])
      }
    })

    // Mélanger les projets de façon aléatoire
    projects = shuffleArray(projects)

    // Limiter le nombre de projets si nécessaire
    if (limit > 0) {
      projects = projects.slice(0, limit)
    }

    // Fonction pour mélanger un tableau de façon aléatoire (algorithme de Fisher-Yates)
    function shuffleArray(array) {
      const newArray = [...array] // Créer une copie pour ne pas modifier l'original
      for (let i = newArray.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1))
        ;[newArray[i], newArray[j]] = [newArray[j], newArray[i]] // Échange d'éléments
      }
      return newArray
    }

    // Calculer les statistiques pour chaque projet
    const projectsWithStats = projects.map((project) => {
      console.log('Project:', project.projectName, 'Tasks:', project.tasks)

      // Ensure tasks is an array
      const tasks = Array.isArray(project.tasks) ? project.tasks : []

      // Compter les tâches terminées
      const completedTasks = tasks.filter((task) => task && task.status === 'Done').length

      // Calculer le pourcentage de progression
      const progress = tasks.length > 0 ? Math.round((completedTasks / tasks.length) * 100) : 0

      // Déterminer le statut du projet
      let status = 'En cours'
      let statusColor = 'primary'

      if (project.status === 'Completed') {
        status = 'Terminé'
        statusColor = 'success'
      } else if (progress >= 90) {
        status = 'Presque terminé'
        statusColor = 'success'
      } else if (new Date(project.endDate) < new Date()) {
        status = 'En retard'
        statusColor = 'danger'
      }

      // Formater la date d'échéance
      const dueDate = new Date(project.endDate).toLocaleDateString('fr-FR', {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
      })

      return {
        id: project._id,
        title: project.projectName,
        progress,
        status,
        statusColor,
        tasks: tasks.length,
        completedTasks,
        dueDate,
      }
    })

    return projectsWithStats
  } catch (error) {
    console.error('Erreur lors de la récupération des projets pour le tableau de bord:', error)
    throw error
  }
}
