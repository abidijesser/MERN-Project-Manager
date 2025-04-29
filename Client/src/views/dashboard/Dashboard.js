// filepath: c:\Users\Lenovo\Desktop\pi1\MERN-Project-Manager\Client\src\views\dashboard\Dashboard.js
import React, { useEffect } from 'react'
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
} from '@coreui/icons'

import projectManagementImage from 'src/assets/images/gestion_projet.png'

import WidgetsBrand from '../widgets/WidgetsBrand'
import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'
import RecentActivityWidget from '../../components/ActivityLog/RecentActivityWidget'
import socketService from '../../services/socketService'

const Dashboard = () => {
  useEffect(() => {
    // Connect to socket for real-time updates
    socketService.connect()

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
              <CRow>
                <CCol sm={5}>
                  <div className="small text-body-secondary mb-2">Janvier - Juillet 2023</div>
                </CCol>
                <CCol sm={7} className="d-none d-md-block">
                  <CButton color="primary" className="float-end btn-sm">
                    <CIcon icon={cilCloudDownload} className="me-1" /> Exporter
                  </CButton>
                  <CButtonGroup className="float-end me-3">
                    {['Jour', 'Mois', 'Année'].map((value) => (
                      <CButton
                        color="outline-primary"
                        size="sm"
                        key={value}
                        className="mx-0"
                        active={value === 'Mois'}
                      >
                        {value}
                      </CButton>
                    ))}
                  </CButtonGroup>
                </CCol>
              </CRow>
              <MainChart />
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={4}>
          <RecentActivityWidget limit={8} />
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol md={12}>
          <CCard className="dashboard-card">
            <CCardHeader className="dashboard-card-header">
              <h4 className="mb-0">
                <CIcon icon={cilTask} className="me-2" />
                Aperçu des projets
              </h4>
            </CCardHeader>
            <CCardBody>
              <CRow>
                {[
                  {
                    title: 'Refonte du site web',
                    progress: 75,
                    status: 'En cours',
                    statusColor: 'primary',
                    tasks: 12,
                    completedTasks: 9,
                    dueDate: '15 Août 2023',
                  },
                  {
                    title: 'Application mobile',
                    progress: 45,
                    status: 'En cours',
                    statusColor: 'primary',
                    tasks: 24,
                    completedTasks: 10,
                    dueDate: '30 Sept 2023',
                  },
                  {
                    title: 'Campagne marketing',
                    progress: 90,
                    status: 'Presque terminé',
                    statusColor: 'success',
                    tasks: 18,
                    completedTasks: 16,
                    dueDate: '5 Août 2023',
                  },
                ].map((project, index) => (
                  <CCol md={4} key={index} className="mb-3">
                    <div className="project-card p-3 border rounded h-100">
                      <div className="d-flex justify-content-between align-items-center mb-3">
                        <h5 className="mb-0">{project.title}</h5>
                        <CBadge color={project.statusColor}>{project.status}</CBadge>
                      </div>
                      <div className="mb-3">
                        <div className="d-flex justify-content-between mb-1">
                          <span>Progression</span>
                          <span>{project.progress}%</span>
                        </div>
                        <CProgress
                          value={project.progress}
                          color={
                            project.progress > 75
                              ? 'success'
                              : project.progress > 40
                                ? 'primary'
                                : 'warning'
                          }
                          height={8}
                          className="mb-3"
                        />
                        <div className="d-flex justify-content-between text-muted small">
                          <span>
                            Tâches: {project.completedTasks}/{project.tasks}
                          </span>
                          <span>Échéance: {project.dueDate}</span>
                        </div>
                      </div>
                      <div className="text-end">
                        <Link to="/projects" className="btn btn-sm btn-outline-primary">
                          Voir détails
                        </Link>
                      </div>
                    </div>
                  </CCol>
                ))}
              </CRow>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>

      <CRow className="mb-4">
        <CCol md={6}>
          <CCard className="dashboard-card h-100">
            <CCardHeader className="dashboard-card-header">
              <h4 className="mb-0">
                <CIcon icon={cilCalendar} className="me-2" />
                Événements à venir
              </h4>
            </CCardHeader>
            <CCardBody>
              <div className="upcoming-events">
                {[
                  {
                    title: "Réunion d'équipe",
                    date: "Aujourd'hui, 14:00",
                    type: 'Réunion',
                    priority: 'high',
                  },
                  {
                    title: 'Présentation client',
                    date: 'Demain, 10:30',
                    type: 'Présentation',
                    priority: 'medium',
                  },
                  {
                    title: 'Date limite du rapport',
                    date: '12 Août, 2023',
                    type: 'Échéance',
                    priority: 'high',
                  },
                ].map((event, index) => (
                  <div
                    key={index}
                    className={`event-item p-3 mb-3 border-start border-4 border-${event.priority === 'high' ? 'danger' : event.priority === 'medium' ? 'warning' : 'info'} rounded`}
                  >
                    <div className="d-flex justify-content-between">
                      <h5 className="mb-1">{event.title}</h5>
                      <span className="badge bg-light text-dark">{event.type}</span>
                    </div>
                    <p className="text-muted mb-0">{event.date}</p>
                  </div>
                ))}
              </div>
            </CCardBody>
          </CCard>
        </CCol>
        <CCol md={6}>
          <CCard className="dashboard-card h-100">
            <CCardHeader className="dashboard-card-header">
              <h4 className="mb-0">
                <CIcon icon={cilPeople} className="me-2" />
                Membres de l'équipe
              </h4>
            </CCardHeader>
            <CCardBody>
              <div className="team-members">
                <CRow className="g-3">
                  {[
                    { name: 'Sophie Martin', role: 'Chef de projet', tasks: 8 },
                    { name: 'Thomas Dubois', role: 'Développeur', tasks: 12 },
                    { name: 'Emma Petit', role: 'Designer', tasks: 6 },
                    { name: 'Lucas Bernard', role: 'Marketing', tasks: 5 },
                  ].map((member, index) => (
                    <CCol md={6} key={index}>
                      <div className="team-member-card p-3 border rounded">
                        <div className="d-flex align-items-center">
                          <div
                            className="member-avatar me-3 bg-primary text-white rounded-circle d-flex align-items-center justify-content-center"
                            style={{ width: '40px', height: '40px' }}
                          >
                            {member.name
                              .split(' ')
                              .map((n) => n[0])
                              .join('')}
                          </div>
                          <div>
                            <h6 className="mb-0">{member.name}</h6>
                            <p className="text-muted small mb-0">{member.role}</p>
                          </div>
                        </div>
                        <div className="mt-2 text-end">
                          <span className="badge bg-light text-dark">{member.tasks} tâches</span>
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
    </>
  )
}
export default Dashboard
