// filepath: c:\Users\Lenovo\Desktop\pi1\MERN-Project-Manager\Client\src\layout\DefaultLayout.js
import React, { useEffect } from 'react'
import { useLocation } from 'react-router-dom'
import { AppContent, AppSidebar, AppFooter, AppHeader } from '../components/index'

const DefaultLayout = ({ children }) => {
  const location = useLocation()

  useEffect(() => {
    // Check if there's a token in the URL
    const searchParams = new URLSearchParams(location.search)
    const hashParams = new URLSearchParams(location.hash.split('?')[1] || '')

    // Try to get token from various sources
    const token =
      searchParams.get('token') || hashParams.get('token') || localStorage.getItem('clientToken')

    if (token) {
      // Store the token in localStorage
      localStorage.setItem('token', token)
      // Clear the temporary clientToken if it exists
      localStorage.removeItem('clientToken')

      console.log('Token stored from URL parameters')
    }
  }, [location])

  return (
    <div>
      <AppSidebar />
      <div className="wrapper d-flex flex-column min-vh-100">
        <AppHeader />
        <div className="body flex-grow-1 px-3">{children || <AppContent />}</div>
        <AppFooter />
      </div>
    </div>
  )
}

export default DefaultLayout
