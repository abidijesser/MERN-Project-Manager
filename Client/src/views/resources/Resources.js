import React, { useState, useEffect } from 'react'
import DocumentUpload from './DocumentUpload'
import './Resources.css'
import axios from '../../utils/axios'
import { toast } from 'react-toastify'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CButton,
  CFormSelect,
  CInputGroup,
  CFormInput,
  CDropdown,
  CDropdownToggle,
  CDropdownMenu,
  CDropdownItem,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CSpinner,
  CBadge,
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilSearch,
  cilFilter,
  cilPlus,
  cilCloudUpload,
  cilPencil,
  cilTrash,
  cilOptions,
  cilShareBoxed,
  cilStar,
  cilFile,
  cilNotes,
  cilImage,
  cilMovie,
  cilSpreadsheet,
  cilLink,
  cilCloudDownload,
  cilMagnifyingGlass,
  cilUser,
  cilLockLocked,
  cilLockUnlocked,
} from '@coreui/icons'

const Resources = () => {
  // State for projects (for the project selector)
  const [projects, setProjects] = useState([])
  const [selectedProject, setSelectedProject] = useState('')
  const [loading, setLoading] = useState(true)
  const [documents, setDocuments] = useState([])
  const [activeTab, setActiveTab] = useState(1)
  const [selectedDocument, setSelectedDocument] = useState(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [uploadModalVisible, setUploadModalVisible] = useState(false)

  // Fetch projects and documents from API
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const response = await axios.get('/projects')
        if (response.data.success && response.data.projects) {
          setProjects(response.data.projects.map(project => ({
            id: project._id,
            name: project.projectName
          })))
        } else {
          console.error('Format de réponse inattendu:', response.data)
          toast.error('Erreur lors de la récupération des projets')
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des projets:', error)
        toast.error(error.response?.data?.error || 'Erreur lors de la récupération des projets')
      }
    }

    const fetchDocuments = async () => {
      try {
        const response = await axios.get('/documents')
        if (response.data.success && response.data.data) {
          setDocuments(response.data.data.map(doc => ({
            id: doc._id,
            name: doc.name,
            type: doc.fileType,
            size: formatFileSize(doc.fileSize),
            uploadedBy: doc.uploadedBy?.name || 'Utilisateur inconnu',
            uploadedDate: new Date(doc.uploadedDate).toISOString().split('T')[0],
            project: doc.project?._id || '',
            pinned: doc.pinned,
            permissions: getPermissionLevel(doc),
            filePath: doc.filePath
          })))
        } else {
          console.error('Format de réponse inattendu:', response.data)
          toast.error('Erreur lors de la récupération des documents')
        }
      } catch (error) {
        console.error('Erreur lors de la récupération des documents:', error)
        toast.error(error.response?.data?.error || 'Erreur lors de la récupération des documents')
      } finally {
        setLoading(false)
      }
    }

    fetchProjects()
    fetchDocuments()
  }, [])

  // Format file size in human-readable format
  const formatFileSize = (bytes) => {
    if (bytes === 0) return '0 Bytes'
    const k = 1024
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
    const i = Math.floor(Math.log(bytes) / Math.log(k))
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i]
  }

  // Determine permission level based on document data
  const getPermissionLevel = (doc) => {
    // If user is the uploader, they have edit permissions
    if (doc.uploadedBy?._id === localStorage.getItem('userId')) {
      return 'edit'
    }

    // Check explicit permissions
    if (doc.permissions && doc.permissions.length > 0) {
      const userPermission = doc.permissions.find(p => p.user === localStorage.getItem('userId'))
      if (userPermission) {
        return userPermission.access === 'admin' ? 'edit' : userPermission.access
      }
    }

    // If document is public, default to view permission
    if (doc.isPublic) {
      return 'view'
    }

    return 'view' // Default permission
  }

  // Function to get icon based on file type
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf':
        return cilFile
      case 'excel':
        return cilSpreadsheet
      case 'powerpoint':
        return cilNotes
      case 'image':
        return cilImage
      case 'video':
        return cilMovie
      default:
        return cilFile
    }
  }

  // Filter documents based on search term, selected project, and filter type
  const filteredDocuments = documents.filter((doc) => {
    const matchesSearch = doc.name.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesProject = selectedProject ? doc.project === selectedProject : true
    const matchesType = filterType ? doc.type === filterType : true
    return matchesSearch && matchesProject && matchesType
  })

  // Function to handle document selection
  const handleDocumentSelect = (doc) => {
    setSelectedDocument(doc)
    setActiveTab(2) // Switch to document details tab
  }

  // Function to handle document upload
  const handleUploadSuccess = async (uploadData) => {
    // Refresh the documents list after successful upload
    try {
      const response = await axios.get('/documents')
      if (response.data.success && response.data.data) {
        setDocuments(response.data.data.map(doc => ({
          id: doc._id,
          name: doc.name,
          type: doc.fileType,
          size: formatFileSize(doc.fileSize),
          uploadedBy: doc.uploadedBy?.name || 'Utilisateur inconnu',
          uploadedDate: new Date(doc.uploadedDate).toISOString().split('T')[0],
          project: doc.project?._id || '',
          pinned: doc.pinned,
          permissions: getPermissionLevel(doc),
          filePath: doc.filePath
        })))
        toast.success('Document(s) téléchargé(s) avec succès')
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des documents:', error)
      toast.error('Erreur lors de la mise à jour de la liste des documents')
    }
  }

  // Function to handle document download
  const handleDownload = (doc) => {
    try {
      // Create a link to download the file
      const link = document.createElement('a')
      link.href = `http://localhost:3001/${doc.filePath}`
      link.setAttribute('download', doc.name)
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error('Erreur lors du téléchargement du document:', error)
      toast.error('Erreur lors du téléchargement du document')
    }
  }

  // Function to handle document deletion
  const handleDelete = async (docId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer ce document ?')) {
      return
    }

    try {
      const response = await axios.delete(`/documents/${docId}`)
      if (response.data.success) {
        // Remove the document from the state
        setDocuments(documents.filter(doc => doc.id !== docId))

        // If the deleted document was selected, clear the selection
        if (selectedDocument && selectedDocument.id === docId) {
          setSelectedDocument(null)
          setActiveTab(1)
        }

        toast.success('Document supprimé avec succès')
      } else {
        toast.error('Erreur lors de la suppression du document')
      }
    } catch (error) {
      console.error('Erreur lors de la suppression du document:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la suppression du document')
    }
  }

  // Function to toggle pin status
  const handleTogglePin = async (docId, currentPinned) => {
    try {
      const response = await axios.put(`/documents/${docId}/pin`)
      if (response.data.success) {
        // Update the document in the state
        setDocuments(documents.map(doc =>
          doc.id === docId ? { ...doc, pinned: !currentPinned } : doc
        ))

        // If the document was selected, update the selection
        if (selectedDocument && selectedDocument.id === docId) {
          setSelectedDocument({ ...selectedDocument, pinned: !currentPinned })
        }

        toast.success(currentPinned ? 'Document désépinglé' : 'Document épinglé')
      } else {
        toast.error('Erreur lors de la modification du statut d\'épinglage')
      }
    } catch (error) {
      console.error('Erreur lors de la modification du statut d\'épinglage:', error)
      toast.error(error.response?.data?.error || 'Erreur lors de la modification du statut d\'épinglage')
    }
  }

  return (
    <div className="resources-page">
      <CRow>
        <CCol>
          <h2 className="mb-4">Ressources & Documents</h2>
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol md={4}>
          <CFormSelect
            value={selectedProject}
            onChange={(e) => setSelectedProject(e.target.value)}
            aria-label="Sélectionner un projet"
          >
            <option value="">Tous les projets</option>
            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </CFormSelect>
        </CCol>
        <CCol md={6}>
          <CInputGroup>
            <CFormInput
              placeholder="Rechercher un document..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            <CButton type="button" color="primary" variant="outline">
              <CIcon icon={cilSearch} />
            </CButton>
            <CDropdown variant="btn-group">
              <CDropdownToggle color="primary" variant="outline">
                <CIcon icon={cilFilter} />
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem onClick={() => setFilterType('')}>Tous les types</CDropdownItem>
                <CDropdownItem onClick={() => setFilterType('pdf')}>PDF</CDropdownItem>
                <CDropdownItem onClick={() => setFilterType('excel')}>Excel</CDropdownItem>
                <CDropdownItem onClick={() => setFilterType('powerpoint')}>PowerPoint</CDropdownItem>
                <CDropdownItem onClick={() => setFilterType('image')}>Images</CDropdownItem>
                <CDropdownItem onClick={() => setFilterType('video')}>Vidéos</CDropdownItem>
              </CDropdownMenu>
            </CDropdown>
          </CInputGroup>
        </CCol>
        <CCol md={2} className="d-flex justify-content-end">
          <CButton color="primary" onClick={() => setUploadModalVisible(true)}>
            <CIcon icon={cilPlus} className="me-2" />
            Ajouter un document
          </CButton>
        </CCol>
      </CRow>

      <CCard className="mb-4">
        <CCardHeader>
          <CNav variant="tabs" role="tablist">
            <CNavItem>
              <CNavLink
                active={activeTab === 1}
                onClick={() => setActiveTab(1)}
                role="tab"
                aria-controls="documents-tab"
              >
                Documents
              </CNavLink>
            </CNavItem>
            <CNavItem>
              <CNavLink
                active={activeTab === 2}
                onClick={() => setActiveTab(2)}
                role="tab"
                aria-controls="preview-tab"
                disabled={!selectedDocument}
              >
                Aperçu du document
              </CNavLink>
            </CNavItem>
          </CNav>
        </CCardHeader>
        <CCardBody>
          <CTabContent>
            <CTabPane role="tabpanel" aria-labelledby="documents-tab" visible={activeTab === 1}>
              {loading ? (
                <div className="text-center my-5">
                  <CSpinner color="primary" />
                  <p className="mt-2">Chargement des documents...</p>
                </div>
              ) : (
                <>
                  {filteredDocuments.length === 0 ? (
                    <div className="text-center my-5">
                      <p>Aucun document trouvé.</p>
                    </div>
                  ) : (
                    <div className="documents-list">
                      <CRow className="documents-header mb-2 p-2 bg-light">
                        <CCol xs={6}>Nom</CCol>
                        <CCol xs={2}>Taille</CCol>
                        <CCol xs={2}>Ajouté par</CCol>
                        <CCol xs={2}>Date</CCol>
                      </CRow>
                      {filteredDocuments.map((doc) => (
                        <CRow
                          key={doc.id}
                          className="document-item p-2 mb-2 align-items-center"
                          onClick={() => handleDocumentSelect(doc)}
                        >
                          <CCol xs={6} className="d-flex align-items-center">
                            <div className="document-icon me-2">
                              <CIcon icon={getFileIcon(doc.type)} size="lg" />
                            </div>
                            <div className="document-name">
                              {doc.name}
                              {doc.pinned && (
                                <CTooltip content="Document épinglé">
                                  <CIcon
                                    icon={cilStar}
                                    className="ms-2 text-warning"
                                    style={{ width: '14px', height: '14px' }}
                                  />
                                </CTooltip>
                              )}
                            </div>
                          </CCol>
                          <CCol xs={2}>{doc.size}</CCol>
                          <CCol xs={2}>{doc.uploadedBy}</CCol>
                          <CCol xs={2} className="d-flex justify-content-between align-items-center">
                            {new Date(doc.uploadedDate).toLocaleDateString()}
                            <CDropdown alignment="end">
                              <CDropdownToggle color="transparent" caret={false}>
                                <CIcon icon={cilOptions} />
                              </CDropdownToggle>
                              <CDropdownMenu>
                                <CDropdownItem onClick={() => handleDocumentSelect(doc)}>
                                  <CIcon icon={cilMagnifyingGlass} className="me-2" />
                                  Aperçu
                                </CDropdownItem>
                                <CDropdownItem onClick={() => handleDownload(doc)}>
                                  <CIcon icon={cilCloudDownload} className="me-2" />
                                  Télécharger
                                </CDropdownItem>
                                <CDropdownItem>
                                  <CIcon icon={cilShareBoxed} className="me-2" />
                                  Partager
                                </CDropdownItem>
                                {doc.permissions === 'edit' && (
                                  <>
                                    <CDropdownItem>
                                      <CIcon icon={cilPencil} className="me-2" />
                                      Modifier
                                    </CDropdownItem>
                                    <CDropdownItem onClick={() => handleDelete(doc.id)}>
                                      <CIcon icon={cilTrash} className="me-2" />
                                      Supprimer
                                    </CDropdownItem>
                                  </>
                                )}
                                <CDropdownItem onClick={() => handleTogglePin(doc.id, doc.pinned)}>
                                  <CIcon
                                    icon={cilStar}
                                    className={`me-2 ${doc.pinned ? 'text-warning' : ''}`}
                                  />
                                  {doc.pinned ? 'Désépingler' : 'Épingler'}
                                </CDropdownItem>
                              </CDropdownMenu>
                            </CDropdown>
                          </CCol>
                        </CRow>
                      ))}
                    </div>
                  )}
                </>
              )}
            </CTabPane>
            <CTabPane role="tabpanel" aria-labelledby="preview-tab" visible={activeTab === 2}>
              {selectedDocument && (
                <div className="document-details">
                  <CRow className="mb-4">
                    <CCol xs={12} className="d-flex justify-content-between align-items-center">
                      <h3 className="mb-0">
                        <CIcon icon={getFileIcon(selectedDocument.type)} className="me-2" />
                        {selectedDocument.name}
                      </h3>
                      <div>
                        <CButton
                          color="primary"
                          variant="outline"
                          className="me-2"
                          onClick={() => handleDownload(selectedDocument)}
                        >
                          <CIcon icon={cilCloudDownload} className="me-2" />
                          Télécharger
                        </CButton>
                        <CButton color="primary" variant="outline" className="me-2">
                          <CIcon icon={cilShareBoxed} className="me-2" />
                          Partager
                        </CButton>
                        {selectedDocument.permissions === 'edit' && (
                          <>
                            <CButton color="primary" variant="outline" className="me-2">
                              <CIcon icon={cilPencil} className="me-2" />
                              Modifier
                            </CButton>
                            <CButton
                              color="danger"
                              variant="outline"
                              onClick={() => {
                                handleDelete(selectedDocument.id)
                              }}
                            >
                              <CIcon icon={cilTrash} className="me-2" />
                              Supprimer
                            </CButton>
                          </>
                        )}
                      </div>
                    </CCol>
                  </CRow>

                  <CRow className="mb-4">
                    <CCol md={8}>
                      <CCard>
                        <CCardHeader>Aperçu du document</CCardHeader>
                        <CCardBody className="text-center p-5">
                          <CIcon icon={getFileIcon(selectedDocument.type)} style={{ width: '64px', height: '64px' }} />
                          <p className="mt-3">
                            L'aperçu n'est pas disponible pour ce type de fichier. Veuillez télécharger le document pour
                            le consulter.
                          </p>
                          <CButton
                            color="primary"
                            onClick={() => handleDownload(selectedDocument)}
                          >
                            <CIcon icon={cilCloudDownload} className="me-2" />
                            Télécharger
                          </CButton>
                        </CCardBody>
                      </CCard>
                    </CCol>
                    <CCol md={4}>
                      <CCard className="mb-4">
                        <CCardHeader>Informations</CCardHeader>
                        <CCardBody>
                          <div className="mb-2">
                            <strong>Type:</strong> {selectedDocument.type.toUpperCase()}
                          </div>
                          <div className="mb-2">
                            <strong>Taille:</strong> {selectedDocument.size}
                          </div>
                          <div className="mb-2">
                            <strong>Ajouté par:</strong> {selectedDocument.uploadedBy}
                          </div>
                          <div className="mb-2">
                            <strong>Date d'ajout:</strong>{' '}
                            {new Date(selectedDocument.uploadedDate).toLocaleDateString()}
                          </div>
                          <div className="mb-2">
                            <strong>Projet:</strong>{' '}
                            {projects.find((p) => p.id === selectedDocument.project)?.name || 'Non assigné'}
                          </div>
                          <div className="mb-2">
                            <strong>Permissions:</strong>{' '}
                            <CBadge color={selectedDocument.permissions === 'edit' ? 'success' : 'info'}>
                              <CIcon
                                icon={selectedDocument.permissions === 'edit' ? cilLockUnlocked : cilLockLocked}
                                className="me-1"
                                size="sm"
                              />
                              {selectedDocument.permissions === 'edit' ? 'Modification' : 'Lecture seule'}
                            </CBadge>
                          </div>
                        </CCardBody>
                      </CCard>

                      <CCard>
                        <CCardHeader>Historique des versions</CCardHeader>
                        <CCardBody>
                          <p className="text-muted">Aucune version antérieure disponible.</p>
                        </CCardBody>
                      </CCard>
                    </CCol>
                  </CRow>

                  <CCard>
                    <CCardHeader>Commentaires</CCardHeader>
                    <CCardBody>
                      <p className="text-muted">Aucun commentaire pour le moment.</p>
                      <CInputGroup>
                        <CFormInput placeholder="Ajouter un commentaire..." />
                        <CButton color="primary">Envoyer</CButton>
                      </CInputGroup>
                    </CCardBody>
                  </CCard>
                </div>
              )}
            </CTabPane>
          </CTabContent>
        </CCardBody>
      </CCard>

      {/* Document Upload Modal */}
      <DocumentUpload
        visible={uploadModalVisible}
        onClose={() => setUploadModalVisible(false)}
        onUploadSuccess={handleUploadSuccess}
      />
    </div>
  )
}

export default Resources
