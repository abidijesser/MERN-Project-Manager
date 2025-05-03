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
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'
import axios from '../../utils/axios'

const CreateProject = () => {
  const [project, setProject] = useState({
    projectName: '',
    description: '',
    status: 'Active',
    startDate: '',
    endDate: '',
    tasks: [],
    members: [],
  })
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(false)
  const [selectedMembers, setSelectedMembers] = useState([])
  const navigate = useNavigate()

  // Fetch client users for member selection
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        setLoading(true)
        const token = localStorage.getItem('token')
        if (!token) {
          toast.error('No authentication token found')
          return
        }

        const response = await axios.get('/api/auth/users', {
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
        setLoading(false)
      }
    }

    fetchUsers()
  }, [])

  const handleChange = (e) => {
    const { name, value } = e.target
    setProject((prev) => ({
      ...prev,
      [name]: value,
    }))
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

    // Validation des dates
    const startDate = new Date(project.startDate)
    const endDate = new Date(project.endDate)

    if (startDate > endDate) {
      toast.error('La date de début doit être antérieure à la date de fin')
      return
    }

    // Validate that at least 5 members are selected
    if (selectedMembers.length < 5) {
      toast.error('Vous devez sélectionner au moins 5 membres pour le projet')
      return
    }

    try {
      // Create a copy of the project with the selected members
      const projectData = {
        ...project,
        members: selectedMembers,
      }

      console.log('Données envoyées :', projectData)
      const response = await axios.post('/api/projects', projectData)

      if (response.data.message) {
        toast.success(response.data.message)
      } else {
        toast.success('Projet créé avec succès !')
      }

      navigate('/projects')
    } catch (error) {
      console.error('Erreur lors de la création du projet :', error)
      if (error.response?.data?.details) {
        // Afficher les détails de l'erreur de validation
        if (Array.isArray(error.response.data.details)) {
          error.response.data.details.forEach((detail) => {
            toast.error(detail)
          })
        } else {
          Object.entries(error.response.data.details).forEach(([field, message]) => {
            if (message) {
              toast.error(message)
            }
          })
        }
      } else {
        toast.error(error.response?.data?.error || 'Erreur lors de la création du projet')
      }
    }
  }

  return (
    <CRow>
      <CCol>
        <CCard>
          <CCardHeader>
            <strong>Créer un nouveau projet</strong>
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
                    required
                  />
                </CCol>
                <CCol>
                  <CFormInput
                    type="date"
                    label="Date de fin"
                    name="endDate"
                    value={project.endDate}
                    onChange={handleChange}
                    required
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
                    {loading ? (
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
                  <CButton type="submit" color="primary">
                    Créer
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

export default CreateProject
