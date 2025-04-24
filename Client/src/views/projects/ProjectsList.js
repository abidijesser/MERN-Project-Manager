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
  CIcon,
} from '@coreui/react'
import { useNavigate } from 'react-router-dom'
import axios from '../../utils/axios'
import { toast } from 'react-toastify'

const ProjectsList = () => {
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
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
    try {
      // Récupération des projets depuis l'API backend
      const response = await axios.get('/projects')
      setProjects(response.data.projects) // Mise à jour de l'état avec les projets
    } catch (error) {
      console.error('Erreur lors de la récupération des projets:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la récupération des projets')
    }
  }

  const handleDelete = async (id) => {
    // Vérifier le rôle de l'utilisateur
    const userRole = localStorage.getItem('userRole')
    console.log('ProjectsList - User role:', userRole)

    // Seuls les administrateurs peuvent supprimer des projets
    if (userRole !== 'Admin') {
      toast.error('Seuls les administrateurs peuvent supprimer des projets')
      return
    }

    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce projet ?')) {
      try {
        await axios.delete(`/projects/${id}`)
        toast.success('Projet supprimé avec succès !')
        fetchProjects()
      } catch (error) {
        console.error('Erreur lors de la suppression du projet:', error)
        toast.error(error.response?.data?.error || 'Erreur lors de la suppression du projet')
      }
    }
  }

  return (
    <CCard>
      <CCardHeader>
        <div className="d-flex justify-content-between align-items-center">
          <strong>Liste des projets</strong>
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
                  <CIcon icon={['cil', 'x']} size="sm" />
                </CButton>
              )}
            </div>
            {localStorage.getItem('userRole') === 'Admin' && (
              <CButton color="primary" onClick={() => navigate('/projects/new')}>
                Nouveau projet
              </CButton>
            )}
          </div>
        </div>
      </CCardHeader>
      <CCardBody>
        <CTable hover>
          <CTableHead>
            <CTableRow>
              <CTableHeaderCell>Nom</CTableHeaderCell>
              <CTableHeaderCell>Statut</CTableHeaderCell>
              <CTableHeaderCell>Actions</CTableHeaderCell>
            </CTableRow>
          </CTableHead>
          <CTableBody>
            {filteredProjects.length === 0 ? (
              <CTableRow>
                <CTableDataCell colSpan="3" className="text-center">
                  {searchQuery
                    ? 'Aucun projet ne correspond à votre recherche'
                    : 'Aucun projet trouvé'}
                </CTableDataCell>
              </CTableRow>
            ) : (
              filteredProjects.map((project) => (
                <CTableRow key={project._id}>
                  <CTableDataCell>{project.projectName}</CTableDataCell>{' '}
                  {/* Utilisation de projectName */}
                  <CTableDataCell>{project.status}</CTableDataCell>
                  <CTableDataCell>
                    <CButton
                      color="info"
                      size="sm"
                      onClick={() => navigate(`/projects/${project._id}`)}
                    >
                      Détails
                    </CButton>
                    {localStorage.getItem('userRole') === 'Admin' && (
                      <>
                        <CButton
                          color="warning"
                          size="sm"
                          className="ms-2"
                          onClick={() => navigate(`/projects/edit/${project._id}`)}
                        >
                          Modifier
                        </CButton>
                        <CButton
                          color="danger"
                          size="sm"
                          className="ms-2"
                          onClick={() => handleDelete(project._id)} // Appel à la fonction de suppression
                        >
                          Supprimer
                        </CButton>
                      </>
                    )}
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
