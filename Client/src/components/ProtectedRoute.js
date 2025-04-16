import React, { useEffect, useState } from 'react'
import { Navigate, useLocation } from 'react-router-dom'
import PropTypes from 'prop-types'
import { isAuthenticated, isClient, isAdmin } from '../utils/authUtils'
import { CSpinner } from '@coreui/react'

const ProtectedRoute = ({ children, adminOnly = false }) => {
  const location = useLocation()
  const [loading, setLoading] = useState(true)
  const [authorized, setAuthorized] = useState(false)

  useEffect(() => {
    const checkAuth = async () => {
      try {
        // First check if user is authenticated
        if (!isAuthenticated()) {
          setLoading(false)
          return
        }

        // If adminOnly is true, check if user has admin role
        // Otherwise, check if user has client role
        const hasCorrectRole = adminOnly ? await isAdmin() : await isClient()

        // For debugging, log the role check
        console.log('Role check:', { adminOnly, hasCorrectRole })

        // Temporarily accept all authenticated users
        setAuthorized(true) // Change this back to hasCorrectRole after debugging
        setLoading(false)
      } catch (error) {
        console.error('Error checking authentication:', error)
        setLoading(false)
      }
    }

    checkAuth()
  }, [adminOnly])

  if (loading) {
    return (
      <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
        <CSpinner color="primary" />
      </div>
    )
  }

  if (!isAuthenticated()) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />
  }

  if (!authorized) {
    // Redirect to unauthorized page if role doesn't match
    return <Navigate to="/unauthorized" state={{ from: location }} replace />
  }

  return children
}

ProtectedRoute.propTypes = {
  children: PropTypes.node.isRequired,
  adminOnly: PropTypes.bool,
}

export default ProtectedRoute
