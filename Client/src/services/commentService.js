import axios from '../utils/axios'
import socketService from './socketService'

const API_URL = '/comments'

// Create a comment for a task
export const createTaskComment = async (taskId, content) => {
  try {
    const response = await axios.post(`${API_URL}/task/${taskId}`, { content })

    // Emit the comment via socket for real-time updates
    if (response.data.success) {
      socketService.sendComment({
        ...response.data.comment,
        taskId,
      })
    }

    return response.data
  } catch (error) {
    console.error('Error creating task comment:', error)
    throw error
  }
}

// Create a comment for a project
export const createProjectComment = async (projectId, content) => {
  try {
    const response = await axios.post(`${API_URL}/project/${projectId}`, { content })

    // Emit the comment via socket for real-time updates
    if (response.data.success) {
      socketService.sendComment({
        ...response.data.comment,
        projectId,
      })
    }

    return response.data
  } catch (error) {
    console.error('Error creating project comment:', error)
    throw error
  }
}

// Get comments for a task
export const getTaskComments = async (taskId) => {
  try {
    const response = await axios.get(`${API_URL}/task/${taskId}`)
    return response.data
  } catch (error) {
    console.error('Error getting task comments:', error)
    throw error
  }
}

// Get comments for a project
export const getProjectComments = async (projectId) => {
  try {
    const response = await axios.get(`${API_URL}/project/${projectId}`)
    return response.data
  } catch (error) {
    console.error('Error getting project comments:', error)
    throw error
  }
}

// Update a comment
export const updateComment = async (commentId, content) => {
  try {
    const response = await axios.put(`${API_URL}/${commentId}`, { content })
    return response.data
  } catch (error) {
    console.error('Error updating comment:', error)
    throw error
  }
}

// Delete a comment
export const deleteComment = async (commentId) => {
  try {
    const response = await axios.delete(`${API_URL}/${commentId}`)
    return response.data
  } catch (error) {
    console.error('Error deleting comment:', error)
    throw error
  }
}
