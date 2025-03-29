import React, { useState, useEffect } from 'react'
import { CCard, CCardBody, CCardHeader, CButton, CTable, CTableBody, CTableHead, CTableRow, CTableHeaderCell, CTableDataCell } from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import axios from 'axios'

const TaskList = () => {
  const [tasks, setTasks] = useState([])
  const navigate = useNavigate()

  useEffect(() => {
    fetchTasks()
  }, [])

  const fetchTasks = async () => {
    try {
      const response = await axios.get('http://localhost:3001/api/tasks')
      setTasks(response.data.tasks)
    } catch (error) {
      console.error('Error fetching tasks:', error)
    }
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
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {tasks.map((task) => (
              <CTableRow key={task._id}>
                <CTableDataCell>{task.title}</CTableDataCell>
                <CTableDataCell>{task.status}</CTableDataCell>
                <CTableDataCell>{task.priority}</CTableDataCell>
                <CTableDataCell>
                  <CButton
                    color="info"
                    size="sm"
                    onClick={() => navigate(`/tasks/${task._id}`)}
                  >
                    Détails
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
