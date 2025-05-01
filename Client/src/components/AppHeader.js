import React, { useEffect, useRef } from 'react'
import { NavLink } from 'react-router-dom'
import { useSelector, useDispatch } from 'react-redux'
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
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import {
  cilBell,
  cilContrast,
  cilEnvelopeOpen,
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
} from '@coreui/icons'

import { AppBreadcrumb } from './index'
import { AppHeaderDropdown } from './header/index'

const AppHeader = () => {
  const headerRef = useRef()
  const { colorMode, setColorMode } = useColorModes('coreui-free-react-admin-template-theme')

  const dispatch = useDispatch()
  const sidebarShow = useSelector((state) => state.sidebarShow)

  useEffect(() => {
    document.addEventListener('scroll', () => {
      headerRef.current &&
        headerRef.current.classList.toggle('shadow-sm', document.documentElement.scrollTop > 0)
    })
  }, [])

  return (
    <CHeader position="sticky" className="mb-4 p-0 app-header" ref={headerRef}>
      <CContainer className="px-4 py-2" fluid>
        <div className="d-flex align-items-center justify-content-between w-100">
          <div className="d-flex align-items-center">
            <div className="app-logo me-4">
              <span className="fw-bold fs-4 text-white">WebTrack</span>
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
              <CNavItem>
                <CNavLink to="/settings" as={NavLink} className="nav-link-custom">
                  <CIcon icon={cilCalculator} className="nav-icon" />
                  <span>Paramètres</span>
                </CNavLink>
              </CNavItem>
            </CHeaderNav>
          </div>

          <div className="d-flex align-items-center">
            <CHeaderNav className="header-actions">
              <CNavItem>
                <CNavLink href="#" className="action-link">
                  <div className="icon-wrapper">
                    <CIcon icon={cilBell} size="lg" />
                    <CBadge color="warning" shape="rounded-pill" position="top-end" size="sm">
                      3
                    </CBadge>
                  </div>
                </CNavLink>
              </CNavItem>
              <CNavItem>
                <CNavLink href="#" className="action-link">
                  <div className="icon-wrapper">
                    <CIcon icon={cilEnvelopeOpen} size="lg" />
                    <CBadge color="warning" shape="rounded-pill" position="top-end" size="sm">
                      5
                    </CBadge>
                  </div>
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
