// filepath: c:\Users\Lenovo\Desktop\pi1\MERN-Project-Manager\Client\src\views\dashboard\Dashboard.js
import React, { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'

import {
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CBadge,
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilCloudDownload,
  cilPeople,
  cilChart,
  cilSpeedometer,
  cilNotes,
  cilTask,
  cilCalendar,
  cilFolder,
  cilArrowRight,
  cilPencil,
  cilUserFollow,
  cilInfo,
} from '@coreui/icons'

import projectManagementImage from 'src/assets/images/gestion_projet.png'

import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'
import RecentActivityWidget from '../../components/ActivityLog/RecentActivityWidget'
import UpcomingEvents from '../../components/UpcomingEvents/UpcomingEvents'
import socketService from '../../services/socketService'
import { getProjectsForDashboard } from '../../services/dashboardService'
import './Dashboard.css'

const Dashboard = () => {
  const [dashboardProjects, setDashboardProjects] = useState([])
  const [loading, setLoading] = useState(true)

  // Fonction pour récupérer les projets pour le tableau de bord
  const fetchDashboardProjects = async () => {
    try {
      setLoading(true)
      // Récupérer 3 projets aléatoirement (la sélection aléatoire est faite dans le service)
      const projects = await getProjectsForDashboard(3)
      console.log('Dashboard projects received randomly:', projects)

      // Log task counts for each project
      projects.forEach((project) => {
        console.log(
          `Dashboard - Project ${project.title}: ${project.completedTasks}/${project.tasks} tasks`,
        )
      })

      setDashboardProjects(projects)
    } catch (error) {
      console.error('Erreur lors de la récupération des projets pour le tableau de bord:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    // Connect to socket for real-time updates
    socketService.connect()

    // Récupérer les projets pour le tableau de bord
    fetchDashboardProjects()

    return () => {
      // Clean up socket connection when component unmounts
      socketService.disconnect()
    }
  }, [])

  return (
    <>
      {/* Section Héro */}
      <section className="hero-section text-center py-5 bg-primary text-white">
        <div className="container">
          <h1 className="display-4 fw-bold">
            Optimisez vos projets, anticipez les risques, réussissez en toute sérénité !
          </h1>
          <p className="lead mt-3">
            Notre plateforme utilise l’IA pour vous aider à gérer vos projets de manière efficace,
            en identifiant les risques et en optimisant vos ressources.
          </p>
          <div className="d-flex justify-content-center gap-3 mt-4">
            <CButton color="light" size="lg" href="/signup" className="fw-bold">
              Commencer gratuitement
            </CButton>
            <CButton color="secondary" size="lg" href="/demo" className="fw-bold">
              Voir une démo
            </CButton>
          </div>
          <img
            src={projectManagementImage}
            alt="Illustration de gestion de projet"
            className="img-fluid mt-5 rounded shadow"
            style={{ maxWidth: '80%' }}
          />
        </div>
      </section>

      {/* Présentation des Fonctionnalités Clés */}
      <section className="features-section py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5 fw-bold">Fonctionnalités Clés</h2>
          <CRow className="text-center">
            {[
              {
                icon: '📌',
                title: 'Planification intelligente',
                description: 'Gantt, Kanban, Sprints',
              },
              { icon: '📌', title: 'Suivi des tâches et jalons', description: '' },
              { icon: '📌', title: 'Prédiction des délais grâce à l’IA', description: '' },
              { icon: '📌', title: 'Optimisation des ressources', description: '' },
              {
                icon: '📌',
                title: 'Collaboration en équipe',
                description: 'Messagerie, documents partagés',
              },
            ].map((feature, index) => (
              <CCol key={index} md={4} className="mb-4">
                <div className="feature-icon display-4 text-primary">{feature.icon}</div>
                <h5 className="mt-3 fw-bold">{feature.title}</h5>
                <p className="text-muted">{feature.description}</p>
                <CButton color="link" href="/features" className="text-primary fw-bold">
                  En savoir plus
                </CButton>
              </CCol>
            ))}
          </CRow>
        </div>
      </section>

      {/* Témoignages & Avis Clients */}
      <section className="testimonials-section py-5">
        <div className="container">
          <h2 className="text-center mb-5 fw-bold">Témoignages & Avis Clients</h2>
          <CRow>
            {[
              {
                name: 'Alice Dupont',
                company: 'Entreprise A',
                feedback: 'Une plateforme révolutionnaire !',
              },
              {
                name: 'Jean Martin',
                company: 'Entreprise B',
                feedback: 'Gestion simplifiée et efficace.',
              },
            ].map((testimonial, index) => (
              <CCol key={index} md={6} className="mb-4">
                <blockquote className="blockquote p-4 bg-light rounded shadow">
                  <p className="mb-3">{testimonial.feedback}</p>
                  <footer className="blockquote-footer">
                    {testimonial.name}, <cite>{testimonial.company}</cite>
                  </footer>
                </blockquote>
              </CCol>
            ))}
          </CRow>
        </div>
      </section>

      {/* Section "Comment ça marche ?" */}
      <section className="how-it-works-section py-5 bg-light">
        <div className="container">
          <h2 className="text-center mb-5 fw-bold">Comment ça marche ?</h2>
          <CRow className="text-center">
            {[
              { step: '1', title: 'Créez votre projet', icon: '📋' },
              { step: '2', title: 'Ajoutez vos équipes et tâches', icon: '👥' },
              { step: '3', title: 'Suivez les performances et optimisez', icon: '📊' },
            ].map((step, index) => (
              <CCol key={index} md={4} className="mb-4">
                <div className="step-icon display-4 text-primary">{step.icon}</div>
                <h5 className="mt-3 fw-bold">{step.title}</h5>
              </CCol>
            ))}
          </CRow>
        </div>
      </section>

      {/* Section Tarification */}
      <section className="pricing-section py-5">
        <div className="container">
          <h2 className="text-center mb-5 fw-bold">Tarification</h2>
          <CRow className="text-center">
            {[
              { plan: 'Gratuit', price: '0€', features: ['Fonctionnalités de base'] },
              { plan: 'Standard', price: '10€/mois', features: ['Fonctionnalités avancées'] },
              { plan: 'Premium', price: '20€/mois', features: ['Toutes les fonctionnalités'] },
            ].map((pricing, index) => (
              <CCol key={index} md={4} className="mb-4">
                <div className="bg-light p-4 rounded shadow">
                  <h5 className="fw-bold">{pricing.plan}</h5>
                  <p className="display-4 fw-bold text-primary">{pricing.price}</p>
                  <ul className="list-unstyled text-muted">
                    {pricing.features.map((feature, i) => (
                      <li key={i}>{feature}</li>
                    ))}
                  </ul>
                  <CButton color="primary" href="/pricing" className="fw-bold">
                    Choisir
                  </CButton>
                </div>
              </CCol>
            ))}
          </CRow>
        </div>
      </section>

      {/* Dashboard Widgets */}
      <WidgetsDropdown className="mb-4" />

      <CRow className="mb-4">
        <CCol md={8}>
          <CCard className="mb-4 dashboard-card">
            <CCardHeader className="dashboard-card-header">
              <h4 className="mb-0">
                <CIcon icon={cilChart} className="me-2" />
                Activité du projet
              </h4>
            </CCardHeader>
            <CCardBody>
              <MainChart />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={4}>
          <RecentActivityWidget limit={8} />
        </CCol>
      </CRow>

      {/* Section Projets */}
      <section style={{ padding: '2rem 0' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            paddingBottom: '0.75rem',
            borderBottom: '2px solid #ebedef',
          }}
        >
          <h2
            style={{
              fontSize: '1.75rem',
              fontWeight: '600',
              color: '#3c4b64',
              margin: 0,
            }}
          >
            <CIcon icon={cilFolder} style={{ marginRight: '10px', color: '#321fdb' }} />
            Vos projets en cours
          </h2>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button
              onClick={fetchDashboardProjects}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 12px',
                backgroundColor: '#321fdb',
                color: 'white',
                borderRadius: '4px',
                border: 'none',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '0.875rem',
                cursor: 'pointer',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#2a1ab9'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#321fdb'
              }}
            >
              Actualiser aléatoirement
            </button>
            <Link
              to="/projects"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '6px 12px',
                backgroundColor: '#ebedef',
                color: '#3c4b64',
                borderRadius: '4px',
                textDecoration: 'none',
                fontWeight: '500',
                fontSize: '0.875rem',
                transition: 'all 0.2s ease',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#d8dbe0'
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#ebedef'
              }}
            >
              Tous les projets
              <CIcon icon={cilArrowRight} style={{ marginLeft: '6px' }} size="sm" />
            </Link>
          </div>
        </div>
        <CRow className="mb-4">
          <CCol md={12}>
            <CCard className="dashboard-card">
              <CCardHeader className="dashboard-card-header d-flex justify-content-between align-items-center">
                <h4 className="mb-0">
                  <CIcon icon={cilTask} className="me-2 text-primary" />
                  Aperçu des projets
                </h4>
                <Link to="/projects" className="btn btn-sm btn-outline-primary">
                  Tous les projets <CIcon icon={cilArrowRight} size="sm" />
                </Link>
              </CCardHeader>
              <CCardBody>
                <CRow>
                  {loading ? (
                    <CCol xs={12} className="text-center py-5">
                      <div
                        className="spinner-grow text-primary mb-3"
                        style={{ width: '3rem', height: '3rem' }}
                        role="status"
                      >
                        <span className="visually-hidden">Chargement...</span>
                      </div>
                      <p className="text-muted">Chargement des projets en cours...</p>
                    </CCol>
                  ) : dashboardProjects.length === 0 ? (
                    <CCol xs={12} className="text-center py-5">
                      <div className="empty-state mb-3">
                        <CIcon
                          icon={cilFolder}
                          style={{ width: '4rem', height: '4rem', opacity: '0.5' }}
                        />
                      </div>
                      <h5 className="text-muted mb-3">Aucun projet à afficher</h5>
                      <p className="text-muted mb-4">
                        Commencez par créer votre premier projet pour le voir apparaître ici.
                      </p>
                      <Link to="/projects/create" className="btn btn-primary">
                        <CIcon icon={cilTask} className="me-2" />
                        Créer un nouveau projet
                      </Link>
                    </CCol>
                  ) : (
                    dashboardProjects.map((project, index) => (
                      <CCol
                        xs={12}
                        sm={6}
                        lg={4}
                        key={index}
                        className="mb-4"
                        onMouseEnter={(e) => {
                          e.currentTarget.querySelector('div').style.transform = 'translateY(-5px)'
                          e.currentTarget.querySelector('div').style.boxShadow =
                            '0 10px 20px rgba(0, 0, 0, 0.15)'
                          e.currentTarget.querySelector('div').style.borderColor = '#1b8eb7'
                        }}
                        onMouseLeave={(e) => {
                          e.currentTarget.querySelector('div').style.transform = 'translateY(0)'
                          e.currentTarget.querySelector('div').style.boxShadow =
                            '0 4px 12px rgba(0, 0, 0, 0.1)'
                          e.currentTarget.querySelector('div').style.borderColor = '#dee2e6'
                        }}
                      >
                        <div
                          style={{
                            padding: '1.5rem',
                            borderRadius: '8px',
                            height: '100%',
                            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
                            transition: 'all 0.3s ease',
                            border: '1px solid #dee2e6',
                            backgroundColor: 'white',
                          }}
                        >
                          <div className="d-flex justify-content-between align-items-center mb-3">
                            <h5
                              className="mb-0 text-truncate"
                              title={project.title}
                              style={{ maxWidth: '70%' }}
                            >
                              <CIcon icon={cilFolder} className="text-primary me-2" />
                              {project.title}
                            </h5>
                            <CBadge
                              color={project.statusColor}
                              shape="rounded-pill"
                              style={{
                                padding: '0.5rem 1rem',
                                fontSize: '0.8rem',
                                fontWeight: '500',
                                letterSpacing: '0.3px',
                                boxShadow: '0 2px 5px rgba(0, 0, 0, 0.1)',
                              }}
                            >
                              {project.status}
                            </CBadge>
                          </div>
                          <div className="mb-4">
                            <div className="d-flex justify-content-between mb-1 align-items-center">
                              <span
                                style={{ fontWeight: '600', fontSize: '0.95rem', color: '#3c4b64' }}
                              >
                                Progression
                              </span>
                            </div>
                            <div
                              style={{
                                position: 'relative',
                                marginTop: '10px',
                                marginBottom: '15px',
                              }}
                            >
                              <CProgress
                                value={project.progress}
                                color={
                                  project.progress > 75
                                    ? 'success'
                                    : project.progress > 40
                                      ? 'primary'
                                      : 'warning'
                                }
                                height={12}
                                style={{
                                  borderRadius: '6px',
                                  boxShadow: 'inset 0 1px 3px rgba(0, 0, 0, 0.1)',
                                }}
                              />
                              <div
                                style={{
                                  position: 'absolute',
                                  top: '-10px',
                                  right: '0',
                                  backgroundColor:
                                    project.progress > 75
                                      ? '#2eb85c'
                                      : project.progress > 40
                                        ? '#321fdb'
                                        : '#f9b115',
                                  color: 'white',
                                  padding: '2px 8px',
                                  borderRadius: '10px',
                                  fontSize: '0.75rem',
                                  fontWeight: 'bold',
                                  boxShadow: '0 2px 4px rgba(0, 0, 0, 0.1)',
                                }}
                              >
                                {project.progress}%
                              </div>
                            </div>
                            <div
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                marginTop: '20px',
                                padding: '10px',
                                backgroundColor: '#f8f9fa',
                                borderRadius: '6px',
                                border: '1px solid #ebedef',
                              }}
                            >
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div
                                  style={{
                                    backgroundColor: '#e6f7ff',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '8px',
                                  }}
                                >
                                  <CIcon icon={cilTask} style={{ color: '#1890ff' }} size="sm" />
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: '#8a93a2' }}>
                                    Tâches
                                  </div>
                                  <div style={{ fontWeight: 'bold', color: '#3c4b64' }}>
                                    {project.completedTasks !== undefined
                                      ? project.completedTasks
                                      : 0}
                                    /{project.tasks !== undefined ? project.tasks : 0}
                                  </div>
                                </div>
                              </div>
                              <div style={{ display: 'flex', alignItems: 'center' }}>
                                <div
                                  style={{
                                    backgroundColor: '#fff7e6',
                                    borderRadius: '50%',
                                    width: '32px',
                                    height: '32px',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    marginRight: '8px',
                                  }}
                                >
                                  <CIcon
                                    icon={cilCalendar}
                                    style={{ color: '#fa8c16' }}
                                    size="sm"
                                  />
                                </div>
                                <div>
                                  <div style={{ fontSize: '0.75rem', color: '#8a93a2' }}>
                                    Échéance
                                  </div>
                                  <div style={{ fontWeight: 'bold', color: '#3c4b64' }}>
                                    {project.dueDate}
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          <div
                            style={{
                              textAlign: 'center',
                              marginTop: '20px',
                              borderTop: '1px solid #ebedef',
                              paddingTop: '15px',
                            }}
                          >
                            <Link
                              to={`/projects/${project.id}`}
                              style={{
                                display: 'inline-block',
                                padding: '8px 16px',
                                backgroundColor: '#321fdb',
                                color: 'white',
                                borderRadius: '4px',
                                textDecoration: 'none',
                                fontWeight: '500',
                                boxShadow: '0 2px 6px rgba(50, 31, 219, 0.3)',
                                transition: 'all 0.2s ease',
                              }}
                              onMouseEnter={(e) => {
                                e.currentTarget.style.backgroundColor = '#2a1ab9'
                                e.currentTarget.style.boxShadow = '0 4px 8px rgba(50, 31, 219, 0.4)'
                              }}
                              onMouseLeave={(e) => {
                                e.currentTarget.style.backgroundColor = '#321fdb'
                                e.currentTarget.style.boxShadow = '0 2px 6px rgba(50, 31, 219, 0.3)'
                              }}
                            >
                              <CIcon
                                icon={cilArrowRight}
                                style={{ marginRight: '6px' }}
                                size="sm"
                              />
                              Voir détails du projet
                            </Link>
                          </div>
                        </div>
                      </CCol>
                    ))
                  )}
                </CRow>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </section>

      {/* Section Activités, Événements et Équipe */}
      <section style={{ padding: '1rem 0' }}>
        <div
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1.5rem',
            paddingBottom: '0.75rem',
            borderBottom: '2px solid #ebedef',
          }}
        >
          <h2
            style={{
              fontSize: '1.75rem',
              fontWeight: '600',
              color: '#3c4b64',
              margin: 0,
            }}
          >
            <CIcon icon={cilPeople} style={{ marginRight: '10px', color: '#321fdb' }} />
            Activités, Événements et Équipe
          </h2>
        </div>

        <CRow className="mb-4">
          {/* Activités récentes */}
          <CCol md={4}>
            <CCard className="dashboard-card h-100 shadow-sm">
              <CCardHeader className="dashboard-card-header d-flex justify-content-between align-items-center">
                <h4 className="mb-0 fs-5">
                  <CIcon icon={cilNotes} className="me-2 text-primary" />
                  Activités récentes
                </h4>
                <CTooltip content="Dernières activités sur vos projets et tâches">
                  <CIcon icon={cilInfo} className="text-muted" size="sm" />
                </CTooltip>
              </CCardHeader>
              <CCardBody className="p-0">
                <div className="activity-timeline">
                  {[
                    {
                      user: 'Sophie Martin',
                      action: 'a terminé la tâche',
                      target: "Conception de la page d'accueil",
                      time: 'Il y a 2 heures',
                      icon: cilTask,
                      color: 'success',
                    },
                    {
                      user: 'Thomas Dubois',
                      action: 'a commenté sur',
                      target: 'Intégration API',
                      time: 'Il y a 4 heures',
                      icon: cilNotes,
                      color: 'info',
                    },
                    {
                      user: 'Emma Petit',
                      action: 'a créé un nouveau projet',
                      target: 'Refonte application mobile',
                      time: 'Hier à 14:30',
                      icon: cilFolder,
                      color: 'primary',
                    },
                    {
                      user: 'Lucas Bernard',
                      action: 'a modifié la tâche',
                      target: 'Analyse des données marketing',
                      time: 'Hier à 10:15',
                      icon: cilPencil,
                      color: 'warning',
                    },
                  ].map((activity, index) => (
                    <div
                      key={index}
                      className={`activity-item d-flex p-3 ${index < 3 ? 'border-bottom' : ''}`}
                      style={{ transition: 'all 0.2s ease' }}
                      onMouseEnter={(e) => {
                        e.currentTarget.style.backgroundColor = '#f8f9fa'
                      }}
                      onMouseLeave={(e) => {
                        e.currentTarget.style.backgroundColor = 'transparent'
                      }}
                    >
                      <div
                        className="activity-icon me-3 rounded-circle d-flex align-items-center justify-content-center"
                        style={{
                          width: '36px',
                          height: '36px',
                          backgroundColor: `var(--cui-${activity.color})`,
                          flexShrink: 0,
                        }}
                      >
                        <CIcon icon={activity.icon} className="text-white" size="sm" />
                      </div>
                      <div className="activity-content flex-grow-1">
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <div className="fw-bold">{activity.user}</div>
                          <div className="text-muted small">{activity.time}</div>
                        </div>
                        <div>
                          <span className="text-muted">{activity.action} </span>
                          <span className="fw-medium">{activity.target}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="text-center p-3 border-top">
                  <Link to="#" className="btn btn-sm btn-outline-primary">
                    Voir toutes les activités
                  </Link>
                </div>
              </CCardBody>
            </CCard>
          </CCol>

          {/* Événements à venir */}
          <CCol md={4}>
            <UpcomingEvents />
          </CCol>

          {/* Membres de l'équipe */}
          <CCol md={4}>
            <CCard className="dashboard-card h-100 shadow-sm">
              <CCardHeader className="dashboard-card-header d-flex justify-content-between align-items-center">
                <h4 className="mb-0 fs-5">
                  <CIcon icon={cilPeople} className="me-2 text-primary" />
                  Membres de l'équipe
                </h4>
                <Link to="#" className="btn btn-sm btn-outline-primary">
                  <CIcon icon={cilUserFollow} className="me-1" size="sm" />
                  Inviter
                </Link>
              </CCardHeader>
              <CCardBody>
                <div className="team-members">
                  <CRow className="g-3">
                    {[
                      {
                        name: 'Sophie Martin',
                        role: 'Chef de projet',
                        tasks: 8,
                        status: 'En ligne',
                        statusColor: 'success',
                      },
                      {
                        name: 'Thomas Dubois',
                        role: 'Développeur',
                        tasks: 12,
                        status: 'En ligne',
                        statusColor: 'success',
                      },
                      {
                        name: 'Emma Petit',
                        role: 'Designer',
                        tasks: 6,
                        status: 'Absent',
                        statusColor: 'danger',
                      },
                      {
                        name: 'Lucas Bernard',
                        role: 'Marketing',
                        tasks: 5,
                        status: 'Occupé',
                        statusColor: 'warning',
                      },
                    ].map((member, index) => (
                      <CCol md={12} lg={6} key={index}>
                        <div
                          className="team-member-card p-3 border rounded h-100"
                          style={{
                            transition: 'all 0.3s ease',
                            boxShadow: '0 2px 5px rgba(0, 0, 0, 0.05)',
                          }}
                          onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'translateY(-3px)'
                            e.currentTarget.style.boxShadow = '0 5px 15px rgba(0, 0, 0, 0.1)'
                            e.currentTarget.style.borderColor = '#d8dbe0'
                          }}
                          onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'translateY(0)'
                            e.currentTarget.style.boxShadow = '0 2px 5px rgba(0, 0, 0, 0.05)'
                            e.currentTarget.style.borderColor = '#d8dbe0'
                          }}
                        >
                          <div className="d-flex align-items-center">
                            <div
                              className="member-avatar me-3 text-white rounded-circle d-flex align-items-center justify-content-center"
                              style={{
                                width: '48px',
                                height: '48px',
                                background: 'linear-gradient(135deg, #321fdb 0%, #1f67db 100%)',
                                boxShadow: '0 3px 6px rgba(50, 31, 219, 0.2)',
                              }}
                            >
                              {member.name
                                .split(' ')
                                .map((n) => n[0])
                                .join('')}
                            </div>
                            <div>
                              <h6 className="mb-0 d-flex align-items-center">
                                {member.name}
                                <span
                                  className="ms-2 rounded-circle"
                                  style={{
                                    width: '8px',
                                    height: '8px',
                                    backgroundColor: `var(--cui-${member.statusColor})`,
                                    display: 'inline-block',
                                  }}
                                  title={member.status}
                                ></span>
                              </h6>
                              <p className="text-muted small mb-0">{member.role}</p>
                            </div>
                          </div>
                          <div className="d-flex justify-content-between align-items-center mt-3">
                            <span className="badge bg-light text-dark">
                              <CIcon icon={cilTask} size="sm" className="me-1" />
                              {member.tasks} tâches
                            </span>
                            <Link to="#" className="btn btn-sm btn-ghost-primary">
                              Profil
                            </Link>
                          </div>
                        </div>
                      </CCol>
                    ))}
                  </CRow>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </section>
    </>
  )
}
export default Dashboard
