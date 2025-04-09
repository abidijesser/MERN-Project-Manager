import React, { useState, useEffect } from 'react'
import { CCard, CCardBody, CCardHeader, CButton, CTable, CTableBody, CTableHead, CTableRow, CTableHeaderCell, CTableDataCell } from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import axios from '../../utils/axios'
import { toast } from 'react-toastify'
import './TaskList.css'
import Calendar from 'react-calendar'
import 'react-calendar/dist/Calendar.css'

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
        toast.error(error.response?.data?.error || 'Erreur lors de la suppression de la tâche')
      }
    }
  }

  const tileContent = ({ date, view }) => {
    if (view === 'month') {
      const task = tasks.find(
        (task) => new Date(task.dueDate).toDateString() === date.toDateString()
      )
      if (task) {
        const priorityClass = `task-priority-${task.priority || 'default'}`
        return <div className={`task-date ${priorityClass}`}>{task.title}</div>
      }
    }
    return null
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
        <div className="d-flex flex-wrap">
          <div className="task-table me-4">
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
                    <CTableDataCell className={`task-priority-${task.priority || 'default'}`}>
                      {task.title}
                    </CTableDataCell>
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
          </div>
          <div className="task-calendar">
            <h5>Calendrier des tâches</h5>
            <div className="calendar-legend">
              <span className="legend-item high">Haute priorité</span>
              <span className="legend-item medium">Priorité moyenne</span>
              <span className="legend-item low">Basse priorité</span>
            </div>
            <Calendar tileContent={tileContent} />
          </div>
        </div>
      </CCardBody>
    </CCard>
  )
}

export default TaskList
