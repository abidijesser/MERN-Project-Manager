import React, { useState, useEffect } from 'react'
import { CCard, CCardBody, CCardHeader, CCol, CRow, CBadge, CButton } from '@coreui/react'
import { useParams, useNavigate } from 'react-router-dom'
import axios from 'axios'

const TaskDetail = () => {
  const [task, setTask] = useState(null)
  const [error, setError] = useState('')
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    fetchTask()
  }, [id])

  const fetchTask = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/tasks/${id}`)
      setTask(response.data.task)
    } catch (error) {
      console.error('Error fetching task:', error)
      setError('Erreur lors de la récupération de la tâche')
    }
  }

  const getStatusBadge = (status) => {
    const colors = {
      'To Do': 'info',
      'In Progress': 'warning',
      Done: 'success',
    }
    return <CBadge color={colors[status]}>{status}</CBadge>
  }

  const getPriorityBadge = (priority) => {
    const colors = {
      Low: 'info',
      Medium: 'warning',
      High: 'danger',
    }
    return <CBadge color={colors[priority]}>{priority}</CBadge>
  }

  if (error) {
    return <div className="text-center text-danger">{error}</div>
  }

  if (!task) {
    return <div className="text-center">Chargement...</div>
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
              <p>{new Date(task.dueDate).toLocaleDateString()}</p>
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
                <p>{task.project.name}</p>
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
