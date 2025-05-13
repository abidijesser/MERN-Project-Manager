import axios from 'axios';

const API_URL = 'http://192.168.33.10:3001/api/calendar';

// Get auth headers
const getAuthHeaders = () => ({
  headers: {
    Authorization: `Bearer ${localStorage.getItem('token')}`,
  },
});

/**
 * Get Google Calendar authentication URL
 * @returns {Promise<Object>} Authentication URL
 */
export const getGoogleCalendarAuthUrl = async () => {
  try {
    const response = await axios.get(`${API_URL}/auth-url`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error getting Google Calendar auth URL:', error);
    throw error;
  }
};

/**
 * Check if user is authenticated with Google Calendar
 * @returns {Promise<Object>} Authentication status
 */
export const checkGoogleCalendarAuth = async () => {
  try {
    const response = await axios.get(`${API_URL}/check-auth`, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error checking Google Calendar auth:', error);
    throw error;
  }
};

/**
 * Remove Google Calendar token
 * @returns {Promise<Object>} Result of token removal
 */
export const removeGoogleCalendarToken = async () => {
  try {
    const response = await axios.post(`${API_URL}/remove-token`, {}, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error removing Google Calendar token:', error);
    throw error;
  }
};

/**
 * Sync tasks with Google Calendar
 * @returns {Promise<Object>} Result of sync operation
 */
export const syncTasksWithGoogleCalendar = async () => {
  try {
    const response = await axios.post(`${API_URL}/sync-tasks`, {}, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error syncing tasks with Google Calendar:', error);
    throw error;
  }
};

/**
 * Sync projects with Google Calendar
 * @returns {Promise<Object>} Result of sync operation
 */
export const syncProjectsWithGoogleCalendar = async () => {
  try {
    const response = await axios.post(`${API_URL}/sync-projects`, {}, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error syncing projects with Google Calendar:', error);
    throw error;
  }
};

/**
 * Sync a specific task with Google Calendar
 * @param {string} taskId - Task ID
 * @returns {Promise<Object>} Result of sync operation
 */
export const syncTaskWithGoogleCalendar = async (taskId) => {
  try {
    const response = await axios.post(`${API_URL}/sync-task/${taskId}`, {}, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error syncing task with Google Calendar:', error);
    throw error;
  }
};

/**
 * Sync a specific project with Google Calendar
 * @param {string} projectId - Project ID
 * @returns {Promise<Object>} Result of sync operation
 */
export const syncProjectWithGoogleCalendar = async (projectId) => {
  try {
    const response = await axios.post(`${API_URL}/sync-project/${projectId}`, {}, getAuthHeaders());
    return response.data;
  } catch (error) {
    console.error('Error syncing project with Google Calendar:', error);
    throw error;
  }
};

/**
 * Format events for calendar display
 * @param {Array} projects - List of projects
 * @param {Array} tasks - List of tasks
 * @returns {Array} Formatted events
 */
export const formatCalendarEvents = (projects = [], tasks = []) => {
  const projectEvents = projects.map(project => ({
    id: project._id,
    title: project.projectName,
    startDate: new Date(project.startDate),
    endDate: new Date(project.endDate),
    type: 'project',
    color: '#4f5d73', // Dark blue
    data: project
  }));
  
  const taskEvents = tasks.map(task => ({
    id: task._id,
    title: task.title,
    date: new Date(task.dueDate),
    type: 'task',
    color: task.priority === 'High' ? '#e55353' : task.priority === 'Medium' ? '#f9b115' : '#2eb85c',
    data: task
  }));
  
  return [...projectEvents, ...taskEvents];
};
