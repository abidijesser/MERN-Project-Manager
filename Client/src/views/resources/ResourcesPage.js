import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CNav,
  CNavItem,
  CNavLink,
  CTabContent,
  CTabPane,
  CButton,
  CListGroup,
  CListGroupItem,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CSpinner,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilSearch, cilLink, cilFile, cilCloudDownload } from '@coreui/icons'
import { toast } from 'react-toastify'

const ResourcesPage = () => {
  const [activeTab, setActiveTab] = useState(1)
  const [loading, setLoading] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [resources, setResources] = useState([
    {
      id: 1,
      title: 'Guide d\'utilisation WebTrack',
      description: 'Documentation complète sur l\'utilisation de la plateforme WebTrack',
      type: 'document',
      url: '#',
      date: '2023-05-15',
    },
    {
      id: 2,
      title: 'Modèles de documents',
      description: 'Collection de modèles pour vos projets',
      type: 'template',
      url: '#',
      date: '2023-06-20',
    },
    {
      id: 3,
      title: 'Tutoriel vidéo - Gestion de projet',
      description: 'Apprenez les bases de la gestion de projet avec WebTrack',
      type: 'video',
      url: 'https://www.youtube.com/watch?v=example',
      date: '2023-07-10',
    },
    {
      id: 4,
      title: 'Bonnes pratiques en gestion de projet',
      description: 'Guide des meilleures pratiques pour gérer efficacement vos projets',
      type: 'document',
      url: '#',
      date: '2023-08-05',
    },
  ])

  // Filtrer les ressources en fonction du terme de recherche
  const filteredResources = resources.filter(
    (resource) =>
      resource.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      resource.description.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  // Simuler le chargement des ressources
  useEffect(() => {
    setLoading(true)
    // Simuler une requête API
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }, [])

  const handleDownload = (resource) => {
    toast.info(`Téléchargement de "${resource.title}" en cours...`)
    // Logique de téléchargement à implémenter
  }

  const getIconForResourceType = (type) => {
    switch (type) {
      case 'document':
        return cilFile
      case 'video':
        return cilLink
      case 'template':
        return cilFile
      default:
        return cilFile
    }
  }

  return (
    <CRow>
      <CCol xs={12}>
        <CCard className="mb-4">
          <CCardHeader className="d-flex justify-content-between align-items-center">
            <h4 className="mb-0">Centre de ressources</h4>
            <CInputGroup className="w-auto">
              <CInputGroupText>
                <CIcon icon={cilSearch} />
              </CInputGroupText>
              <CFormInput
                placeholder="Rechercher des ressources..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </CInputGroup>
          </CCardHeader>
          <CCardBody>
            <CNav variant="tabs" className="mb-4">
              <CNavItem>
                <CNavLink
                  active={activeTab === 1}
                  onClick={() => setActiveTab(1)}
                  style={{ cursor: 'pointer' }}
                >
                  Toutes les ressources
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 2}
                  onClick={() => setActiveTab(2)}
                  style={{ cursor: 'pointer' }}
                >
                  Documents
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 3}
                  onClick={() => setActiveTab(3)}
                  style={{ cursor: 'pointer' }}
                >
                  Modèles
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink
                  active={activeTab === 4}
                  onClick={() => setActiveTab(4)}
                  style={{ cursor: 'pointer' }}
                >
                  Vidéos
                </CNavLink>
              </CNavItem>
            </CNav>

            <CTabContent>
              <CTabPane visible={activeTab === 1}>
                {loading ? (
                  <div className="text-center py-5">
                    <CSpinner color="primary" />
                    <p className="mt-3">Chargement des ressources...</p>
                  </div>
                ) : filteredResources.length === 0 ? (
                  <div className="text-center py-5">
                    <p>Aucune ressource trouvée.</p>
                  </div>
                ) : (
                  <CListGroup>
                    {filteredResources.map((resource) => (
                      <CListGroupItem key={resource.id} className="d-flex justify-content-between align-items-center p-3">
                        <div>
                          <div className="d-flex align-items-center mb-2">
                            <CIcon icon={getIconForResourceType(resource.type)} className="me-2 text-primary" />
                            <h5 className="mb-0">{resource.title}</h5>
                          </div>
                          <p className="text-muted mb-0">{resource.description}</p>
                          <small className="text-muted">Ajouté le: {resource.date}</small>
                        </div>
                        <CButton
                          color="primary"
                          variant="outline"
                          onClick={() => handleDownload(resource)}
                        >
                          <CIcon icon={cilCloudDownload} className="me-2" />
                          Télécharger
                        </CButton>
                      </CListGroupItem>
                    ))}
                  </CListGroup>
                )}
              </CTabPane>
              <CTabPane visible={activeTab === 2}>
                {loading ? (
                  <div className="text-center py-5">
                    <CSpinner color="primary" />
                    <p className="mt-3">Chargement des documents...</p>
                  </div>
                ) : (
                  <CListGroup>
                    {filteredResources
                      .filter((resource) => resource.type === 'document')
                      .map((resource) => (
                        <CListGroupItem key={resource.id} className="d-flex justify-content-between align-items-center p-3">
                          <div>
                            <div className="d-flex align-items-center mb-2">
                              <CIcon icon={cilFile} className="me-2 text-primary" />
                              <h5 className="mb-0">{resource.title}</h5>
                            </div>
                            <p className="text-muted mb-0">{resource.description}</p>
                            <small className="text-muted">Ajouté le: {resource.date}</small>
                          </div>
                          <CButton
                            color="primary"
                            variant="outline"
                            onClick={() => handleDownload(resource)}
                          >
                            <CIcon icon={cilCloudDownload} className="me-2" />
                            Télécharger
                          </CButton>
                        </CListGroupItem>
                      ))}
                  </CListGroup>
                )}
              </CTabPane>
              <CTabPane visible={activeTab === 3}>
                {loading ? (
                  <div className="text-center py-5">
                    <CSpinner color="primary" />
                    <p className="mt-3">Chargement des modèles...</p>
                  </div>
                ) : (
                  <CListGroup>
                    {filteredResources
                      .filter((resource) => resource.type === 'template')
                      .map((resource) => (
                        <CListGroupItem key={resource.id} className="d-flex justify-content-between align-items-center p-3">
                          <div>
                            <div className="d-flex align-items-center mb-2">
                              <CIcon icon={cilFile} className="me-2 text-primary" />
                              <h5 className="mb-0">{resource.title}</h5>
                            </div>
                            <p className="text-muted mb-0">{resource.description}</p>
                            <small className="text-muted">Ajouté le: {resource.date}</small>
                          </div>
                          <CButton
                            color="primary"
                            variant="outline"
                            onClick={() => handleDownload(resource)}
                          >
                            <CIcon icon={cilCloudDownload} className="me-2" />
                            Télécharger
                          </CButton>
                        </CListGroupItem>
                      ))}
                  </CListGroup>
                )}
              </CTabPane>
              <CTabPane visible={activeTab === 4}>
                {loading ? (
                  <div className="text-center py-5">
                    <CSpinner color="primary" />
                    <p className="mt-3">Chargement des vidéos...</p>
                  </div>
                ) : (
                  <CListGroup>
                    {filteredResources
                      .filter((resource) => resource.type === 'video')
                      .map((resource) => (
                        <CListGroupItem key={resource.id} className="d-flex justify-content-between align-items-center p-3">
                          <div>
                            <div className="d-flex align-items-center mb-2">
                              <CIcon icon={cilLink} className="me-2 text-primary" />
                              <h5 className="mb-0">{resource.title}</h5>
                            </div>
                            <p className="text-muted mb-0">{resource.description}</p>
                            <small className="text-muted">Ajouté le: {resource.date}</small>
                          </div>
                          <CButton
                            color="primary"
                            variant="outline"
                            href={resource.url}
                            target="_blank"
                          >
                            <CIcon icon={cilLink} className="me-2" />
                            Voir la vidéo
                          </CButton>
                        </CListGroupItem>
                      ))}
                  </CListGroup>
                )}
              </CTabPane>
            </CTabContent>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default ResourcesPage
