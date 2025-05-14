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
  CModal,
  CModalHeader,
  CModalTitle,
  CModalBody,
  CModalFooter,
  CSpinner,
  CListGroup,
  CListGroupItem,
  CBadge,
} from '@coreui/react'
import axios from 'axios'
import { useNavigate, useParams } from 'react-router-dom'
import { toast } from 'react-toastify'
import { getRecommendedMembers } from '../../services/recommendationService'

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
  const [projectMembers, setProjectMembers] = useState([])
  const [selectedProject, setSelectedProject] = useState(null)
  const [recommendModalVisible, setRecommendModalVisible] = useState(false)
  const [recommendLoading, setRecommendLoading] = useState(false)
  const [recommendedMembers, setRecommendedMembers] = useState([])
  const [recommendError, setRecommendError] = useState(null)
  const [extractedKeywords, setExtractedKeywords] = useState([])

  const { id } = useParams()
  const navigate = useNavigate()
  const isEditMode = Boolean(id)

  // Fetch project members when a project is selected
  const fetchProjectMembers = async (projectId) => {
    if (!projectId) {
      setProjectMembers([])
      return
    }

    try {
      const token = localStorage.getItem('token')
      if (!token) {
        setError('No authentication token found')
        return
      }

      console.log('Fetching members for project ID:', projectId)

      // First, get the project details to set selectedProject
      const projectResponse = await axios.get(`http://192.168.33.10:3001/api/projects/${projectId}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (projectResponse.data.success && projectResponse.data.project) {
        setSelectedProject(projectResponse.data.project)
      }

      // Now directly fetch the project members using the dedicated endpoint
      const membersResponse = await axios.get(
        `http://192.168.33.10:3001/api/projects/${projectId}/members`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      if (membersResponse.data.success && membersResponse.data.members) {
        console.log('Project members fetched successfully:', membersResponse.data.members)
        setProjectMembers(membersResponse.data.members)
      } else {
        console.log('No members found for project or invalid response')
        setProjectMembers([])
      }
    } catch (error) {
      console.error('Error fetching project members:', error)
      toast.error('Erreur lors de la récupération des membres du projet')
      setProjectMembers([])
    }
  }

  useEffect(() => {
    console.log('TaskForm component mounted or id changed, fetching data...')
    fetchData()
  }, [id])

  // Add a useEffect to log when projectMembers changes
  useEffect(() => {
    console.log('Project members updated:', projectMembers)
  }, [projectMembers])

  const fetchData = async () => {
    try {
      setLoading(true)
      const token = localStorage.getItem('token')
      if (!token) {
        setError('No authentication token found')
        setLoading(false)
        return
      }

      // Vérifier le rôle de l'utilisateur
      const userRole = localStorage.getItem('userRole')
      console.log('TaskForm - User role:', userRole)

      // Récupérer les projets
      const projectsRes = await axios.get('http://192.168.33.10:3001/api/projects', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      // Récupérer tous les utilisateurs pour les assigner aux tâches
      let usersRes = { data: { success: true, users: [] } }

      try {
        // Récupérer tous les utilisateurs
        usersRes = await axios.get('http://192.168.33.10:3001/api/auth/users', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
      } catch (error) {
        console.error('Error fetching users:', error)
        // Si on ne peut pas récupérer tous les utilisateurs, utiliser uniquement l'utilisateur actuel
        try {
          console.log('Falling back to current user only')
          const profileRes = await axios.get('http://192.168.33.10:3001/api/auth/profile', {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          })

          if (profileRes.data && profileRes.data.user) {
            usersRes.data = { success: true, users: [profileRes.data.user] }
          }
        } catch (profileError) {
          console.error('Error fetching profile:', profileError)
        }
      }

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
        const taskRes = await axios.get(`http://192.168.33.10:3001/api/tasks/${id}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })
        if (taskRes.data.success) {
          const taskData = taskRes.data.task
          console.log('Task data fetched:', taskData)

          // Extract project ID correctly, handling both object and string formats
          let projectId = ''
          if (taskData.project) {
            projectId =
              typeof taskData.project === 'object' ? taskData.project._id : taskData.project
          }
          console.log('Project ID extracted:', projectId)

          // Set task data
          setTask({
            ...taskData,
            dueDate: taskData.dueDate ? new Date(taskData.dueDate).toISOString().split('T')[0] : '',
            assignedTo: taskData.assignedTo?._id || '',
            project: projectId,
          })

          // Fetch project members if a project is assigned
          if (projectId) {
            console.log('Fetching project members for project:', projectId)
            await fetchProjectMembers(projectId)
          } else {
            console.log('No project ID found for this task')
          }
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
        ? `http://192.168.33.10:3001/api/tasks/${id}`
        : 'http://192.168.33.10:3001/api/tasks'

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

    // If project field changed, fetch project members
    if (name === 'project') {
      console.log('Project changed to:', value)

      // Reset assignedTo when project changes
      setTask((prev) => ({
        ...prev,
        [name]: value,
        assignedTo: '',
      }))

      // Fetch project members if a project is selected
      if (value) {
        console.log('Fetching members for newly selected project:', value)
        fetchProjectMembers(value)
      } else {
        console.log('No project selected, clearing members')
        setProjectMembers([])
      }
    } else {
      setTask((prev) => ({
        ...prev,
        [name]: value,
      }))
    }
  }

  // Handle recommendation button click
  const handleRecommendMember = async () => {
    try {
      // Validate required fields
      if (!task.title || !task.description) {
        toast.error('Le titre et la description sont requis pour les recommandations')
        return
      }

      if (!task.project) {
        toast.error('Veuillez sélectionner un projet pour obtenir des recommandations')
        return
      }

      setRecommendModalVisible(true)
      setRecommendLoading(true)
      setRecommendError(null)

      // Call the recommendation API
      const result = await getRecommendedMembers(task.title, task.description, task.project)

      if (result.success) {
        setRecommendedMembers(result.recommendations)
        setExtractedKeywords(result.keywords)
        console.log('Recommended members:', result.recommendations)
        console.log('Extracted keywords:', result.keywords)
      } else {
        throw new Error(result.error || 'Erreur lors de la récupération des recommandations')
      }
    } catch (error) {
      console.error('Error getting recommendations:', error)
      setRecommendError(error.message || 'Erreur lors de la récupération des recommandations')
      toast.error(error.message || 'Erreur lors de la récupération des recommandations')
    } finally {
      setRecommendLoading(false)
    }
  }

  // Handle selecting a recommended member
  const handleSelectRecommendedMember = (memberId) => {
    setTask((prev) => ({
      ...prev,
      assignedTo: memberId,
    }))
    setRecommendModalVisible(false)
    toast.success('Membre recommandé sélectionné')
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
              <div className="mb-3">
                <div className="d-flex align-items-center mb-2">
                  <CFormSelect
                    label="Assigné à"
                    name="assignedTo"
                    value={task.assignedTo}
                    onChange={handleChange}
                    disabled={!task.project || projectMembers.length === 0} // Disable if no project selected or no members
                    options={[
                      {
                        label: !task.project
                          ? "Sélectionnez d'abord un projet"
                          : projectMembers.length === 0
                            ? 'Aucun membre disponible pour ce projet'
                            : 'Sélectionner un utilisateur',
                        value: '',
                      },
                      ...projectMembers.map((user) => ({
                        label: user.name,
                        value: user._id,
                      })),
                    ]}
                    className="me-2"
                  />
                  <CButton
                    color="info"
                    onClick={handleRecommendMember}
                    disabled={!task.project || !task.title || !task.description}
                    title={
                      !task.project
                        ? "Sélectionnez d'abord un projet"
                        : !task.title || !task.description
                          ? 'Le titre et la description sont requis pour les recommandations'
                          : 'Recommander un membre basé sur les compétences'
                    }
                  >
                    Recommander
                  </CButton>
                </div>
                {task.project && projectMembers.length === 0 && (
                  <div className="text-danger mt-1 small">
                    Aucun membre disponible pour ce projet. Veuillez ajouter des membres au projet.
                  </div>
                )}
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

      {/* Recommendation Modal */}
      <CModal
        visible={recommendModalVisible}
        onClose={() => setRecommendModalVisible(false)}
        size="lg"
      >
        <CModalHeader>
          <CModalTitle>Recommandation de membres</CModalTitle>
        </CModalHeader>
        <CModalBody>
          {recommendLoading ? (
            <div className="text-center my-4">
              <CSpinner color="primary" />
              <p className="mt-2">Analyse des compétences en cours...</p>
            </div>
          ) : recommendError ? (
            <div className="alert alert-danger">{recommendError}</div>
          ) : (
            <>
              <div className="mb-4">
                <h5>Mots-clés extraits de la tâche:</h5>
                <div className="d-flex flex-wrap gap-2 mt-2">
                  {extractedKeywords.map((keyword, index) => (
                    <CBadge key={index} color="info" shape="rounded-pill" className="px-3 py-2">
                      {keyword}
                    </CBadge>
                  ))}
                </div>
              </div>

              <div className="alert alert-info mb-3">
                <div className="fw-bold">Comment fonctionne la recommandation ?</div>
                <p className="mb-1 small">
                  Le système analyse le titre et la description de la tâche pour extraire des
                  mots-clés, puis les compare avec les compétences des membres du projet.
                </p>
                <p className="mb-0 small">
                  <strong>Note :</strong> Les membres sans compétences définies sont marqués avec un
                  astérisque (*) et reçoivent un score de base.
                </p>
              </div>

              <h5>Membres recommandés:</h5>
              {recommendedMembers.length > 0 ? (
                <CListGroup>
                  {recommendedMembers.map((member) => (
                    <CListGroupItem
                      key={member._id}
                      className="d-flex justify-content-between align-items-center"
                    >
                      <div>
                        <div className="fw-bold">{member.name}</div>
                        <div className="small text-muted">{member.email}</div>
                        <div className="mt-1">
                          {member.skills && member.skills.length > 0 ? (
                            member.skills.map((skill, index) => (
                              <CBadge key={index} color="light" className="me-1 text-dark">
                                {skill}
                              </CBadge>
                            ))
                          ) : (
                            <div className="small text-muted fst-italic">
                              Aucune compétence définie
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="d-flex align-items-center">
                        <CBadge
                          color={
                            member.hasSkills === false
                              ? 'secondary'
                              : member.score > 80
                                ? 'success'
                                : member.score > 50
                                  ? 'warning'
                                  : 'danger'
                          }
                          className="me-3"
                        >
                          {member.score}%{!member.hasSkills && <span className="ms-1">*</span>}
                        </CBadge>
                        <CButton
                          color="primary"
                          size="sm"
                          onClick={() => handleSelectRecommendedMember(member._id)}
                        >
                          Sélectionner
                        </CButton>
                      </div>
                    </CListGroupItem>
                  ))}
                </CListGroup>
              ) : (
                <div className="alert alert-warning">
                  Aucun membre recommandé trouvé. Essayez d'ajouter plus de détails à la description
                  de la tâche ou vérifiez que les membres du projet ont des compétences définies
                  dans leurs profils.
                </div>
              )}
            </>
          )}
        </CModalBody>
        <CModalFooter>
          <CButton color="secondary" onClick={() => setRecommendModalVisible(false)}>
            Fermer
          </CButton>
        </CModalFooter>
      </CModal>
    </CRow>
  )
}

export default TaskForm
