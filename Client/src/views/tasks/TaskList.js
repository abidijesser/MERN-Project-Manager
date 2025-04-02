import React, { useState, useEffect } from 'react'
import { CCard, CCardBody, CCardHeader, CButton, CTable, CTableBody, CTableHead, CTableRow, CTableHeaderCell, CTableDataCell } from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import axios from '../../utils/axios'
import { toast } from 'react-toastify'

const TaskList = () => {
  const [tasks, setTasks] = useState([])
  const [loading, setLoading] = useState(true)
  const navigate = useNavigate()

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      setLoading(true)
      const response = await axios.get('/api/tasks')
      setTasks(response.data.tasks)
    } catch (error) {
      console.error('Error fetching tasks:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la récupération des tâches')
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await axios.delete(`/api/tasks/${id}`)
        toast.success('Tâche supprimée avec succès')
        fetchTasks()
      } catch (error) {
        console.error('Error deleting task:', error)
        toast.error(error.response?.data?.error || 'Erreur lors de la suppression de la tâche')
      }
    }
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  return (
    <CCard>
      <CCardHeader>
        <strong>Liste des tâches</strong>
        <CButton
          color="primary"
          className="float-end"
          onClick={() => navigate('/tasks/new')}
        >
          Nouvelle tâche
        </CButton>
      </CCardHeader>
      <CCardBody>
        <CTable hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Titre</CTableHeaderCell>
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
                <CTableDataCell>{task.status}</CTableDataCell>
                <CTableDataCell>{task.priority}</CTableDataCell>
                <CTableDataCell>{new Date(task.dueDate).toLocaleDateString()}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="info"
                    size="sm"
                    className="me-2"
                    onClick={() => navigate(`/tasks/${task._id}`)}
                  >
                    Détails
                  </CButton>
                  <CButton
                    color="warning"
                    size="sm"
                    className="me-2"
                    onClick={() => navigate(`/tasks/edit/${task._id}`)}
                  >
                    Modifier
                  </CButton>
                  <CButton
                    color="danger"
                    size="sm"
                    onClick={() => handleDelete(task._id)}
                  >
                    Supprimer
                  </CButton>
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
