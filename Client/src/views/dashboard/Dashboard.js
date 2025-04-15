// filepath: c:\Users\Lenovo\Desktop\pi1\MERN-Project-Manager\Client\src\views\dashboard\Dashboard.js
import React, { useEffect, useState } from 'react'
import axios from 'axios'
import { Link } from 'react-router-dom'
import classNames from 'classnames'

import {
  CAvatar,
  CButton,
  CButtonGroup,
  CCard,
  CCardBody,
  CCardFooter,
  CCardHeader,
  CCol,
  CProgress,
  CRow,
  CTable,
  CTableBody,
  CTableDataCell,
  CTableHead,
  CTableHeaderCell,
  CTableRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cibCcAmex,
  cibCcApplePay,
  cibCcMastercard,
  cibCcPaypal,
  cibCcStripe,
  cibCcVisa,
  cibGoogle,
  cibFacebook,
  cibLinkedin,
  cifBr,
  cifEs,
  cifFr,
  cifIn,
  cifPl,
  cifUs,
  cibTwitter,
  cilCloudDownload,
  cilPeople,
  cilUser,
  cilUserFemale,
} from '@coreui/icons'

import avatar1 from 'src/assets/images/avatars/1.jpg'
import avatar2 from 'src/assets/images/avatars/2.jpg'
import avatar3 from 'src/assets/images/avatars/3.jpg'
import avatar4 from 'src/assets/images/avatars/4.jpg'
import avatar5 from 'src/assets/images/avatars/5.jpg'
import avatar6 from 'src/assets/images/avatars/6.jpg'

import projectManagementImage from 'src/assets/images/gestion_projet.png'

import WidgetsBrand from '../widgets/WidgetsBrand'
import WidgetsDropdown from '../widgets/WidgetsDropdown'
import MainChart from './MainChart'

const Dashboard = () => {
  const [users, setUsers] = useState([])

  useEffect(() => {
    axios
      .get('http://localhost:3001/admin/users')
      .then((response) => {
        setUsers(response.data)
      })
      .catch((error) => {
        console.error('There was an error fetching the users!', error)
      })
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

      {/* Section existante */}
      <WidgetsDropdown className="mb-4" />
      <CCard className="mb-4">
        <CCardBody>
          <CRow>
            <CCol sm={5}>
              <h4 id="traffic" className="card-title mb-0">
                Traffic
              </h4>
              <div className="small text-body-secondary">January - July 2023</div>
            </CCol>
            <CCol sm={7} className="d-none d-md-block">
              <CButton color="primary" className="float-end">
                <CIcon icon={cilCloudDownload} />
              </CButton>
              <CButtonGroup className="float-end me-3">
                {['Day', 'Month', 'Year'].map((value) => (
                  <CButton
                    color="outline-secondary"
                    key={value}
                    className="mx-0"
                    active={value === 'Month'}
                  >
                    {value}
                  </CButton>
                ))}
              </CButtonGroup>
            </CCol>
          </CRow>
          <MainChart />
        </CCardBody>
        <CCardFooter>
          <CRow
            xs={{ cols: 1, gutter: 4 }}
            sm={{ cols: 2 }}
            lg={{ cols: 4 }}
            xl={{ cols: 5 }}
            className="mb-2 text-center"
          >
            {/* Your existing progressExample code */}
          </CRow>
        </CCardFooter>
      </CCard>
      <WidgetsBrand className="mb-4" withCharts />
      <CRow>
        <CCol xs>
          <CCard className="mb-4">
            <CCardHeader>Users</CCardHeader>
            <CCardBody>
              <CTable align="middle" className="mb-0 border" hover responsive>
                <CTableHead className="text-nowrap">
                  <CTableRow>
                    <CTableHeaderCell className="bg-body-tertiary text-center">
                      <CIcon icon={cilPeople} />
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">User</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">
                      Country
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Usage</CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary text-center">
                      Payment Method
                    </CTableHeaderCell>
                    <CTableHeaderCell className="bg-body-tertiary">Activity</CTableHeaderCell>
                  </CTableRow>
                </CTableHead>
                <CTableBody>
                  {users.map((user, index) => (
                    <CTableRow key={index}>
                      <CTableDataCell className="text-center">
                        <CAvatar size="md" src={avatar1} status="success" />
                      </CTableDataCell>
                      <CTableDataCell>
                        <div>{user.name}</div>
                        <div className="small text-body-secondary text-nowrap">
                          <span>{user.new ? 'New' : 'Recurring'}</span> | Registered:{' '}
                          {user.registered}
                        </div>
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CIcon size="xl" icon={cifUs} title="USA" />
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="d-flex justify-content-between text-nowrap">
                          <div className="fw-semibold">50%</div>
                          <div className="ms-3">
                            <small className="text-body-secondary">
                              Jun 11, 2023 - Jul 10, 2023
                            </small>
                          </div>
                        </div>
                        <CProgress thin color="success" value={50} />
                      </CTableDataCell>
                      <CTableDataCell className="text-center">
                        <CIcon size="xl" icon={cibCcMastercard} />
                      </CTableDataCell>
                      <CTableDataCell>
                        <div className="small text-body-secondary text-nowrap">Last login</div>
                        <div className="fw-semibold text-nowrap">10 sec ago</div>
                      </CTableDataCell>
                      <CTableDataCell>
                        <Link to={`/user-details/${user._id}`}>View Details</Link>
                      </CTableDataCell>
                    </CTableRow>
                  ))}
                </CTableBody>
              </CTable>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </>
  )
}
export default Dashboard
