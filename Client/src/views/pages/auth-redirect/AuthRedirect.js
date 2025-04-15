import React, { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CSpinner } from '@coreui/react'

const AuthRedirect = () => {
  const navigate = useNavigate()

  useEffect(() => {
    // Function to get URL parameters from hash
    const getHashParams = () => {
      const params = {}

      // Try different ways to extract parameters
      // Method 1: From hash fragment after ?
      let hash = ''
      if (window.location.hash.includes('?')) {
        hash = window.location.hash.split('?')[1] || ''
      }

      // Method 2: From search params
      const searchParams = new URLSearchParams(window.location.search)
      if (searchParams.has('token')) {
        params.token = searchParams.get('token')
        return params
      }

      // Method 3: From hash fragment
      if (!hash) {
        // If no query string in hash, try to parse the hash itself
        const hashParts = window.location.hash.split('/')
        const lastPart = hashParts[hashParts.length - 1]
        if (lastPart.includes('=')) {
          hash = lastPart
        }
      }

      if (!hash) return params

      const pairs = hash.split('&')

      for (let i = 0; i < pairs.length; i++) {
        const pair = pairs[i].split('=')
        if (pair.length === 2) {
          params[decodeURIComponent(pair[0])] = decodeURIComponent(pair[1] || '')
        }
      }

      return params
    }

    const handleRedirect = () => {
      // Try to get token from hash parameters
      const hashParams = getHashParams()
      console.log('Hash params:', hashParams)

      // Check for token in various places
      const token =
        hashParams.token || localStorage.getItem('clientToken') || localStorage.getItem('token')

      console.log('Token found:', !!token)

      if (token) {
        // Store the token in localStorage
        localStorage.setItem('token', token)
        // Clear the temporary clientToken if it exists
        localStorage.removeItem('clientToken')

        // Redirect to dashboard
        navigate('/dashboard')
      } else {
        // If no token is found, redirect to login
        navigate('/login')
      }
    }

    // Log the current URL for debugging
    console.log('Current URL:', window.location.href)

    // Execute the redirect logic
    handleRedirect()
  }, [navigate])

  return (
    <div className="d-flex justify-content-center align-items-center" style={{ height: '100vh' }}>
      <CSpinner color="primary" />
      <p className="ms-2">Redirecting...</p>
    </div>
  )
}

export default AuthRedirect
