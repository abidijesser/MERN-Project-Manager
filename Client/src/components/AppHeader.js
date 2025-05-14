import React, { useEffect, useRef, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
import axios from 'axios'
import { toast } from 'react-toastify'
import './NotificationDropdown.css'
import {
  CContainer,
  CDropdown,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CHeader,
  CHeaderNav,
  CHeaderToggler,
  CNavLink,
  CNavItem,
  useColorModes,
  CBadge,
  CSpinner,
  CTooltip,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilContrast,
  cilMenu,
  cilMoon,
  cilSun,
  cilSpeedometer,
  cilNotes,
  cilChartPie,
  cilStar,
  cilCursor,
  cilDescription,
  cilCalculator,
  cilLibrary,
  cilCheck,
  cilCloud,
} from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'

const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')
  const [notifications, setNotifications] = useState([])
  const [loadingNotifications, setLoadingNotifications] = useState(false)
  const [notificationError, setNotificationError] = useState(null)

  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  // Fonction pour récupérer les notifications
  const fetchNotifications = async () => {
    try {
      setLoadingNotifications(true)
      setNotificationError(null)

      const token = localStorage.getItem('token')
      if (!token) {
        console.error("Aucun token d'authentification trouvé")
        setNotificationError('Vous devez être connecté pour voir vos notifications')
        setLoadingNotifications(false)
        return
      }

      const response = await axios.get('http://192.168.33.10:3001/api/notifications', {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      })

      if (response.data && response.data.success) {
        setNotifications(response.data.notifications)
      } else {
        console.error('Format de réponse invalide:', response.data)
        setNotificationError('Erreur lors de la récupération des notifications')
      }
    } catch (error) {
      console.error('Erreur lors de la récupération des notifications:', error)
      setNotificationError(error.message || 'Erreur lors de la récupération des notifications')
    } finally {
      setLoadingNotifications(false)
    }
  }

  // Fonction pour marquer une notification comme lue
  const markNotificationAsRead = async (notificationId) => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      await axios.put(`http://192.168.33.10:3001/api/notifications/${notificationId}/read`, {}, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
    })

      // Mettre à jour l'état local
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) =>
          notification._id === notificationId ? { ...notification, read: true } : notification,
        ),
      )
    } catch (error) {
      console.error('Erreur lors du marquage de la notification comme lue:', error)
    }
  }

  // Fonction pour marquer toutes les notifications comme lues
  const markAllNotificationsAsRead = async () => {
    try {
      const token = localStorage.getItem('token')
      if (!token) return

      await axios.put(
        'http://192.168.33.10:3001/api/notifications/read-all',
        {},
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        },
      )

      // Mettre à jour l'état local
      setNotifications((prevNotifications) =>
        prevNotifications.map((notification) => ({ ...notification, read: true })),
      )

      toast.success('Toutes les notifications ont été marquées comme lues')
    } catch (error) {
      console.error('Erreur lors du marquage de toutes les notifications comme lues:', error)
      toast.error('Erreur lors du marquage des notifications comme lues')
    }
  }

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })

    // Récupérer toutes les notifications depuis l'API
    fetchNotifications()

    // Rafraîchir les notifications toutes les 60 secondes
    const interval = setInterval(fetchNotifications, 60000)

    // Nettoyer l'intervalle lors du démontage du composant
    return () => clearInterval(interval)
  }, [])

  return (
    <CHeader position="sticky" className="mb-4 p-0 app-header" ref={headerRef}>
      <CContainer className="px-4 py-2" fluid>
        <div className="d-flex align-items-center justify-content-between w-100">
          <div className="d-flex align-items-center">
            <div className="app-logo me-4">
              <span className="fw-bold fs-4 text-white">worktrack</span>
            </div>
            <CHeaderToggler
              onClick={() => dispatch({ type: 'set', sidebarShow: !sidebarShow })}
              className="d-md-none text-white"
            >
              <CIcon icon={cilMenu} size="lg" />
            </CHeaderToggler>
            <CHeaderNav className="d-none d-md-flex main-nav">
              <CNavItem>
                <CNavLink to="/dashboard" as={NavLink} className="nav-link-custom">
                  <CIcon icon={cilSpeedometer} className="nav-icon" />
                  <span>Tableau de bord</span>
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink to="/projects" as={NavLink} className="nav-link-custom">
                  <CIcon icon={cilNotes} className="nav-icon" />
                  <span>Mes projets</span>
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink to="/tasks" as={NavLink} className="nav-link-custom">
                  <CIcon icon={cilChartPie} className="nav-icon" />
                  <span>Tâches</span>
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink to="/performances" as={NavLink} className="nav-link-custom">
                  <CIcon icon={cilStar} className="nav-icon" />
                  <span>Performances</span>
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink to="/resources" as={NavLink} className="nav-link-custom">
                  <CIcon icon={cilLibrary} className="nav-icon" />
                  <span>Ressources</span>
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink to="/drive" as={NavLink} className="nav-link-custom">
                  <CIcon icon={cilCloud} className="nav-icon" />
                  <span>Google Drive</span>
                </CNavLink>
              </CNavItem>
              <CDropdown variant="nav-item">
                <CDropdownToggle caret className="nav-link-custom">
                  <CIcon icon={cilCursor} className="nav-icon" />
                  <span>Collaboration</span>
                </CDropdownToggle>
                <CDropdownMenu>
                  <CDropdownItem href="#/collaboration/chat">Chat</CDropdownItem>
                  <CDropdownItem href="#/collaboration/notifications">Notifications</CDropdownItem>
                  <CDropdownItem href="#/collaboration/meetings">Réunions</CDropdownItem>
                </CDropdownMenu>
              </CDropdown>
              <CNavItem>
                <CNavLink to="/media" as={NavLink} className="nav-link-custom">
                  <CIcon icon={cilDescription} className="nav-icon" />
                  <span>Médias</span>
                </CNavLink>
              </CNavItem>
            </CHeaderNav>
          </div>

          <div className="d-flex align-items-center">
            <CHeaderNav className="header-actions">
              {/* Utiliser directement CDropdown au lieu de l'imbriquer dans CNavItem */}
              <CDropdown variant="nav-item">
                <CDropdownToggle caret={false} className="action-link">
                  <div className="icon-wrapper" style={{ position: 'relative' }}>
                    <CIcon icon={cilBell} size="lg" />
                    {notifications.filter((notification) => !notification.read).length > 0 && (
                      <div className="notification-badge">
                        {notifications.filter((notification) => !notification.read).length}
                      </div>
                    )}
                  </div>
                </CDropdownToggle>
                <CDropdownMenu className="notification-dropdown-menu">
                  <div className="notification-header">
                    <span>Notifications</span>
                    <div className="d-flex align-items-center">
                      {notifications.filter((n) => !n.read).length > 0 && (
                        <CTooltip content="Marquer tout comme lu">
                          <button
                            className="btn btn-sm btn-link text-success p-0 me-2"
                            onClick={(e) => {
                              e.stopPropagation()
                              markAllNotificationsAsRead()
                            }}
                          >
                            <CIcon icon={cilCheck} size="sm" />
                          </button>
                        </CTooltip>
                      )}
                      {loadingNotifications && <CSpinner size="sm" />}
                    </div>
                  </div>

                  {notificationError && (
                    <div className="notification-item text-danger">{notificationError}</div>
                  )}

                  {notifications.length > 0 ? (
                    <>
                      {notifications.map((notification) => (
                        <div
                          key={notification._id}
                          className={`notification-item ${!notification.read ? 'unread' : ''}`}
                          onClick={() => markNotificationAsRead(notification._id)}
                        >
                          <span className="notification-time">
                            {new Date(notification.createdAt).toLocaleString()}
                            {notification.read && (
                              <CTooltip content="Lu">
                                <CIcon icon={cilCheck} size="sm" className="text-success ms-2" />
                              </CTooltip>
                            )}
                          </span>
                          <p className="notification-message">{notification.message}</p>
                        </div>
                      ))}
                      <div className="notification-footer">
                        <a href="#/collaboration/notifications">Voir toutes les notifications</a>
                      </div>
                    </>
                  ) : (
                    <div className="notification-empty">Aucune notification</div>
                  )}
                </CDropdownMenu>
              </CDropdown>
              <CNavItem>
                <CNavLink href="#/collaboration/chat" className="action-link">
                  <div className="icon-wrapper">
                    <div
                      style={{
                        width: '24px',
                        height: '24px',
                        backgroundColor: '#4285F4',
                        borderRadius: '50%',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        color: 'white',
                        fontWeight: 'bold',
                        fontSize: '16px',
                      }}
                    >
                      G
                    </div>
                    <CBadge color="success" shape="rounded-pill" position="top-end" size="sm">
                      AI
                    </CBadge>
                  </div>
                  <CTooltip content="Assistant Gemini" placement="bottom">
                    <span className="visually-hidden">Assistant Gemini</span>
                  </CTooltip>
                </CNavLink>
              </CNavItem>
            </CHeaderNav>

            <div className="vr h-100 mx-3 text-white text-opacity-25 d-none d-lg-block"></div>

            <CDropdown variant="nav-item" placement="bottom-end">
              <CDropdownToggle caret={false} className="text-white theme-toggle">
                {colorMode === 'dark' ? (
                  <CIcon icon={cilMoon} size="lg" />
                ) : colorMode === 'auto' ? (
                  <CIcon icon={cilContrast} size="lg" />
                ) : (
                  <CIcon icon={cilSun} size="lg" />
                )}
              </CDropdownToggle>
              <CDropdownMenu>
                <CDropdownItem
                  active={colorMode === 'light'}
                  className="d-flex align-items-center"
                  as="button"
                  type="button"
                  onClick={() => setColorMode('light')}
                >
                  <CIcon className="me-2" icon={cilSun} size="lg" /> Light
                </CDropdownItem>
                <CDropdownItem
                  active={colorMode === 'dark'}
                  className="d-flex align-items-center"
                  as="button"
                  type="button"
                  onClick={() => setColorMode('dark')}
                >
                  <CIcon className="me-2" icon={cilMoon} size="lg" /> Dark
                </CDropdownItem>
                <CDropdownItem
                  active={colorMode === 'auto'}
                  className="d-flex align-items-center"
                  as="button"
                  type="button"
                  onClick={() => setColorMode('auto')}
                >
                  <CIcon className="me-2" icon={cilContrast} size="lg" /> Auto
                </CDropdownItem>
              </CDropdownMenu>
            </CDropdown>

            <div className="vr h-100 mx-3 text-white text-opacity-25"></div>
            <AppHeaderDropdown />
          </div>
        </div>
      </CContainer>
      <CContainer className="px-4 breadcrumb-container" fluid>
        <AppBreadcrumb />
      </CContainer>
    </CHeader>
  )
}

export default AppHeader
