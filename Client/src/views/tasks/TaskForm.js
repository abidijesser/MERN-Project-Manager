import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormInput,
  CFormTextarea,
  CFormSelect,
  CButton,
} from '@coreui/react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'

const TaskForm = () => {
  const [task, setTask] = useState({
    title: '',
    description: '',
    status: 'To Do',
    priority: 'Medium',
    dueDate: '',
    assignedTo: '',
    project: '',
  })

  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)

  useEffect(() => {
    if (isEditMode) {
      fetchTask()
    }
  }, [id])

  const fetchTask = async () => {
    try {
      const response = await axios.get(`http://localhost:3001/api/tasks/${id}`)
      const taskData = response.data.task
      setTask({
        ...taskData,
        dueDate: taskData.dueDate.split('T')[0],
      })
    } catch (error) {
      console.error('Error fetching task:', error)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      if (isEditMode) {
        await axios.put(`http://localhost:3001/api/tasks/${id}`, task)
      } else {
        await axios.post('http://localhost:3001/api/tasks', task)
      }
      navigate('/tasks')
    } catch (error) {
      console.error('Error saving task:', error)
    }
  }

  const handleChange = (e) => {
    setTask({
      ...task,
      [e.target.name]: e.target.value,
    })
  }

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>
            <strong>{isEditMode ? 'Modifier la tâche' : 'Nouvelle tâche'}</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CRow className="mb-3">
                <CCol>
                  <CFormInput
                    label="Titre"
                    name="title"
                    value={task.title}
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol>
                  <CFormTextarea
                    label="Description"
                    name="description"
                    value={task.description}
                    onChange={handleChange}
                    required
                  />
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol>
                  <CFormSelect
                    label="Statut"
                    name="status"
                    value={task.status}
                    onChange={handleChange}
                  >
                    <option value="To Do">À faire</option>
                    <option value="In Progress">En cours</option>
                    <option value="Done">Terminé</option>
                  </CFormSelect>
                </CCol>
                <CCol>
                  <CFormSelect
                    label="Priorité"
                    name="priority"
                    value={task.priority}
                    onChange={handleChange}
                  >
                    <option value="Low">Basse</option>
                    <option value="Medium">Moyenne</option>
                    <option value="High">Haute</option>
                  </CFormSelect>
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol>
                  <CFormInput
                    type="date"
                    label="Date d'échéance"
                    name="dueDate"
                    value={task.dueDate}
                    onChange={handleChange}
                  />
                </CCol>
              </CRow>
              <CRow>
                <CCol>
                  <CButton type="submit" color="primary">
                    {isEditMode ? 'Mettre à jour' : 'Créer'}
                  </CButton>
                  <CButton
                    type="button"
                    color="secondary"
                    className="ms-2"
                    onClick={() => navigate('/tasks')}
                  >
                    Annuler
                  </CButton>
                </CCol>
              </CRow>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default TaskForm
