import axios from 'axios';

const API_URL = 'http://localhost:3001/api/gemini'; // URL for our Gemini API endpoint

/**
 * Test the connection to the Gemini API
 * @returns {Promise<Object>} - The test result
 */
export const testGeminiConnection = async () => {
  try {
    console.log('Testing Gemini API connection...');
    const response = await axios.get(`${API_URL}/test-connection`);
    console.log('Gemini API test result:', response.data);
    return response.data;
  } catch (error) {
    console.error('Error testing Gemini API connection:', error);
    return {
      success: false,
      error: error.message,
      details: error.response ? error.response.data : 'No response data'
    };
  }
};

/**
 * Send a message to Gemini and get a response
 * @param {string} message - The message to send to Gemini
 * @returns {Promise<Object>} - The response from Gemini
 */
export const sendMessageToGemini = async (message) => {
  try {
    console.log('Sending message to Gemini API:', message);
    console.log('API URL:', API_URL);

    const response = await axios.post(API_URL, { message });
    console.log('Received response from Gemini:', response.data);

    return response.data;
  } catch (error) {
    console.error('Error sending message to Gemini:', error);
    console.error('Error details:', error.response ? error.response.data : 'No response data');
    throw error;
  }
};
