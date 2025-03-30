import axios from 'axios';

const API_URL = 'http://localhost:3000/api/meetings'; // Remplacez par l'URL de votre API

export const fetchMeetings = async () => {
  try {
    const response = await axios.get(API_URL);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des réunions:', error);
    throw error;
  }
};

export const createMeeting = async (meetingData) => {
  try {
    const response = await axios.post(API_URL, meetingData);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création de la réunion:', error);
    throw error;
  }
};
