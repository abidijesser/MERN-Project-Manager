import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CTable,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableBody,
  CTableDataCell,
  CButton,
  CBadge,
} from '@coreui/react'
import axios from 'axios'
import { useNavigate } from 'react-router-dom'

const TaskList = () => {
  const [tasks, setTasks] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    console.log('TaskList component mounted')
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      console.log('Fetching tasks...')
      const response = await axios.get('http://localhost:3001/api/tasks')
      console.log('Tasks received:', response.data)
      setTasks(response.data.tasks)
    } catch (error) {
      console.error('Error fetching tasks:', error.response || error)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer cette tâche ?')) {
      try {
        await axios.delete(`http://localhost:3001/api/tasks/${id}`)
        fetchTasks()
      } catch (error) {
        console.error('Error deleting task:', error)
      }
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

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>
            <strong>Liste des tâches</strong>
            <CButton
              color="primary"
              className="float-end"
              onClick={() => navigate('/tasks/create')}
            >
              Nouvelle tâche
            </CButton>
          </CCardHeader>
          <CCardBody>
            <CTable hover responsive>
              <CTableHead>
                <CTableRow>
                  <CTableHeaderCell>Titre</CTableHeaderCell>
                  <CTableHeaderCell>Description</CTableHeaderCell>
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
                    <CTableDataCell>{task.description}</CTableDataCell>
                    <CTableDataCell>{getStatusBadge(task.status)}</CTableDataCell>
                    <CTableDataCell>{getPriorityBadge(task.priority)}</CTableDataCell>
                    <CTableDataCell>{new Date(task.dueDate).toLocaleDateString()}</CTableDataCell>
                    <CTableDataCell>
                      <CButton
                        color="info"
                        size="sm"
                        className="me-2"
                        onClick={() => navigate(`/tasks/${task._id}`)}
                      >
                        Voir
                      </CButton>
                      <CButton
                        color="warning"
                        size="sm"
                        className="me-2"
                        onClick={() => navigate(`/tasks/edit/${task._id}`)}
                      >
                        Modifier
                      </CButton>
                      <CButton color="danger" size="sm" onClick={() => handleDelete(task._id)}>
                        Supprimer
                      </CButton>
                    </CTableDataCell>
                  </CTableRow>
                ))}
              </CTableBody>
            </CTable>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default TaskList
