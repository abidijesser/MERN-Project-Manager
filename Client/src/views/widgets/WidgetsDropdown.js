import React, { useEffect, useRef, useState } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import './WidgetsDropdown.css'

import {
  CRow,
  CCol,
  CDropdown,
  CDropdownMenu,
  CDropdownItem,
  CDropdownToggle,
  CWidgetStatsA,
  CCard,
  CCardBody,
  CTooltip,
} from '@coreui/react'
import { getStyle } from '@coreui/utils'
import { CChartBar, CChartLine, CChartDoughnut } from '@coreui/react-chartjs'
import CIcon from '@coreui/icons-react'
import {
  cilArrowBottom,
  cilArrowTop,
  cilOptions,
  cilTask,
  cilPeople,
  cilCalendar,
  cilSpeedometer,
  cilInfo,
  cilFolder
} from '@coreui/icons'

const WidgetsDropdown = (props) => {
  const widgetChartRef1 = useRef(null)
  const widgetChartRef2 = useRef(null)
  const [isLoading, setIsLoading] = useState(false)

  // Données fictives pour les statistiques du tableau de bord
  const [dashboardStats, setDashboardStats] = useState({
    totalProjects: 12,
    activeProjects: 8,
    completedProjects: 4,
    projectsGrowth: 16.7,

    totalTasks: 48,
    completedTasks: 29,
    pendingTasks: 14,
    overdueTasks: 5,
    tasksGrowth: 8.3,

    teamMembers: 15,
    activeMembers: 12,
    membersGrowth: 20,

    upcomingDeadlines: 7,
    deadlinesThisWeek: 3,
    deadlinesNextWeek: 4,
    deadlinesGrowth: -5.2,
  })

  // Données pour les graphiques
  const projectStatusData = {
    labels: ['Actifs', 'Terminés', 'En pause'],
    datasets: [
      {
        data: [dashboardStats.activeProjects, dashboardStats.completedProjects, 0],
        backgroundColor: ['#321fdb', '#2eb85c', '#e55353'],
        hoverBackgroundColor: ['#1b2e83', '#1e7e3c', '#a93636'],
      },
    ],
  }

  const taskStatusData = {
    labels: ['Terminées', 'En cours', 'En retard'],
    datasets: [
      {
        data: [dashboardStats.completedTasks, dashboardStats.pendingTasks, dashboardStats.overdueTasks],
        backgroundColor: ['#2eb85c', '#f9b115', '#e55353'],
        hoverBackgroundColor: ['#1e7e3c', '#c58a10', '#a93636'],
      },
    ],
  }

  useEffect(() => {
    // Simuler le chargement des données
    setIsLoading(true)
    const timer = setTimeout(() => {
      setIsLoading(false)
    }, 1000)

    // Nettoyage
    return () => clearTimeout(timer)
  }, [])

  useEffect(() => {
    document.documentElement.addEventListener('ColorSchemeChange', () => {
      if (widgetChartRef1.current) {
        setTimeout(() => {
          widgetChartRef1.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-primary')
          widgetChartRef1.current.update()
        })
      }

      if (widgetChartRef2.current) {
        setTimeout(() => {
          widgetChartRef2.current.data.datasets[0].pointBackgroundColor = getStyle('--cui-info')
          widgetChartRef2.current.update()
        })
      }
    })
  }, [widgetChartRef1, widgetChartRef2])

  return (
    <div className="dashboard-widgets">
      {/* Première rangée - Statistiques principales */}
      <CRow className={`${props.className} mb-4`} xs={{ gutter: 4 }}>
        {/* Widget Projets */}
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4 widget-with-chart"
            color="primary"
            value={
              <>
                {dashboardStats.totalProjects}{' '}
                <span className="fs-6 fw-normal">
                  {dashboardStats.projectsGrowth > 0 ? (
                    <span className="text-success">
                      (+{dashboardStats.projectsGrowth}% <CIcon icon={cilArrowTop} />)
                    </span>
                  ) : (
                    <span className="text-danger">
                      ({dashboardStats.projectsGrowth}% <CIcon icon={cilArrowBottom} />)
                    </span>
                  )}
                </span>
              </>
            }
            title={
              <div className="d-flex align-items-center">
                <CIcon icon={cilFolder} className="me-2" />
                <span>Projets</span>
                <CTooltip content="Nombre total de projets actifs et terminés">
                  <CIcon icon={cilInfo} className="ms-2 text-white-50" size="sm" />
                </CTooltip>
              </div>
            }
            action={
              <CDropdown alignment="end">
                <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                  <CIcon icon={cilOptions} />
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem to="/projects" component={Link}>Voir tous les projets</CDropdownItem>
                  <CDropdownItem to="/projects/create" component={Link}>Créer un projet</CDropdownItem>
                  <CDropdownItem to="/performances" component={Link}>Voir les performances</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            }
            chart={
              <CChartDoughnut
                className="mt-3 mx-auto"
                style={{ height: '80px', width: '80px' }}
                data={projectStatusData}
                options={{
                  cutout: '70%',
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      enabled: true,
                      callbacks: {
                        label: function(context) {
                          return `${context.label}: ${context.raw}`;
                        }
                      }
                    }
                  },
                  maintainAspectRatio: false,
                  elements: {
                    arc: {
                      borderWidth: 0,
                    },
                  },
                }}
              />
            }
          />
        </CCol>

        {/* Widget Tâches */}
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4 widget-with-chart"
            color="info"
            value={
              <>
                {dashboardStats.totalTasks}{' '}
                <span className="fs-6 fw-normal">
                  {dashboardStats.tasksGrowth > 0 ? (
                    <span className="text-success">
                      (+{dashboardStats.tasksGrowth}% <CIcon icon={cilArrowTop} />)
                    </span>
                  ) : (
                    <span className="text-danger">
                      ({dashboardStats.tasksGrowth}% <CIcon icon={cilArrowBottom} />)
                    </span>
                  )}
                </span>
              </>
            }
            title={
              <div className="d-flex align-items-center">
                <CIcon icon={cilTask} className="me-2" />
                <span>Tâches</span>
                <CTooltip content="Nombre total de tâches dans tous les projets">
                  <CIcon icon={cilInfo} className="ms-2 text-white-50" size="sm" />
                </CTooltip>
              </div>
            }
            action={
              <CDropdown alignment="end">
                <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                  <CIcon icon={cilOptions} />
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem to="/tasks" component={Link}>Voir toutes les tâches</CDropdownItem>
                  <CDropdownItem to="/tasks/create" component={Link}>Créer une tâche</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            }
            chart={
              <CChartDoughnut
                className="mt-3 mx-auto"
                style={{ height: '80px', width: '80px' }}
                data={taskStatusData}
                options={{
                  cutout: '70%',
                  plugins: {
                    legend: {
                      display: false,
                    },
                    tooltip: {
                      enabled: true,
                      callbacks: {
                        label: function(context) {
                          return `${context.label}: ${context.raw}`;
                        }
                      }
                    }
                  },
                  maintainAspectRatio: false,
                  elements: {
                    arc: {
                      borderWidth: 0,
                    },
                  },
                }}
              />
            }
          />
        </CCol>

        {/* Widget Membres */}
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4 widget-with-chart"
            color="success"
            value={
              <>
                {dashboardStats.teamMembers}{' '}
                <span className="fs-6 fw-normal">
                  {dashboardStats.membersGrowth > 0 ? (
                    <span className="text-success">
                      (+{dashboardStats.membersGrowth}% <CIcon icon={cilArrowTop} />)
                    </span>
                  ) : (
                    <span className="text-danger">
                      ({dashboardStats.membersGrowth}% <CIcon icon={cilArrowBottom} />)
                    </span>
                  )}
                </span>
              </>
            }
            title={
              <div className="d-flex align-items-center">
                <CIcon icon={cilPeople} className="me-2" />
                <span>Membres</span>
                <CTooltip content="Nombre total de membres dans l'équipe">
                  <CIcon icon={cilInfo} className="ms-2 text-white-50" size="sm" />
                </CTooltip>
              </div>
            }
            action={
              <CDropdown alignment="end">
                <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                  <CIcon icon={cilOptions} />
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem to="/team" component={Link}>Voir l'équipe</CDropdownItem>
                  <CDropdownItem to="/team/invite" component={Link}>Inviter un membre</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            }
            chart={
              <div className="d-flex justify-content-center align-items-center mt-3" style={{ height: '80px' }}>
                <div className="text-center">
                  <div className="fs-5 fw-bold text-white">{dashboardStats.activeMembers}</div>
                  <div className="text-white-50 small">Actifs aujourd'hui</div>
                </div>
              </div>
            }
          />
        </CCol>

        {/* Widget Échéances */}
        <CCol sm={6} lg={3}>
          <CWidgetStatsA
            className="mb-4 widget-with-chart"
            color="warning"
            value={
              <>
                {dashboardStats.upcomingDeadlines}{' '}
                <span className="fs-6 fw-normal">
                  {dashboardStats.deadlinesGrowth > 0 ? (
                    <span className="text-success">
                      (+{dashboardStats.deadlinesGrowth}% <CIcon icon={cilArrowTop} />)
                    </span>
                  ) : (
                    <span className="text-danger">
                      ({dashboardStats.deadlinesGrowth}% <CIcon icon={cilArrowBottom} />)
                    </span>
                  )}
                </span>
              </>
            }
            title={
              <div className="d-flex align-items-center">
                <CIcon icon={cilCalendar} className="me-2" />
                <span>Échéances à venir</span>
                <CTooltip content="Nombre d'échéances dans les 7 prochains jours">
                  <CIcon icon={cilInfo} className="ms-2 text-white-50" size="sm" />
                </CTooltip>
              </div>
            }
            action={
              <CDropdown alignment="end">
                <CDropdownToggle color="transparent" caret={false} className="text-white p-0">
                  <CIcon icon={cilOptions} />
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem to="/calendar" component={Link}>Voir le calendrier</CDropdownItem>
                  <CDropdownItem to="/meetings/create" component={Link}>Planifier une réunion</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
            }
            chart={
              <div className="d-flex justify-content-around align-items-center mt-3" style={{ height: '80px' }}>
                <div className="text-center">
                  <div className="fs-5 fw-bold text-white">{dashboardStats.deadlinesThisWeek}</div>
                  <div className="text-white-50 small">Cette semaine</div>
                </div>
                <div className="text-center">
                  <div className="fs-5 fw-bold text-white">{dashboardStats.deadlinesNextWeek}</div>
                  <div className="text-white-50 small">Semaine prochaine</div>
                </div>
              </div>
            }
          />
        </CCol>
      </CRow>

      {/* Deuxième rangée - Statistiques détaillées */}
      <CRow className="mb-4">
        {/* Progression des projets */}
        <CCol md={6} xl={3}>
          <CCard className="mb-4 h-100 shadow-sm">
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="card-title mb-0 fs-5">Progression des projets</h4>
                <CTooltip content="Répartition des projets par statut">
                  <CIcon icon={cilInfo} className="text-muted" size="sm" />
                </CTooltip>
              </div>
              <div className="chart-container" style={{ height: '180px' }}>
                <CChartDoughnut
                  data={projectStatusData}
                  options={{
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          usePointStyle: true,
                          pointStyle: 'circle',
                          padding: 15,
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((context.raw / total) * 100);
                            return `${context.label}: ${context.raw} (${percentage}%)`;
                          }
                        }
                      }
                    },
                    cutout: '65%',
                    maintainAspectRatio: false,
                  }}
                />
              </div>
              <div className="text-center mt-3">
                <Link to="/projects" className="btn btn-sm btn-outline-primary">
                  Voir tous les projets
                </Link>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Statut des tâches */}
        <CCol md={6} xl={3}>
          <CCard className="mb-4 h-100 shadow-sm">
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="card-title mb-0 fs-5">Statut des tâches</h4>
                <CTooltip content="Répartition des tâches par statut">
                  <CIcon icon={cilInfo} className="text-muted" size="sm" />
                </CTooltip>
              </div>
              <div className="chart-container" style={{ height: '180px' }}>
                <CChartDoughnut
                  data={taskStatusData}
                  options={{
                    plugins: {
                      legend: {
                        position: 'bottom',
                        labels: {
                          usePointStyle: true,
                          pointStyle: 'circle',
                          padding: 15,
                        },
                      },
                      tooltip: {
                        callbacks: {
                          label: function(context) {
                            const total = context.dataset.data.reduce((a, b) => a + b, 0);
                            const percentage = Math.round((context.raw / total) * 100);
                            return `${context.label}: ${context.raw} (${percentage}%)`;
                          }
                        }
                      }
                    },
                    cutout: '65%',
                    maintainAspectRatio: false,
                  }}
                />
              </div>
              <div className="text-center mt-3">
                <Link to="/tasks" className="btn btn-sm btn-outline-primary">
                  Voir toutes les tâches
                </Link>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Efficacité de l'équipe */}
        <CCol md={6} xl={3}>
          <CCard className="mb-4 h-100 shadow-sm">
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="card-title mb-0 fs-5">Efficacité de l'équipe</h4>
                <CTooltip content="Taux de complétion des tâches par rapport aux délais">
                  <CIcon icon={cilInfo} className="text-muted" size="sm" />
                </CTooltip>
              </div>
              <div className="text-center my-4">
                <div className="progress-circle-container position-relative mx-auto" style={{ width: '150px', height: '150px' }}>
                  <div className="position-absolute top-50 start-50 translate-middle text-center">
                    <div className="fs-1 fw-bold">78%</div>
                    <div className="text-muted small">Efficacité</div>
                  </div>
                  <CChartDoughnut
                    data={{
                      datasets: [{
                        data: [78, 22],
                        backgroundColor: ['#2eb85c', '#ebedef'],
                        borderWidth: 0,
                      }]
                    }}
                    options={{
                      cutout: '80%',
                      plugins: {
                        legend: {
                          display: false
                        },
                        tooltip: {
                          enabled: false
                        }
                      },
                      rotation: -90,
                      circumference: 180,
                      maintainAspectRatio: false,
                    }}
                  />
                </div>
              </div>
              <div className="text-center mt-3">
                <Link to="/performances" className="btn btn-sm btn-outline-primary">
                  Voir les performances
                </Link>
              </div>
            </CCardBody>
          </CCard>
        </CCol>

        {/* Charge de travail */}
        <CCol md={6} xl={3}>
          <CCard className="mb-4 h-100 shadow-sm">
            <CCardBody>
              <div className="d-flex justify-content-between align-items-center mb-3">
                <h4 className="card-title mb-0 fs-5">Charge de travail</h4>
                <CTooltip content="Répartition des tâches par membre de l'équipe">
                  <CIcon icon={cilInfo} className="text-muted" size="sm" />
                </CTooltip>
              </div>
              <div className="chart-container" style={{ height: '180px' }}>
                <CChartBar
                  data={{
                    labels: ['Sophie', 'Thomas', 'Emma', 'Lucas', 'Julie'],
                    datasets: [
                      {
                        label: 'Tâches assignées',
                        backgroundColor: '#321fdb',
                        data: [8, 12, 6, 5, 9],
                        barPercentage: 0.6,
                        borderRadius: 4,
                      },
                    ],
                  }}
                  options={{
                    maintainAspectRatio: false,
                    plugins: {
                      legend: {
                        display: false,
                      },
                    },
                    scales: {
                      x: {
                        grid: {
                          display: false,
                        },
                      },
                      y: {
                        beginAtZero: true,
                        max: 15,
                        ticks: {
                          stepSize: 5,
                        },
                      },
                    },
                  }}
                />
              </div>
              <div className="text-center mt-3">
                <Link to="#" className="btn btn-sm btn-outline-primary">
                  Voir l'équipe
                </Link>
              </div>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

WidgetsDropdown.propTypes = {
  className: PropTypes.string,
  withCharts: PropTypes.bool,
}

export default WidgetsDropdown
