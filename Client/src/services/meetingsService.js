import axios from '../utils/axios';

// Utiliser l'instance axios configurée avec le token d'authentification
export const fetchMeetings = async () => {
  try {
    const response = await axios.get('/api/meetings');
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des réunions:', error);
    throw error;
  }
};

export const fetchUpcomingMeetings = async (limit = 5) => {
  try {
    const response = await axios.get(`/api/meetings/upcoming?limit=${limit}`);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des prochaines réunions:', error);
    throw error;
  }
};

export const createMeeting = async (meetingData) => {
  try {
    const response = await axios.post('/api/meetings', meetingData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la réunion:', error);
    throw error;
  }
};

export const getMeetingById = async (id) => {
  try {
    const response = await axios.get(`/api/meetings/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la récupération de la réunion ${id}:`, error);
    throw error;
  }
};

export const updateMeeting = async (id, meetingData) => {
  try {
    const response = await axios.put(`/api/meetings/${id}`, meetingData);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la mise à jour de la réunion ${id}:`, error);
    throw error;
  }
};

export const deleteMeeting = async (id) => {
  try {
    const response = await axios.delete(`/api/meetings/${id}`);
    return response.data;
  } catch (error) {
    console.error(`Erreur lors de la suppression de la réunion ${id}:`, error);
    throw error;
  }
};
