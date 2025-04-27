import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  CAvatar,
  CBadge,
  CDropdown,
  CDropdownDivider,
  CDropdownHeader,
  CDropdownItem,
  CDropdownMenu,
  CDropdownToggle,
  CProgress,
} from '@coreui/react'
import { cilSettings, cilTask, cilUser, cilAccountLogout, cilCalendar } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { toast } from 'react-toastify'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()
  const [userName, setUserName] = useState('User')
  const [userRole, setUserRole] = useState('Client')

  useEffect(() => {
    // Get user name from localStorage
    const storedName = localStorage.getItem('userName')
    if (storedName) {
      setUserName(storedName)
    }

    // Get user role from localStorage
    const storedRole = localStorage.getItem('userRole')
    if (storedRole) {
      setUserRole(storedRole)
    }
  }, [])

  const handleLogout = async () => {
    try {
      console.log('Logout - Starting logout process')
      const token = localStorage.getItem('token')

      // Clear local storage first to ensure the user is logged out even if the server request fails
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('userName')
      localStorage.removeItem('userRole')

      // Show success message
      toast.success('Déconnexion réussie')

      // Try to call the server logout endpoint, but don't wait for it
      if (token) {
        try {
          console.log('Logout - Calling server logout endpoint')
          await fetch('http://localhost:3001/api/auth/logout', {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          })
          console.log('Logout - Server logout successful')
        } catch (serverError) {
          // Ignore server errors since we've already cleared local storage
          console.log('Logout - Server logout failed, but local logout successful')
          console.error('Server logout error:', serverError)
        }
      }

      // Navigate to login page
      console.log('Logout - Redirecting to login page')
      navigate('/login')
    } catch (error) {
      console.error('Logout error:', error)

      // Ensure logout even if there's an error
      localStorage.removeItem('token')
      localStorage.removeItem('user')
      localStorage.removeItem('userName')
      localStorage.removeItem('userRole')

      toast.error('Erreur lors de la déconnexion, mais vous avez été déconnecté')
      navigate('/login')
    }
  }

  const handleProfileClick = () => {
    navigate('/profile')
  }

  // Get user initials for avatar
  const getUserInitials = () => {
    if (!userName) return 'U'
    const nameParts = userName.split(' ')
    if (nameParts.length > 1) {
      return `${nameParts[0].charAt(0)}${nameParts[1].charAt(0)}`.toUpperCase()
    }
    return userName.charAt(0).toUpperCase()
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar color="light" size="md" className="text-primary border border-2 border-white">
          {getUserInitials()}
        </CAvatar>
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end" style={{ minWidth: '250px' }}>
        <CDropdownHeader className="bg-gradient-primary text-white d-flex flex-column align-items-center p-3">
          <CAvatar
            color="light"
            size="lg"
            className="mb-2 text-primary border border-2 border-white"
          >
            {getUserInitials()}
          </CAvatar>
          <div className="fw-semibold">{userName}</div>
          <div className="text-white-50 small">{userRole}</div>

          <div className="w-100 mt-2">
            <div className="d-flex justify-content-between mb-1 small">
              <span>Profile Completion</span>
              <span>75%</span>
            </div>
            <CProgress value={75} thin color="light" />
          </div>
        </CDropdownHeader>

        <CDropdownItem onClick={handleProfileClick}>
          <CIcon icon={cilUser} className="me-2 text-primary" />
          My Profile
        </CDropdownItem>
        <CDropdownItem href="/tasks">
          <CIcon icon={cilTask} className="me-2 text-info" />
          My Tasks
          <CBadge color="info" className="ms-2">
            5
          </CBadge>
        </CDropdownItem>
        <CDropdownItem href="/calendar">
          <CIcon icon={cilCalendar} className="me-2 text-success" />
          Calendar
        </CDropdownItem>
        <CDropdownItem href="/settings">
          <CIcon icon={cilSettings} className="me-2 text-secondary" />
          Settings
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem onClick={handleLogout} className="text-danger">
          <CIcon icon={cilAccountLogout} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
