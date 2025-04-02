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
import axios from '../../utils/axios'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'

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
  const [loading, setLoading] = useState(false)
  const [projects, setProjects] = useState([])
  const [users, setUsers] = useState([])

  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)

  useEffect(() => {
    fetchData()
  }, [id])

  const fetchData = async () => {
    try {
      setLoading(true)
      // Récupérer les projets et utilisateurs
      const [projectsRes, usersRes] = await Promise.all([
        axios.get('/api/projects'),
        axios.get('/api/users')
      ])
      setProjects(projectsRes.data.projects)
      setUsers(usersRes.data.users)

      // Si en mode édition, récupérer la tâche
      if (isEditMode) {
        const taskRes = await axios.get(`/api/tasks/${id}`)
        const taskData = taskRes.data.task
        setTask({
          ...taskData,
          dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : '',
          assignedTo: taskData.assignedTo?._id || '',
          project: taskData.project?._id || '',
        })
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la récupération des données')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      if (isEditMode) {
        await axios.put(`/api/tasks/${id}`, task)
        toast.success('Tâche mise à jour avec succès')
      } else {
        await axios.post('/api/tasks', task)
        toast.success('Tâche créée avec succès')
      }
      navigate('/tasks')
    } catch (error) {
      console.error('Error saving task:', error)
      if (error.response?.data?.details) {
        Object.entries(error.response.data.details).forEach(([field, message]) => {
          toast.error(`${field}: ${message}`)
        })
      } else {
        toast.error(error.response?.data?.error || 'Erreur lors de la sauvegarde de la tâche')
      }
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setTask(prev => ({
      ...prev,
      [name]: value
    }))
  }

  if (loading) {
    return <div>Chargement...</div>
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
                <CCol>
                  <CFormSelect
                    label="Assigné à"
                    name="assignedTo"
                    value={task.assignedTo}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner un utilisateur</option>
                    {users.map(user => (
                      <option key={user._id} value={user._id}>
                        {user.name} ({user.email})
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol>
                  <CFormSelect
                    label="Projet"
                    name="project"
                    value={task.project}
                    onChange={handleChange}
                  >
                    <option value="">Sélectionner un projet</option>
                    {projects.map(project => (
                      <option key={project._id} value={project._id}>
                        {project.projectName}
                      </option>
                    ))}
                  </CFormSelect>
                </CCol>
              </CRow>
              <CRow>
                <CCol>
                  <CButton type="submit" color="primary" disabled={loading}>
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
