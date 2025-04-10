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
  const [error, setError] = useState('')
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
      const token = localStorage.getItem('token')
      if (!token) {
        setError('No authentication token found')
        setLoading(false)
        return
      }

      // Récupérer les projets et utilisateurs
      const [projectsRes, usersRes] = await Promise.all([
        axios.get('http://localhost:3001/api/projects', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
        axios.get('http://localhost:3001/api/auth/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }),
      ])

      if (projectsRes.data.success) {
        setProjects(projectsRes.data.projects)
      } else {
        throw new Error('Failed to fetch projects')
      }

      if (usersRes.data.success) {
        setUsers(usersRes.data.users)
      } else {
        throw new Error('Failed to fetch users')
      }

      // Si en mode édition, récupérer la tâche
      if (isEditMode) {
        const taskRes = await axios.get(`http://localhost:3001/api/tasks/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (taskRes.data.success) {
          const taskData = taskRes.data.task
          setTask({
            ...taskData,
            dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : '',
            assignedTo: taskData.assignedTo?._id || '',
            project: taskData.project?._id || '',
          })
        } else {
          throw new Error('Failed to fetch task')
        }
      }
    } catch (error) {
      console.error('Error fetching data:', error)
      setError(error.response?.data?.error || 'Erreur lors de la récupération des données')
      toast.error(error.response?.data?.error || 'Erreur lors de la récupération des données')
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setError('No authentication token found')
        setLoading(false)
        return
      }

      const url = isEditMode
        ? `http://localhost:3001/api/tasks/${id}`
        : 'http://localhost:3001/api/tasks'

      const method = isEditMode ? 'put' : 'post'

      const response = await axios[method](url, task, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        toast.success(`Tâche ${isEditMode ? 'modifiée' : 'créée'} avec succès`)
        navigate('/tasks')
      } else {
        throw new Error(response.data.error || `Failed to ${isEditMode ? 'update' : 'create'} task`)
      }
    } catch (error) {
      console.error('Error submitting task:', error)
      setError(
        error.response?.data?.error ||
          `Erreur lors de la ${isEditMode ? 'modification' : 'création'} de la tâche`,
      )
      toast.error(
        error.response?.data?.error ||
          `Erreur lors de la ${isEditMode ? 'modification' : 'création'} de la tâche`,
      )
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setTask((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  if (loading) {
    return <div>Chargement...</div>
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>
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
              <div className="mb-3">
                <CFormInput
                  label="Titre"
                  name="title"
                  value={task.title}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <CFormTextarea
                  label="Description"
                  name="description"
                  value={task.description}
                  onChange={handleChange}
                  required
                />
              </div>
              <div className="mb-3">
                <CFormSelect
                  label="Statut"
                  name="status"
                  value={task.status}
                  onChange={handleChange}
                  options={[
                    { label: 'To Do', value: 'To Do' },
                    { label: 'In Progress', value: 'In Progress' },
                    { label: 'Done', value: 'Done' },
                  ]}
                />
              </div>
              <div className="mb-3">
                <CFormSelect
                  label="Priorité"
                  name="priority"
                  value={task.priority}
                  onChange={handleChange}
                  options={[
                    { label: 'Low', value: 'Low' },
                    { label: 'Medium', value: 'Medium' },
                    { label: 'High', value: 'High' },
                  ]}
                />
              </div>
              <div className="mb-3">
                <CFormInput
                  type="date"
                  label="Date d'échéance"
                  name="dueDate"
                  value={task.dueDate}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <CFormSelect
                  label="Assigné à"
                  name="assignedTo"
                  value={task.assignedTo}
                  onChange={handleChange}
                  options={[
                    { label: 'Sélectionner un utilisateur', value: '' },
                    ...users.map((user) => ({
                      label: user.name,
                      value: user._id,
                    })),
                  ]}
                />
              </div>
              <div className="mb-3">
                <CFormSelect
                  label="Projet"
                  name="project"
                  value={task.project}
                  onChange={handleChange}
                  options={[
                    { label: 'Sélectionner un projet', value: '' },
                    ...projects.map((project) => ({
                      label: project.projectName,
                      value: project._id,
                    })),
                  ]}
                />
              </div>
              <div className="d-flex justify-content-end">
                <CButton color="secondary" className="me-2" onClick={() => navigate('/tasks')}>
                  Annuler
                </CButton>
                <CButton type="submit" color="primary">
                  {isEditMode ? 'Modifier' : 'Créer'}
                </CButton>
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default TaskForm
