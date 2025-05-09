import React, { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CListGroup,
  CListGroupItem,
  CSpinner,
  CAlert,
  CBadge,
} from '@coreui/react'
import { getRecentActivityLogs } from '../../services/activityLogService'
import socketService from '../../services/socketService'
import CIcon from '@coreui/icons-react'
import {
  cilPencil,
  cilTrash,
  cilCommentSquare,
  cilCheckAlt,
  cilNotes,
  cilUser,
  cilSwapHorizontal,
  cilArrowRight,
  cilFolder,
  cilTask,
} from '@coreui/icons'

const RecentActivityListWidget = ({ limit = 5 }) => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  // Fetch recent activity logs when component mounts
  useEffect(() => {
    fetchRecentActivityLogs()

    // Listen for activity updates
    const unsubscribe = socketService.on('activityUpdated', (activity) => {
      setActivities((prevActivities) => {
        // Add the new activity at the beginning and keep only the latest 'limit' activities
        const updatedActivities = [activity, ...prevActivities]
        return updatedActivities.slice(0, limit)
      })
    })

    // Clean up when component unmounts
    return () => {
      unsubscribe()
    }
  }, [limit])

  const fetchRecentActivityLogs = async () => {
    try {
      setLoading(true)
      setError(null)

      const response = await getRecentActivityLogs(limit)

      console.log('RecentActivityListWidget - response:', response)
      console.log('RecentActivityListWidget - activity logs:', response.activityLogs)
      console.log(
        'RecentActivityListWidget - activity types:',
        response.activityLogs?.map((a) => a.action),
      )

      if (response.success) {
        setActivities(response.activityLogs)
      } else {
        setError('Failed to load recent activities')
      }
    } catch (err) {
      setError('Error loading activities: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)

    // Format: DD/MM/YYYY HH:MM:SS
    return date
      .toLocaleString('fr-FR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
      })
      .replace(',', '')
  }

  const getActivityIcon = (action) => {
    switch (action) {
      case 'CREATE':
        return cilFolder
      case 'UPDATE':
        return cilPencil
      case 'DELETE':
        return cilTrash
      case 'COMMENT':
        return cilCommentSquare
      case 'STATUS_CHANGE':
        return cilSwapHorizontal
      case 'ASSIGN':
        return cilUser
      case 'COMPLETE':
        return cilCheckAlt
      default:
        return cilNotes
    }
  }

  const getActivityBadge = (action) => {
    switch (action) {
      case 'CREATE':
        return { color: 'success', text: 'Créé' }
      case 'UPDATE':
        return { color: 'info', text: 'Mis à jour' }
      case 'DELETE':
        return { color: 'danger', text: 'Supprimé' }
      case 'COMMENT':
        return { color: 'primary', text: 'Commenté' }
      case 'STATUS_CHANGE':
        return { color: 'warning', text: 'Statut modifié' }
      case 'ASSIGN':
        return { color: 'info', text: 'Assigné' }
      case 'COMPLETE':
        return { color: 'success', text: 'Terminé' }
      default:
        return { color: 'secondary', text: action }
    }
  }

  const getActivityDescription = (activity) => {
    const userName = activity.user?.name || 'Utilisateur inconnu'

    let entityType = ''
    let entityName = ''
    let entityLink = '#'
    let actionText = ''

    // Determine entity type and name
    if (activity.entityType === 'PROJECT') {
      entityType = 'projet'
      entityName = activity.project?.projectName || ''
      entityLink = `/projects/${activity.project?._id}`
    } else if (activity.entityType === 'TASK') {
      entityType = 'tâche'
      entityName = activity.task?.title || ''
      entityLink = `/tasks/${activity.task?._id}`
    } else if (activity.entityType === 'DOCUMENT') {
      entityType = 'document'
      entityName = 'document'
      entityLink = `/resources`
    }

    // Determine action text
    switch (activity.action) {
      case 'CREATE':
        actionText = `a créé un nouveau ${entityType}`
        break
      case 'UPDATE':
        actionText = `a mis à jour le ${entityType}`
        break
      case 'DELETE':
        actionText = `a supprimé un ${entityType}`
        break
      case 'COMMENT':
        actionText = `a commenté sur ${entityType}`
        break
      case 'STATUS_CHANGE':
        actionText = `a changé le statut du ${entityType} à ${activity.details?.newStatus || ''}`
        break
      case 'ASSIGN':
        actionText = `a assigné le ${entityType} à ${activity.details?.assignedTo || ''}`
        break
      case 'COMPLETE':
        actionText = `a marqué le ${entityType} comme terminé`
        break
      default:
        actionText = `a effectué une action sur le ${entityType}`
    }

    return {
      user: userName,
      text: `${actionText}${entityName ? ': ' + entityName : ''}`,
      link: entityLink,
      details: activity.details?.content || '',
    }
  }

  return (
    <CCard className="dashboard-card h-100 shadow-sm">
      <CCardHeader className="dashboard-card-header d-flex justify-content-between align-items-center">
        <h4 className="mb-0 fs-5">
          <CIcon icon={cilNotes} className="me-2 text-primary" />
          Activités Récentes
        </h4>
        <Link to="/activity" className="btn btn-sm btn-link">
          Voir Toutes <CIcon icon={cilArrowRight} size="sm" />
        </Link>
      </CCardHeader>
      <CCardBody className="p-0">
        {error && <CAlert color="danger">{error}</CAlert>}

        {loading ? (
          <div className="text-center my-3">
            <CSpinner />
          </div>
        ) : activities.length === 0 ? (
          <div className="text-center text-muted my-3">Aucune activité récente</div>
        ) : (
          <div className="activity-timeline">
            {activities.map((activity, index) => {
              const activityInfo = getActivityDescription(activity)
              const badge = getActivityBadge(activity.action)
              return (
                <div
                  key={activity._id}
                  className={`activity-item d-flex p-3 ${index < activities.length - 1 ? 'border-bottom' : ''}`}
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
                      backgroundColor: `var(--cui-${badge.color})`,
                      flexShrink: 0,
                    }}
                  >
                    <CIcon
                      icon={getActivityIcon(activity.action)}
                      className="text-white"
                      size="sm"
                    />
                  </div>
                  <div className="activity-content flex-grow-1">
                    <div className="d-flex justify-content-between align-items-center mb-1">
                      <div className="fw-bold">{activityInfo.user}</div>
                      <div className="text-muted small">{formatDate(activity.timestamp)}</div>
                    </div>
                    <div>
                      <CBadge color={badge.color} className="me-2">
                        {badge.text}
                      </CBadge>
                      <span>{activityInfo.text}</span>
                    </div>
                    {activity.action === 'COMMENT' && activityInfo.details && (
                      <div className="mt-1 text-muted fst-italic">"{activityInfo.details}..."</div>
                    )}
                  </div>
                </div>
              )
            })}
            <div className="text-center p-3 border-top">
              <Link to="/activity" className="btn btn-sm btn-outline-primary">
                Voir toutes les activités
              </Link>
            </div>
          </div>
        )}
      </CCardBody>
    </CCard>
  )
}

export default RecentActivityListWidget
