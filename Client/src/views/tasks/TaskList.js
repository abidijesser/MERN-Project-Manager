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
  CFormInput,
  CAlert,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilX } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'
import { toast } from 'react-toastify'

const TaskList = () => {
  const [tasks, setTasks] = useState([])
  const [filteredTasks, setFilteredTasks] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    fetchTasks()
  }, [])

  // Filter tasks based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredTasks(tasks)
    } else {
      const lowercasedQuery = searchQuery.toLowerCase()
      const filtered = tasks.filter(
        (task) =>
          (task.title && task.title.toLowerCase().includes(lowercasedQuery)) ||
          (task.project &&
            task.project.projectName &&
            task.project.projectName.toLowerCase().includes(lowercasedQuery)) ||
          (task.assignedTo &&
            task.assignedTo.name &&
            task.assignedTo.name.toLowerCase().includes(lowercasedQuery)) ||
          (task.status && task.status.toLowerCase().includes(lowercasedQuery)) ||
          (task.priority && task.priority.toLowerCase().includes(lowercasedQuery)),
      )
      setFilteredTasks(filtered)
    }
  }, [searchQuery, tasks])

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
    // Récupérer la tâche pour vérifier si l'utilisateur est le propriétaire du projet
    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('No authentication token found')
        return
      }

      // Vérifier le rôle de l'utilisateur
      const userRole = localStorage.getItem('userRole')
      const userId = localStorage.getItem('userId')
      console.log('TaskList - User role:', userRole)
      console.log('TaskList - User ID:', userId)

      // Récupérer les détails de la tâche pour vérifier le propriétaire du projet
      const taskResponse = await axios.get(`http://localhost:3001/api/tasks/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      const task = taskResponse.data.task
      const isAdmin = userRole === 'Admin'
      const isProjectOwner = task.project && task.project.owner && task.project.owner._id === userId

      console.log('TaskList - Is admin:', isAdmin)
      console.log('TaskList - Is project owner:', isProjectOwner)

      // Seuls les administrateurs ou les propriétaires du projet peuvent supprimer des tâches
      if (!isAdmin && !isProjectOwner) {
        toast.error(
          'Seuls les administrateurs ou le propriétaire du projet peuvent supprimer cette tâche',
        )
        return
      }

      if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
        await axios.delete(`http://localhost:3001/api/tasks/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        toast.success('Tâche supprimée avec succès !')
        fetchTasks()
      }
    } catch (error) {
      console.error('Error deleting task:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression de la tâche')
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
      <CCardHeader>
        <div className="d-flex justify-content-between align-items-center">
          <h5>Liste des tâches</h5>
          <div className="d-flex align-items-center">
            <div className="position-relative me-2" style={{ width: '300px' }}>
              <CFormInput
                placeholder="Rechercher des tâches..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pr-5"
              />
              {searchQuery && (
                <CButton
                  color="link"
                  className="position-absolute"
                  style={{ right: '5px', top: '3px' }}
                  onClick={() => setSearchQuery('')}
                >
                  <CIcon icon={cilX} size="sm" />
                </CButton>
              )}
            </div>
            <CButton color="primary" onClick={() => navigate('/tasks/new')}>
              Nouvelle tâche
            </CButton>
          </div>
        </div>
        <div className="mt-2">
          <CAlert color="info" className="p-2 mb-0 small">
            Seuls les administrateurs ou le propriétaire du projet peuvent supprimer des tâches
          </CAlert>
        </div>
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
            {filteredTasks.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan="7" className="text-center">
                  {searchQuery
                    ? 'Aucune tâche ne correspond à votre recherche'
                    : 'Aucune tâche trouvée'}
                </CTableDataCell>
              </CTableRow>
            ) : (
              filteredTasks.map((task) => (
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

                    {/* Buttons for project owners */}
                    <CButton
                      color="primary"
                      size="sm"
                      className="me-2"
                      onClick={() => navigate(`/tasks/edit/${task._id}`)}
                      disabled={
                        !(
                          task.project &&
                          task.project.owner &&
                          task.project.owner._id === localStorage.getItem('userId')
                        )
                      }
                      title={
                        task.project &&
                        task.project.owner &&
                        task.project.owner._id === localStorage.getItem('userId')
                          ? 'Modifier la tâche'
                          : 'Seul le propriétaire du projet peut modifier la tâche'
                      }
                    >
                      Modifier
                    </CButton>
                    <CButton
                      color="danger"
                      size="sm"
                      className="me-2"
                      onClick={() => handleDelete(task._id)}
                      disabled={
                        !(
                          localStorage.getItem('userRole') === 'Admin' ||
                          (task.project &&
                            task.project.owner &&
                            task.project.owner._id === localStorage.getItem('userId'))
                        )
                      }
                      title={
                        localStorage.getItem('userRole') === 'Admin' ||
                        (task.project &&
                          task.project.owner &&
                          task.project.owner._id === localStorage.getItem('userId'))
                          ? 'Supprimer la tâche'
                          : 'Seuls les administrateurs ou le propriétaire du projet peuvent supprimer cette tâche'
                      }
                    >
                      Supprimer
                    </CButton>

                    {/* Status modification button for assigned users */}
                    {task.assignedTo && task.assignedTo._id === localStorage.getItem('userId') ? (
                      <CButton
                        color="warning"
                        size="sm"
                        onClick={() => navigate(`/tasks/status/${task._id}`)}
                      >
                        Modifier statut
                      </CButton>
                    ) : (
                      <CButton
                        color="warning"
                        size="sm"
                        disabled
                        title="Seul l'utilisateur assigné peut modifier le statut"
                      >
                        Modifier statut
                      </CButton>
                    )}
                  </CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}

export default TaskList
