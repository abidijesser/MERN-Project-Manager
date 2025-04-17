import React from 'react'
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
} from '@coreui/react'
import {
  cilBell,
  cilCreditCard,
  cilCommentSquare,
  cilEnvelopeOpen,
  cilFile,
  cilLockLocked,
  cilSettings,
  cilTask,
  cilUser,
  cilAccountLogout,
} from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import axios from 'axios'
import { toast } from 'react-toastify'

import avatar8 from './../../assets/images/avatars/8.jpg'

const AppHeaderDropdown = () => {
  const navigate = useNavigate()

  const handleLogout = async () => {
    try {
      console.log('Logout - Starting logout process')
      const token = localStorage.getItem('token')

      // Clear local storage first to ensure the user is logged out even if the server request fails
      localStorage.removeItem('token')
      localStorage.removeItem('user')

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

      toast.error('Erreur lors de la déconnexion, mais vous avez été déconnecté')
      navigate('/login')
    }
  }

  const handleProfileClick = () => {
    navigate('/profile')
  }

  return (
    <CDropdown variant="nav-item">
      <CDropdownToggle placement="bottom-end" className="py-0 pe-0" caret={false}>
        <CAvatar src={avatar8} size="md" />
      </CDropdownToggle>
      <CDropdownMenu className="pt-0" placement="bottom-end">
        <CDropdownHeader className="bg-body-secondary fw-semibold mb-2">Account</CDropdownHeader>

        <CDropdownHeader className="bg-body-secondary fw-semibold my-2">Settings</CDropdownHeader>
        <CDropdownItem onClick={handleProfileClick}>
          <CIcon icon={cilUser} className="me-2" />
          Profile
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilSettings} className="me-2" />
          Settings
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilCreditCard} className="me-2" />
          Payments
          <CBadge color="secondary" className="ms-2">
            42
          </CBadge>
        </CDropdownItem>
        <CDropdownItem href="#">
          <CIcon icon={cilFile} className="me-2" />
          Projects
          <CBadge color="primary" className="ms-2">
            42
          </CBadge>
        </CDropdownItem>
        <CDropdownDivider />
        <CDropdownItem onClick={handleLogout}>
          <CIcon icon={cilAccountLogout} className="me-2" />
          Logout
        </CDropdownItem>
      </CDropdownMenu>
    </CDropdown>
  )
}

export default AppHeaderDropdown
