import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CButton,
  CTable,
  CTableBody,
  CTableHead,
  CTableRow,
  CTableHeaderCell,
  CTableDataCell,
  CFormInput,
  CBadge,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilX } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import axios from '../../utils/axios'
import { toast } from 'react-toastify'

const ProjectsList = () => {
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [])

  // Filter projects based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredProjects(projects)
    } else {
      const lowercasedQuery = searchQuery.toLowerCase()
      const filtered = projects.filter(
        (project) =>
          (project.projectName && project.projectName.toLowerCase().includes(lowercasedQuery)) ||
          (project.description && project.description.toLowerCase().includes(lowercasedQuery)) ||
          (project.status && project.status.toLowerCase().includes(lowercasedQuery)),
      )
      setFilteredProjects(filtered)
    }
  }, [searchQuery, projects])

  const fetchProjects = async () => {
    setLoading(true)
    try {
      // Récupération des projets depuis l'API backend
      const response = await axios.get('/projects')

      if (response.data.success && response.data.projects) {
        console.log(`Fetched ${response.data.projects.length} projects where user is a member`)
        setProjects(response.data.projects) // Mise à jour de l'état avec les projets
      } else {
        console.error('Format de réponse inattendu:', response.data)
        setProjects([])
        toast.error('Format de réponse inattendu lors de la récupération des projets')
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la récupération des projets')
      setProjects([])
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      try {
        const response = await axios.delete(`/projects/${id}`)
        if (response.data.success) {
          toast.success('Projet supprimé avec succès !')
          fetchProjects()
        } else {
          toast.error(response.data.error || 'Erreur lors de la suppression du projet')
        }
      } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error)
        toast.error(error.response?.data?.error || 'Erreur lors de la suppression du projet')
      }
    }
  }

  const getStatusBadge = (status) => {
    const statusColors = {
      Active: 'primary',
      Completed: 'success',
      Archived: 'secondary',
    }
    return <CBadge color={statusColors[status] || 'info'}>{status}</CBadge>
  }

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  return (
    <CCard>
      <CCardHeader className="d-flex justify-content-between align-items-center">
        <h5>Liste des projets</h5>
        <div className="d-flex align-items-center">
          <div className="position-relative me-2" style={{ width: '300px' }}>
            <CFormInput
              placeholder="Rechercher des projets..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pr-5"
            />
            {searchQuery && (
              <CButton
                color="link"
                className="position-absolute"
                style={{ right: '5px', top: '3px' }}
                onClick={() => setSearchQuery('')}
              >
                <CIcon icon={cilX} size="sm" />
              </CButton>
            )}
          </div>
          {/* All users can create new projects */}
          <CButton color="primary" onClick={() => navigate('/projects/new')}>
            Nouveau projet
          </CButton>
        </div>
      </CCardHeader>
      <CCardBody>
        <CTable hover responsive>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Nom</CTableHeaderCell>
              <CTableHeaderCell>Propriétaire</CTableHeaderCell>
              <CTableHeaderCell>Statut</CTableHeaderCell>
              <CTableHeaderCell>Date de début</CTableHeaderCell>
              <CTableHeaderCell>Date de fin</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredProjects.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan="5" className="text-center">
                  {searchQuery
                    ? 'Aucun projet ne correspond à votre recherche'
                    : 'Aucun projet trouvé'}
                </CTableDataCell>
              </CTableRow>
            ) : (
              filteredProjects.map((project) => (
                <CTableRow key={project._id}>
                  <CTableDataCell>{project.projectName}</CTableDataCell>
                  <CTableDataCell>
                    {project.owner ? project.owner.name || project.owner.email : 'Non défini'}
                  </CTableDataCell>
                  <CTableDataCell>{getStatusBadge(project.status)}</CTableDataCell>
                  <CTableDataCell>
                    {project.startDate
                      ? new Date(project.startDate).toLocaleDateString()
                      : 'Non définie'}
                  </CTableDataCell>
                  <CTableDataCell>
                    {project.endDate
                      ? new Date(project.endDate).toLocaleDateString()
                      : 'Non définie'}
                  </CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      color="info"
                      size="sm"
                      className="me-2"
                      onClick={() => navigate(`/projects/${project._id}`)}
                    >
                      Détails
                    </CButton>
                    {/* Show edit button for all users but disable if not owner */}
                    <CButton
                      color="warning"
                      size="sm"
                      className="me-2"
                      onClick={() => navigate(`/projects/edit/${project._id}`)}
                      disabled={
                        !(project.owner && project.owner._id === localStorage.getItem('userId'))
                      }
                    >
                      Modifier
                    </CButton>
                    {/* Show delete button for all users but disable if not owner */}
                    <CButton
                      color="danger"
                      size="sm"
                      onClick={() => handleDelete(project._id)}
                      disabled={
                        !(project.owner && project.owner._id === localStorage.getItem('userId'))
                      }
                    >
                      Supprimer
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
      </CCardBody>
    </CCard>
  )
}

export default ProjectsList
