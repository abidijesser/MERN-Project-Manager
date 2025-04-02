import React, { useState, useEffect } from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow, CBadge, CButton } from '@coreui/react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from '../../utils/axios'
import { toast } from 'react-toastify'

const TaskDetail = () => {
  const [task, setTask] = useState(null)
  const [loading, setLoading] = useState(true)
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    fetchTask()
  }, [id])

  const fetchTask = async () => {
    try {
      setLoading(true)
      const response = await axios.get(`/api/tasks/${id}`)
      setTask(response.data.task)
    } catch (error) {
      console.error('Error fetching task:', error)
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
    const colors = {
      'To Do': 'info',
      'In Progress': 'warning',
      'Done': 'success',
    }
    return <CBadge color={colors[status]}>{status}</CBadge>
  }

  const getPriorityBadge = (priority) => {
    const colors = {
      'Low': 'info',
      'Medium': 'warning',
      'High': 'danger',
    }
    return <CBadge color={colors[priority]}>{priority}</CBadge>
  }

  if (loading) {
    return <div className="text-center">Chargement...</div>
  }

  if (!task) {
    return <div className="text-center text-danger">Tâche non trouvée</div>
  }

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>
            <strong>Détails de la tâche</strong>
            <div className="float-end">
              <CButton
                color="primary"
                className="me-2"
                onClick={() => navigate(`/tasks/edit/${id}`)}
              >
                Modifier
              </CButton>
              <CButton
                color="danger"
                className="me-2"
                onClick={handleDelete}
              >
                Supprimer
              </CButton>
              <CButton color="secondary" onClick={() => navigate('/tasks')}>
                Retour
              </CButton>
            </div>
          </CCardHeader>
          <CCardBody>
            <div className="mb-3">
              <h2>{task.title}</h2>
              <div className="mb-3">
                <strong>Statut: </strong>
                {getStatusBadge(task.status)}
              </div>
              <div className="mb-3">
                <strong>Priorité: </strong>
                {getPriorityBadge(task.priority)}
              </div>
            </div>

            <div className="mb-3">
              <strong>Description:</strong>
              <p>{task.description}</p>
            </div>

            <div className="mb-3">
              <strong>Date d'échéance:</strong>
              <p>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Non définie'}</p>
            </div>

            {task.assignedTo && (
              <div className="mb-3">
                <strong>Assigné à:</strong>
                <p>
                  {task.assignedTo.name} ({task.assignedTo.email})
                </p>
              </div>
            )}

            {task.project && (
              <div className="mb-3">
                <strong>Projet:</strong>
                <p>{task.project.projectName}</p>
              </div>
            )}

            <div className="mb-3">
              <strong>Créé par:</strong>
              <p>{task.createdBy?.name || 'Non spécifié'}</p>
            </div>

            <div className="mb-3">
              <strong>Créé le:</strong>
              <p>{new Date(task.createdAt).toLocaleString()}</p>
            </div>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default TaskDetail
