import React, { useState, useEffect } from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormInput,
  CButton,
} from '@coreui/react'
import { Link } from 'react-router-dom'
import axios from '../../../utils/axios'
import { toast } from 'react-toastify'

const Profile = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    role: '',
    twoFactorEnabled: false,
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [qrCode, setQrCode] = useState('')
  const [verificationCode, setVerificationCode] = useState('')
  const [show2FASetup, setShow2FASetup] = useState(false)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await axios.get('/auth/profile')
        if (response.data.success && response.data.user) {
          setUser(response.data.user)
        } else {
          setError('Failed to load profile data')
        }
      } catch (error) {
        console.error('Error loading profile:', error)
        setError(error.response?.data?.error || 'Error loading profile data')
      } finally {
        setLoading(false)
      }
    }

    fetchProfile()
  }, [])

  const handleEnable2FA = async () => {
    try {
      console.log('Profile - Enabling 2FA')
      console.log('Profile - Token exists:', !!localStorage.getItem('token'))

      // Log the full URL being called
      const url = 'http://localhost:3001/api/auth/generate-2fa'
      console.log('Profile - Calling URL:', url)

      // Use fetch instead of axios for debugging
      const token = localStorage.getItem('token')
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
      })

      console.log('Profile - Response status:', response.status)

      if (response.ok) {
        const data = await response.json()
        console.log('Profile - Response data:', data)

        if (data.success) {
          setQrCode(data.qrCode)
          setShow2FASetup(true)
          toast.success('2FA setup generated successfully')
        } else {
          console.error('Profile - Server returned error:', data.error)
          toast.error(data.error || 'Error generating 2FA setup')
        }
      } else {
        console.error('Profile - HTTP error:', response.status)
        toast.error(`Error ${response.status}: ${response.statusText}`)
      }
    } catch (error) {
      console.error('Profile - Error generating 2FA:', error)
      toast.error('Error generating 2FA setup: ' + error.message)
    }
  }

  const handleVerify2FA = async () => {
    try {
      console.log('Profile - Verifying 2FA code:', verificationCode)

      // Nettoyer le code (supprimer les espaces)
      const cleanCode = verificationCode.toString().replace(/\s+/g, '')
      console.log('Profile - Cleaned 2FA code:', cleanCode)

      // Utiliser fetch pour plus de détails sur la réponse
      const token = localStorage.getItem('token')
      const url = 'http://localhost:3001/api/auth/verify-2fa'
      console.log('Profile - Calling URL:', url)

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ token: cleanCode }),
      })

      console.log('Profile - Verify 2FA response status:', response.status)

      const data = await response.json()
      console.log('Profile - Verify 2FA response data:', data)

      if (data.success) {
        toast.success('2FA enabled successfully')
        setUser((prev) => ({ ...prev, twoFactorEnabled: true }))
        setShow2FASetup(false)
        setVerificationCode('')
      } else {
        console.error('Profile - 2FA verification failed:', data.error)
        toast.error(data.error || 'Invalid verification code')

        // Afficher des informations de débogage si disponibles
        if (data.debug) {
          console.log('Profile - 2FA debug info:', data.debug)
          console.log('Profile - Expected token:', data.debug.expectedToken)
          console.log('Profile - Received token:', data.debug.receivedToken)
        }
      }
    } catch (error) {
      console.error('Profile - Error verifying 2FA:', error)
      toast.error('Error verifying 2FA code: ' + (error.message || 'Unknown error'))
    }
  }

  if (loading) {
    return <div>Loading...</div>
  }

  return (
    <CRow>
      <CCol md={8}>
        <CCard className="mb-4">
          <CCardHeader>
            <h4>Profile</h4>
          </CCardHeader>
          <CCardBody>
            {error && <div className="alert alert-danger">{error}</div>}
            <CForm>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <CFormInput type="text" value={user.name || ''} disabled />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <CFormInput type="email" value={user.email || ''} disabled />
              </div>
              <div className="mb-3">
                <label className="form-label">Role</label>
                <CFormInput type="text" value={user.role || ''} disabled />
              </div>
              <div className="mb-3">
                <label className="form-label">Two-Factor Authentication</label>
                {user.twoFactorEnabled ? (
                  <div className="text-success">Enabled</div>
                ) : (
                  <CButton color="primary" onClick={handleEnable2FA}>
                    Enable 2FA
                  </CButton>
                )}
              </div>
              {show2FASetup && (
                <div className="mb-3">
                  <h5>Setup Two-Factor Authentication</h5>
                  <p>Scan this QR code with your authenticator app:</p>
                  {qrCode && <img src={qrCode} alt="QR Code" />}
                  <div className="mt-3">
                    <CFormInput
                      type="text"
                      placeholder="Enter verification code"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                    />
                    <CButton color="success" className="mt-2" onClick={handleVerify2FA}>
                      Verify
                    </CButton>
                  </div>
                </div>
              )}
              {user._id && (
                <Link to={`/profile/edit/${user._id}`}>
                  <CButton color="primary">Edit Profile</CButton>
                </Link>
              )}
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default Profile
