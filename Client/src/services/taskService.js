import axios from '../utils/axios';

/**
 * Service pour gérer les tâches
 */

// Récupérer toutes les tâches de l'utilisateur
export const getUserTasks = async () => {
  try {
    const response = await axios.get('/tasks');

    if (response.data && response.data.success) {
      return response.data.tasks;
    } else {
      throw new Error('Failed to fetch tasks');
    }
  } catch (error) {
    console.error('Error fetching tasks:', error);
    throw error;
  }
};

// Récupérer les tâches assignées à l'utilisateur
export const getAssignedTasks = async () => {
  try {
    const tasks = await getUserTasks();
    const userId = getUserIdFromLocalStorage();

    if (!userId) return [];

    // Filtrer les tâches assignées à l'utilisateur et non terminées
    return tasks.filter(task =>
      task.assignedTo &&
      task.assignedTo._id === userId &&
      task.status !== 'Done'
    );
  } catch (error) {
    console.error('Error fetching assigned tasks:', error);
    return [];
  }
};

// Récupérer le nombre total de tâches
export const getTotalTasksCount = async () => {
  try {
    const tasks = await getUserTasks();
    return tasks.length;
  } catch (error) {
    console.error('Error fetching total tasks count:', error);
    return 0;
  }
};

// Récupérer l'ID de l'utilisateur depuis le localStorage
const getUserIdFromLocalStorage = () => {
  try {
    const userData = localStorage.getItem('user');
    if (userData) {
      const parsedUser = JSON.parse(userData);
      return parsedUser._id;
    }
    return null;
  } catch (error) {
    console.error('Error parsing user data:', error);
    return null;
  }
};
