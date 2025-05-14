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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CPagination,
  CPaginationItem,
  CTooltip,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilX, cilCalendar, cilOptions, cilPencil, cilTrash, cilChart } from '@coreui/icons'
import { useNavigate } from 'react-router-dom'
import axios from '../../utils/axios'
import { toast } from 'react-toastify'
import {
  syncProjectWithGoogleCalendar,
  checkGoogleCalendarAuth,
  getGoogleCalendarAuthUrl,
} from '../../services/calendarService'
import '../../styles/ActionDropdown.css'

const ProjectsList = () => {
  const [projects, setProjects] = useState([])
  const [filteredProjects, setFilteredProjects] = useState([])
  const [searchQuery, setSearchQuery] = useState('')
  const [loading, setLoading] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const [itemsPerPage] = useState(10)
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '')
  const [modalVisible, setModalVisible] = useState(false)
  const [predictionLoading, setPredictionLoading] = useState(false)
  const [predictionResult, setPredictionResult] = useState(null)
  const [syncingCalendar, setSyncingCalendar] = useState(false)
  const [syncingProjectId, setSyncingProjectId] = useState(null)
  const [checkingOverdue, setCheckingOverdue] = useState(false)
  const [predictionData, setPredictionData] = useState({
    budget: '',
    actualCost: '',
    progress: '',
    delay: '',
    budgetDeviation: '',
    projectType: '',
    priority: '',
    taskStatus: '',
    resourceUsageRatio: '',
  })
  const navigate = useNavigate()

  useEffect(() => {
    fetchProjects()
  }, [])

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
    // Reset to first page when search query changes
    setCurrentPage(1)
  }, [searchQuery, projects])

  // Get current projects for pagination
  const indexOfLastProject = currentPage * itemsPerPage
  const indexOfFirstProject = indexOfLastProject - itemsPerPage
  const currentProjects = filteredProjects.slice(indexOfFirstProject, indexOfLastProject)

  // Change page
  const handlePageChange = (pageNumber) => {
    setCurrentPage(pageNumber)
  }

  const fetchProjects = async () => {
    setLoading(true)
    try {
      // Récupération des projets depuis l'API backend
      const response = await axios.get('/projects')

      if (response.data.success && response.data.projects) {
        console.log(`Fetched ${response.data.projects.length} projects where user is a member`)
        setProjects(response.data.projects)
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
      'En retard': 'danger',
    }
    return <CBadge color={statusColors[status] || 'info'}>{status}</CBadge>
  }

  const canEditProject = (project) => {
    const userId = localStorage.getItem('userId')
    return userRole === 'Admin' || (project.owner && project.owner._id === userId)
  }

  const handlePredictionSubmit = async () => {
    setPredictionLoading(true)
    try {
      // Prepare the data with the exact field names expected by the API
      const dataToSend = {
        Budget: parseFloat(predictionData.budget) || 0,
        'Actual Cost': parseFloat(predictionData.actualCost) || 0,
        Progress: parseFloat(predictionData.progress) || 0,
        Delay: parseFloat(predictionData.delay) || 0,
        'Budget Deviation': parseFloat(predictionData.budgetDeviation) || 0,
        'Project Type': predictionData.projectType,
        Priority: predictionData.priority,
        'Task Status': predictionData.taskStatus,
        'Resource Usage Ratio': parseFloat(predictionData.resourceUsageRatio) || 0,
      }

      // Send the data to the prediction API
      const response = await fetch('http://127.0.0.1:5000/predict-duration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(dataToSend),
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      setPredictionResult({
        prediction: result.estimated_duration,
      })
      toast.success(`Prédiction réussie: ${result.estimated_duration} jours`)
    } catch (error) {
      console.error('Erreur lors de la prédiction:', error)
      toast.error('Erreur lors de la prédiction')
    } finally {
      setPredictionLoading(false)
    }
  }

  // Function to manually check for overdue projects
  const handleCheckOverdueProjects = async () => {
    try {
      setCheckingOverdue(true)
      const response = await axios.post('/projects/check-overdue')

      if (response.data.success) {
        // Display a more informative toast message
        if (response.data.totalOverdueCount > 0) {
          toast.success(
            <div>
              <strong>{response.data.message}</strong>
              <div>
                {response.data.updatedCount === 0
                  ? 'Aucun nouveau projet en retard détecté.'
                  : `${response.data.updatedCount} projets mis à jour.`}
              </div>
              <div>Total: {response.data.totalOverdueCount} projets en retard.</div>
            </div>,
          )
        } else {
          toast.success('Aucun projet en retard détecté.')
        }

        // Refresh the projects list to show updated statuses
        fetchProjects()
      } else {
        throw new Error(response.data.error || 'Failed to check for overdue projects')
      }
    } catch (error) {
      console.error('Error checking for overdue projects:', error)
      toast.error(error.message || 'Erreur lors de la vérification des projets en retard')
    } finally {
      setCheckingOverdue(false)
    }
  }

  // Function to handle syncing a project with Google Calendar
  const handleSyncWithGoogleCalendar = async (projectId) => {
    try {
      setSyncingCalendar(true)
      setSyncingProjectId(projectId)

      // Check if user is authenticated with Google Calendar
      const authCheckResult = await checkGoogleCalendarAuth()

      if (!authCheckResult.isAuthenticated) {
        // Get auth URL and redirect user to authenticate
        const authUrlResult = await getGoogleCalendarAuthUrl()
        if (authUrlResult.success && authUrlResult.authUrl) {
          // Store the current URL to redirect back after authentication
          localStorage.setItem('calendarRedirectUrl', window.location.href)
          window.location.href = authUrlResult.authUrl
          return
        } else {
          throw new Error('Failed to get Google Calendar authentication URL')
        }
      }

      // User is authenticated, sync the project
      const result = await syncProjectWithGoogleCalendar(projectId)

      if (result.success) {
        toast.success('Projet synchronisé avec Google Calendar avec succès!')
      } else {
        throw new Error(result.error || 'Failed to sync project with Google Calendar')
      }
    } catch (error) {
      console.error('Error syncing project with Google Calendar:', error)
      toast.error(error.message || 'Erreur lors de la synchronisation avec Google Calendar')
    } finally {
      setSyncingCalendar(false)
      setSyncingProjectId(null)
    }
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
          <CButton
            color="warning"
            className="me-2"
            onClick={handleCheckOverdueProjects}
            disabled={checkingOverdue}
          >
            {checkingOverdue ? (
              <>
                <CSpinner size="sm" className="me-1" />
                Vérification...
              </>
            ) : (
              'Vérifier projets en retard'
            )}
          </CButton>
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
                <CTableDataCell colSpan="6" className="text-center">
                  {searchQuery
                    ? 'Aucun projet ne correspond à votre recherche'
                    : 'Aucun projet trouvé'}
                </CTableDataCell>
              </CTableRow>
            ) : (
              currentProjects.map((project) => (
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
                    <CDropdown alignment="end" className="action-dropdown">
                      <CDropdownToggle color="light" size="sm" caret={false}>
                        <CIcon icon={cilOptions} size="lg" />
                      </CDropdownToggle>
                      <CDropdownMenu className="action-dropdown-menu">
                        <CDropdownItem onClick={() => navigate(`/projects/${project._id}`)}>
                          <CIcon icon={cilPencil} className="me-2 text-info" />
                          Détails
                        </CDropdownItem>

                        <CDropdownItem
                          onClick={() => navigate(`/projects/edit/${project._id}`)}
                          disabled={!canEditProject(project)}
                        >
                          <CIcon icon={cilPencil} className="me-2 text-warning" />
                          Modifier
                        </CDropdownItem>

                        <CDropdownItem
                          onClick={() => handleDelete(project._id)}
                          disabled={!canEditProject(project)}
                        >
                          <CIcon icon={cilTrash} className="me-2 text-danger" />
                          Supprimer
                        </CDropdownItem>

                        <CDropdownItem
                          onClick={() => setModalVisible(true)}
                          disabled={!canEditProject(project)}
                        >
                          <CIcon icon={cilChart} className="me-2 text-success" />
                          Prédire
                        </CDropdownItem>

                        {/* Google Calendar sync option - only for project owners */}
                        <CDropdownItem
                          onClick={() => handleSyncWithGoogleCalendar(project._id)}
                          disabled={
                            (syncingCalendar && syncingProjectId === project._id) ||
                            !canEditProject(project)
                          }
                          title={
                            !canEditProject(project)
                              ? 'Seul le propriétaire du projet peut ajouter ce projet à Google Calendar'
                              : 'Ajouter ce projet à Google Calendar'
                          }
                        >
                          {syncingCalendar && syncingProjectId === project._id ? (
                            <>
                              <CSpinner size="sm" className="me-2" />
                              Synchronisation...
                            </>
                          ) : (
                            <>
                              <CIcon icon={cilCalendar} className="me-2 text-primary" />
                              Ajouter à Google Calendar
                            </>
                          )}
                        </CDropdownItem>
                      </CDropdownMenu>
                    </CDropdown>
                  </CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>

        {/* Pagination */}
        {filteredProjects.length > itemsPerPage && (
          <CPagination className="mt-4 justify-content-center" aria-label="Pagination des projets">
            <CPaginationItem
              aria-label="Précédent"
              disabled={currentPage === 1}
              onClick={() => handlePageChange(currentPage - 1)}
            >
              <span aria-hidden="true">&laquo;</span>
            </CPaginationItem>

            {[...Array(Math.ceil(filteredProjects.length / itemsPerPage)).keys()].map((number) => (
              <CPaginationItem
                key={number + 1}
                active={currentPage === number + 1}
                onClick={() => handlePageChange(number + 1)}
              >
                {number + 1}
              </CPaginationItem>
            ))}

            <CPaginationItem
              aria-label="Suivant"
              disabled={currentPage === Math.ceil(filteredProjects.length / itemsPerPage)}
              onClick={() => handlePageChange(currentPage + 1)}
            >
              <span aria-hidden="true">&raquo;</span>
            </CPaginationItem>
          </CPagination>
        )}
      </CCardBody>

      {/* Modal for Prediction */}
      <CModal visible={modalVisible} onClose={() => setModalVisible(false)}>
        <CModalHeader>
          <CModalTitle>Prédiction de Projet</CModalTitle>
        </CModalHeader>
        <CModalBody>
          <form>
            <CFormInput
              type="number"
              label="Budget"
              value={predictionData.budget}
              onChange={(e) => setPredictionData({ ...predictionData, budget: e.target.value })}
            />
            <CFormInput
              type="number"
              label="Actual Cost"
              value={predictionData.actualCost}
              onChange={(e) => setPredictionData({ ...predictionData, actualCost: e.target.value })}
            />
            <CFormInput
              type="number"
              label="Progress"
              value={predictionData.progress}
              onChange={(e) => setPredictionData({ ...predictionData, progress: e.target.value })}
            />
            <CFormInput
              type="number"
              label="Delay"
              value={predictionData.delay}
              onChange={(e) => setPredictionData({ ...predictionData, delay: e.target.value })}
            />
            <CFormInput
              type="number"
              label="Budget Deviation"
              value={predictionData.budgetDeviation}
              onChange={(e) =>
                setPredictionData({ ...predictionData, budgetDeviation: e.target.value })
              }
            />
            <CFormInput
              label="Project Type"
              value={predictionData.projectType}
              onChange={(e) =>
                setPredictionData({ ...predictionData, projectType: e.target.value })
              }
            />
            <CFormInput
              label="Priority"
              value={predictionData.priority}
              onChange={(e) => setPredictionData({ ...predictionData, priority: e.target.value })}
            />
            <CFormInput
              label="Task Status"
              value={predictionData.taskStatus}
              onChange={(e) => setPredictionData({ ...predictionData, taskStatus: e.target.value })}
            />
            <CFormInput
              type="number"
              label="Resource Usage Ratio"
              value={predictionData.resourceUsageRatio}
              onChange={(e) =>
                setPredictionData({ ...predictionData, resourceUsageRatio: e.target.value })
              }
            />
          </form>
          {predictionResult && (
            <div className="mt-3 p-3 bg-light rounded">
              <h5>Résultat de la prédiction:</h5>
              <p>Durée estimée: {predictionResult.prediction} jours</p>
            </div>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setModalVisible(false)}>
            Annuler
          </CButton>
          <CButton color="primary" onClick={handlePredictionSubmit} disabled={predictionLoading}>
            {predictionLoading ? <CSpinner size="sm" /> : 'Prédire'}
          </CButton>
        </CModalFooter>
      </CModal>
    </CCard>
  )
}

export default ProjectsList
