import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CTable,
  CTableBody,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CBadge,
  CSpinner,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const TaskList = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setError('No authentication token found')
        setLoading(false)
        return
      }

      const response = await axios.get('http://localhost:3001/api/tasks', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        setTasks(response.data.tasks)
      } else {
        throw new Error('Failed to fetch tasks')
      }
    } catch (error) {
      console.error('Error fetching tasks:', error)
      setError(error.response?.data?.error || 'Erreur lors de la récupération des tâches')
      toast.error(error.response?.data?.error || 'Erreur lors de la récupération des tâches')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    // Vérifier le rôle de l'utilisateur
    const userRole = localStorage.getItem('userRole')
    console.log('TaskList - User role:', userRole)

    // Seuls les administrateurs peuvent supprimer des tâches
    if (userRole !== 'Admin') {
      toast.error('Seuls les administrateurs peuvent supprimer des tâches')
      return
    }

    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('No authentication token found')
          return
        }

        await axios.delete(`http://localhost:3001/api/tasks/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        toast.success('Tâche supprimée avec succès !')
        fetchTasks()
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

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h5>Liste des tâches</h5>
        {localStorage.getItem('userRole') === 'Admin' && (
          <CButton color="primary" onClick={() => navigate('/tasks/new')}>
            Nouvelle tâche
          </CButton>
        )}
      </CCardHeader>
      <CCardBody>
        <CTable hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Titre</CTableHeaderCell>
              <CTableHeaderCell>Projet</CTableHeaderCell>
              <CTableHeaderCell>Assigné à</CTableHeaderCell>
              <CTableHeaderCell>Statut</CTableHeaderCell>
              <CTableHeaderCell>Priorité</CTableHeaderCell>
              <CTableHeaderCell>Date d'échéance</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {tasks.map((task) => (
              <CTableRow key={task._id}>
                <CTableDataCell>{task.title}</CTableDataCell>
                <CTableDataCell>{task.project?.projectName || 'Non assigné'}</CTableDataCell>
                <CTableDataCell>{task.assignedTo?.name || 'Non assigné'}</CTableDataCell>
                <CTableDataCell>{getStatusBadge(task.status)}</CTableDataCell>
                <CTableDataCell>{getPriorityBadge(task.priority)}</CTableDataCell>
                <CTableDataCell>
                  {task.dueDate ? new Date(task.dueDate).toLocaleDateString() : 'Non définie'}
                </CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="info"
                    size="sm"
                    className="me-2"
                    onClick={() => navigate(`/tasks/${task._id}`)}
                  >
                    Détails
                  </CButton>
                  {localStorage.getItem('userRole') === 'Admin' && (
                    <>
                      <CButton
                        color="primary"
                        size="sm"
                        className="me-2"
                        onClick={() => navigate(`/tasks/edit/${task._id}`)}
                      >
                        Modifier
                      </CButton>
                      <CButton color="danger" size="sm" onClick={() => handleDelete(task._id)}>
                        Supprimer
                      </CButton>
                    </>
                  )}
                </CTableDataCell>
              </CTableRow>
            ))}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}

export default TaskList
