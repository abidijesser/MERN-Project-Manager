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
  const [userRole, setUserRole] = useState(localStorage.getItem('userRole') || '')
  const [modalVisible, setModalVisible] = useState(false)
  const [predictionLoading, setPredictionLoading] = useState(false)
  const [predictionResult, setPredictionResult] = useState(null)
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
  }, [searchQuery, projects])

  const fetchProjects = async () => {
    setLoading(true)
    try {
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
        'Budget': parseFloat(predictionData.budget) || 0,
        'Actual Cost': parseFloat(predictionData.actualCost) || 0,
        'Progress': parseFloat(predictionData.progress) || 0,
        'Delay': parseFloat(predictionData.delay) || 0,
        'Budget Deviation': parseFloat(predictionData.budgetDeviation) || 0,
        'Project Type': predictionData.projectType,
        'Priority': predictionData.priority,
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
        prediction: result.estimated_duration
      })
      toast.success(`Prédiction réussie: ${result.estimated_duration} jours`)
    } catch (error) {
      console.error('Erreur lors de la prédiction:', error)
      toast.error('Erreur lors de la prédiction')
    } finally {
      setPredictionLoading(false)
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
                      color="info text-white"
                      size="sm"
                      className="me-2"
                      onClick={() => navigate(`/projects/${project._id}`)}
                    >
                      Détails
                    </CButton>
                    <CButton
                      color="warning"
                      size="sm"
                      className="me-2 text-white"
                      onClick={() => navigate(`/projects/edit/${project._id}`)}
                      disabled={!canEditProject(project)}
                    >
                      Modifier
                    </CButton>
                    <CButton
                      color="danger"
                      size="sm"
                      className="me-2 text-white"
                      onClick={() => handleDelete(project._id)}
                      disabled={!canEditProject(project)}
                    >
                      Supprimer
                    </CButton>

                    <CButton
                      color="success"
                      size="sm"
                      className="me-2 text-white"
                      onClick={() => setModalVisible(true)}
                      disabled={!canEditProject(project)}
                    >
                      Predire
                    </CButton>
                  </CTableDataCell>
                </CTableRow>
              ))
            )}
          </CTableBody>
        </CTable>
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
              onChange={(e) => setPredictionData({ ...predictionData, budgetDeviation: e.target.value })}
            />
            <CFormInput
              label="Project Type"
              value={predictionData.projectType}
              onChange={(e) => setPredictionData({ ...predictionData, projectType: e.target.value })}
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
              onChange={(e) => setPredictionData({ ...predictionData, resourceUsageRatio: e.target.value })}
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