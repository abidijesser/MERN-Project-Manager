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
import axios from 'axios'

const Profile = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    role: '',
  })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem('token')
        if (!token) {
          setError('No authentication token found')
          setLoading(false)
          return
        }

        const response = await axios.get('http://localhost:3001/api/auth/profile', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        })

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
