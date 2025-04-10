import React, { useState, useEffect } from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow, CButton, CBadge, CSpinner } from '@coreui/react'
import { useNavigate, useParams } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const TaskDetail = () => {
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    fetchTask()
  }, [id])

  const fetchTask = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setError('No authentication token found')
        setLoading(false)
        return
      }

      const response = await axios.get(`http://localhost:3001/api/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        setTask(response.data.task)
      } else {
        throw new Error('Failed to fetch task')
      }
    } catch (error) {
      console.error('Error fetching task:', error)
      setError(error.response?.data?.error || 'Erreur lors de la récupération de la tâche')
      toast.error(error.response?.data?.error || 'Erreur lors de la récupération de la tâche')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await axios.delete(`/api/tasks/${id}`)
        toast.success('Tâche supprimée avec succès')
        navigate('/tasks')
      } catch (error) {
        console.error('Error deleting task:', error)
        toast.error(error.response?.data?.error || 'Erreur lors de la suppression de la tâche')
      }
    }
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      'To Do': 'warning',
      'In Progress': 'info',
      Done: 'success',
    }
    return <CBadge color={statusColors[status] || 'secondary'}>{status}</CBadge>
  }

  const getPriorityBadge = (priority) => {
    const priorityColors = {
      Low: 'success',
      Medium: 'warning',
      High: 'danger',
    }
    return <CBadge color={priorityColors[priority] || 'secondary'}>{priority}</CBadge>
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>
  }

  if (!task) {
    return <div className="alert alert-warning">Tâche non trouvée</div>
  }

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <h5>Détails de la tâche</h5>
            <div>
              <CButton
                color="primary"
                className="me-2"
                onClick={() => navigate(`/tasks/edit/${id}`)}
              >
                Modifier
              </CButton>
              <CButton color="danger" className="me-2" onClick={handleDelete}>
                Supprimer
              </CButton>
              <CButton color="secondary" onClick={() => navigate('/tasks')}>
                Retour
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <div className="mb-4">
              <h4>{task.title}</h4>
              <div className="d-flex gap-3 mb-3">
                <div>
                  <strong>Statut:</strong> {getStatusBadge(task.status)}
                </div>
                <div>
                  <strong>Priorité:</strong> {getPriorityBadge(task.priority)}
                </div>
              </div>
            </div>

            <div className="mb-4">
              <h5>Description</h5>
              <p>{task.description}</p>
            </div>

            <div className="row mb-4">
              <div className="col-md-6">
                <h5>Informations</h5>
                <table className="table">
                  <tbody>
                    <tr>
                      <th>Projet:</th>
                      <td>{task.project?.projectName || 'Non assigné'}</td>
                    </tr>
                    <tr>
                      <th>Assigné à:</th>
                      <td>{task.assignedTo?.name || 'Non assigné'}</td>
                    </tr>
                    <tr>
                      <th>Date d'échéance:</th>
                      <td>
                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Non définie'}
                      </td>
                    </tr>
                    <tr>
                      <th>Date de création:</th>
                      <td>{new Date(task.createdAt).toLocaleDateString()}</td>
                    </tr>
                    <tr>
                      <th>Dernière modification:</th>
                      <td>{new Date(task.updatedAt).toLocaleDateString()}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default TaskDetail
