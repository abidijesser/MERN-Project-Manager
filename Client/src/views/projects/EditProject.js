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

const EditProject = () => {
  const [project, setProject] = useState({
    projectName: '',
    description: '',
    status: 'Active',
    startDate: '',
    endDate: '',
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const navigate = useNavigate()
  const { id } = useParams()

  useEffect(() => {
    fetchProject()
  }, [id])

  const fetchProject = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setError('No authentication token found')
        setLoading(false)
        return
      }

      const response = await axios.get(`http://localhost:3001/api/projects/${id}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success && response.data.project) {
        setProject(response.data.project)
      } else {
        setError('Failed to load project data')
      }
    } catch (error) {
      console.error('Erreur lors de la récupération du projet:', error)
      setError(error.response?.data?.error || 'Erreur lors de la récupération du projet.')
    } finally {
      setLoading(false)
    }
  }

  const handleChange = (e) => {
    setProject({
      ...project,
      [e.target.name]: e.target.value,
    })
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

      await axios.put(`http://localhost:3001/api/projects/${id}`, project, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })
      toast.success('Projet modifié avec succès !')
      navigate('/projects')
    } catch (error) {
      console.error('Erreur lors de la modification du projet:', error)
      setError(error.response?.data?.error || 'Erreur lors de la modification du projet.')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div className="alert alert-danger">{error}</div>
  }

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>
            <strong>Modifier le projet</strong>
          </CCardHeader>
          <CCardBody>
            <CForm onSubmit={handleSubmit}>
              <CRow className="mb-3">
                <CCol>
                  <CFormInput
                    label="Nom du projet"
                    name="projectName"
                    value={project.projectName}
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
                    value={project.description}
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
                    value={project.status}
                    onChange={handleChange}
                  >
                    <option value="Active">Active</option>
                    <option value="Completed">Completed</option>
                    <option value="Archived">Archived</option>
                  </CFormSelect>
                </CCol>
              </CRow>
              <CRow className="mb-3">
                <CCol>
                  <CFormInput
                    type="date"
                    label="Date de début"
                    name="startDate"
                    value={project.startDate}
                    onChange={handleChange}
                  />
                </CCol>
                <CCol>
                  <CFormInput
                    type="date"
                    label="Date de fin"
                    name="endDate"
                    value={project.endDate}
                    onChange={handleChange}
                  />
                </CCol>
              </CRow>
              <CRow>
                <CCol>
                  <CButton type="submit" color="primary" disabled={loading}>
                    {loading ? 'Sauvegarde...' : 'Modifier'}
                  </CButton>
                  <CButton
                    type="button"
                    color="secondary"
                    className="ms-2"
                    onClick={() => navigate('/projects')}
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

export default EditProject
