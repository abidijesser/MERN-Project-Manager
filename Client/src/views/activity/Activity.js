import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CListGroup,
  CListGroupItem,
  CSpinner,
  CAlert,
  CPagination,
  CPaginationItem,
  CBadge,
  CFormSelect,
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
  cilFolder,
} from '@coreui/icons'
import { Link } from 'react-router-dom'
import './Activity.css'

const Activity = () => {
  const [activities, setActivities] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [pagination, setPagination] = useState({
    total: 0,
    limit: 20,
    skip: 0,
  })
  const [filter, setFilter] = useState('all')

  // Fetch activity logs when component mounts
  useEffect(() => {
    fetchActivityLogs()

    // Listen for activity updates
    const unsubscribe = socketService.on('activityUpdated', (activity) => {
      setActivities((prevActivities) => [activity, ...prevActivities])
    })

    // Clean up when component unmounts
    return () => {
      unsubscribe()
    }
  }, [pagination.skip, pagination.limit, filter])

  const fetchActivityLogs = async () => {
    try {
      setLoading(true)
      setError(null)

      // Fetch all activity logs
      const response = await getRecentActivityLogs(100) // Increased limit to ensure we get enough data

      console.log('Activity logs response:', response)
      console.log('Activity logs data:', response.activityLogs)

      if (response.success) {
        // Filter activities based on the selected filter
        let filteredActivities = response.activityLogs
        if (filter !== 'all') {
          filteredActivities = response.activityLogs.filter(
            (activity) => activity.action === filter,
          )
        }

        // Log the activity types to help with debugging
        const activityTypes = [...new Set(response.activityLogs.map((a) => a.action))]
        console.log('All activity types in data:', activityTypes)
        console.log('Current filter:', filter)
        console.log('Filtered activities count:', filteredActivities.length)
        console.log('Filtered activity types:', [
          ...new Set(filteredActivities.map((a) => a.action)),
        ])

        setActivities(filteredActivities)
        setPagination({
          ...pagination,
          total: response.activityLogs.length,
        })
      } else {
        setError('Failed to load activity logs')
      }
    } catch (err) {
      setError('Error loading activity logs: ' + (err.response?.data?.error || err.message))
    } finally {
      setLoading(false)
    }
  }

  const handlePageChange = (page) => {
    const newSkip = (page - 1) * pagination.limit
    setPagination((prev) => ({
      ...prev,
      skip: newSkip,
    }))
  }

  const handleFilterChange = (e) => {
    setFilter(e.target.value)
  }

  const formatDate = (dateString) => {
    const date = new Date(dateString)
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
    <div className="animated fadeIn activity-page">
      <CRow>
        <CCol lg={12}>
          <CCard className="mb-4 activity-card">
            <CCardHeader className="activity-card-header d-flex justify-content-between align-items-center">
              <h4 className="mb-0">Historique des Activités</h4>
              <CFormSelect className="activity-filter" value={filter} onChange={handleFilterChange}>
                <option value="all">Toutes les activités</option>
                <option value="CREATE">Créations</option>
                <option value="UPDATE">Mises à jour</option>
                <option value="DELETE">Suppressions</option>
                <option value="COMMENT">Commentaires</option>
                <option value="STATUS_CHANGE">Changements de statut</option>
              </CFormSelect>
            </CCardHeader>
            <CCardBody className="p-3 p-md-4">
              {error && <CAlert color="danger">{error}</CAlert>}

              {loading ? (
                <div className="text-center my-5">
                  <CSpinner />
                </div>
              ) : activities.length === 0 ? (
                <div className="text-center text-muted my-5">Aucune activité trouvée</div>
              ) : (
                <>
                  <div className="activity-timeline">
                    {activities.map((activity, index) => {
                      const activityInfo = getActivityDescription(activity)
                      const badge = getActivityBadge(activity.action)
                      return (
                        <div key={activity._id} className="activity-item d-flex">
                          <div
                            className="activity-icon d-flex align-items-center justify-content-center"
                            style={{
                              backgroundColor: `var(--cui-${badge.color})`,
                            }}
                          >
                            <CIcon
                              icon={getActivityIcon(activity.action)}
                              className="text-white"
                              size="sm"
                            />
                          </div>
                          <div className="activity-content flex-grow-1">
                            <div className="d-flex justify-content-between align-items-center mb-2">
                              <div className="activity-user">{activityInfo.user}</div>
                              <div className="activity-time">{formatDate(activity.timestamp)}</div>
                            </div>
                            <div className="activity-text">
                              <CBadge color={badge.color} className="activity-badge">
                                {badge.text}
                              </CBadge>
                              <span>{activityInfo.text}</span>
                            </div>
                            {activity.action === 'COMMENT' && activityInfo.details && (
                              <div className="activity-details">"{activityInfo.details}..."</div>
                            )}
                            <div className="activity-action">
                              <Link
                                to={activityInfo.link}
                                className="btn btn-sm btn-outline-primary"
                              >
                                Voir
                              </Link>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>

                  {pagination.total > pagination.limit && (
                    <CPagination className="activity-pagination">
                      {Array.from(
                        { length: Math.ceil(pagination.total / pagination.limit) },
                        (_, i) => (
                          <CPaginationItem
                            key={i}
                            active={i === pagination.skip / pagination.limit}
                            onClick={() => handlePageChange(i + 1)}
                          >
                            {i + 1}
                          </CPaginationItem>
                        ),
                      )}
                    </CPagination>
                  )}
                </>
              )}
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </div>
  )
}

export default Activity
