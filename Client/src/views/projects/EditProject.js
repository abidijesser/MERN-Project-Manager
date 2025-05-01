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
  CFormLabel,
  CListGroup,
  CListGroupItem,
  CFormCheck,
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
    members: [],
  })
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [users, setUsers] = useState([])
  const [selectedMembers, setSelectedMembers] = useState([])
  const [loadingUsers, setLoadingUsers] = useState(false)
  const navigate = useNavigate()
  const { id } = useParams()

  // Fetch project data
  useEffect(() => {
    fetchProject()
  }, [id])

  // Fetch client users for member selection
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoadingUsers(true)
        const token = localStorage.getItem('token')
        if (!token) {
          toast.error('No authentication token found')
          return
        }

        const response = await axios.get('http://localhost:3001/api/auth/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

        if (response.data.success) {
          // Filter only client users
          const clientUsers = response.data.users.filter((user) => user.role === 'Client')
          setUsers(clientUsers)
        } else {
          toast.error('Failed to fetch users')
        }
      } catch (error) {
        console.error('Error fetching users:', error)
        toast.error(error.response?.data?.error || 'Error fetching users')
      } finally {
        setLoadingUsers(false)
      }
    }

    fetchUsers()
  }, [])

  // We're allowing all users to access the edit page, but only the owner can save changes
  // The server will enforce this restriction

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
        const projectData = response.data.project

        // Extract member IDs from the project data
        let memberIds = []
        if (projectData.members && projectData.members.length > 0) {
          memberIds = projectData.members.map((member) =>
            typeof member === 'object' ? member._id : member,
          )
        }

        // Update the project state with formatted dates
        setProject({
          ...projectData,
          startDate: projectData.startDate
            ? new Date(projectData.startDate).toISOString().split('T')[0]
            : '',
          endDate: projectData.endDate
            ? new Date(projectData.endDate).toISOString().split('T')[0]
            : '',
          members: memberIds,
        })

        // Update selected members
        setSelectedMembers(memberIds)
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

  // Handle member selection
  const handleMemberToggle = (userId) => {
    setSelectedMembers((prevSelected) => {
      if (prevSelected.includes(userId)) {
        return prevSelected.filter((id) => id !== userId)
      } else {
        return [...prevSelected, userId]
      }
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

      // Validate that at least 5 members are selected
      if (selectedMembers.length < 5) {
        toast.error('Vous devez sélectionner au moins 5 membres pour le projet')
        setLoading(false)
        return
      }

      // Create a copy of the project with the selected members
      const projectData = {
        ...project,
        members: selectedMembers,
      }

      const response = await axios.put(`http://localhost:3001/api/projects/${id}`, projectData, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data.success) {
        toast.success('Projet modifié avec succès !')
        navigate('/projects')
      } else {
        setError(response.data.error || 'Erreur lors de la modification du projet.')
        toast.error(response.data.error || 'Erreur lors de la modification du projet.')
      }
    } catch (error) {
      console.error('Erreur lors de la modification du projet:', error)
      // Handle permission errors specifically
      if (error.response?.status === 403) {
        toast.error(
          "Vous n'êtes pas autorisé à modifier ce projet. Seul le propriétaire peut le modifier.",
        )
      } else {
        toast.error(error.response?.data?.error || 'Erreur lors de la modification du projet.')
      }
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
              <CRow className="mb-3">
                <CCol>
                  <CFormLabel>Membres du projet (sélectionnez au moins 5 membres)</CFormLabel>
                  <div
                    className="border rounded p-3"
                    style={{ maxHeight: '200px', overflowY: 'auto' }}
                  >
                    {loadingUsers ? (
                      <div className="text-center">Chargement des utilisateurs...</div>
                    ) : users.length === 0 ? (
                      <div className="text-center">Aucun utilisateur disponible</div>
                    ) : (
                      <CListGroup>
                        {users.map((user) => (
                          <CListGroupItem
                            key={user._id}
                            className="d-flex justify-content-between align-items-center"
                          >
                            <CFormCheck
                              id={`member-${user._id}`}
                              label={`${user.name} (${user.email})`}
                              checked={selectedMembers.includes(user._id)}
                              onChange={() => handleMemberToggle(user._id)}
                            />
                          </CListGroupItem>
                        ))}
                      </CListGroup>
                    )}
                  </div>
                  <div className="text-muted mt-1">
                    {selectedMembers.length} membre(s) sélectionné(s){' '}
                    {selectedMembers.length < 5 && '(minimum 5 requis)'}
                  </div>
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
