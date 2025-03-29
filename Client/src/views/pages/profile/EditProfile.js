import React, { useEffect, useState } from 'react'
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
import axios from 'axios'
import { useParams, useNavigate } from 'react-router-dom'

const EditProfile = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
  })
  const [error, setError] = useState('')
  const { id } = useParams()
  const navigate = useNavigate()

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await axios.get(`http://localhost:3001/profile/${id}`, {
          withCredentials: true,
        })
        setUser(response.data)
      } catch (err) {
        setError('Error fetching user data')
        console.error(err)
      }
    }
    fetchUser()
  }, [id])

  const handleChange = (e) => {
    const { name, value } = e.target
    setUser((prevState) => ({
      ...prevState,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      await axios.put(`http://localhost:3001/profile/${id}`, user, {
        withCredentials: true,
      })
      navigate('/profile')
    } catch (err) {
      setError('Error updating profile')
      console.error(err)
    }
  }

  return (
    <CRow>
      <CCol md={8}>
        <CCard className="mb-4">
          <CCardHeader>
            <h4>Edit Profile</h4>
          </CCardHeader>
          <CCardBody>
            {error && <div className="alert alert-danger">{error}</div>}
            <CForm onSubmit={handleSubmit}>
              <div className="mb-3">
                <label className="form-label">Name</label>
                <CFormInput
                  type="text"
                  name="name"
                  value={user.name || ''}
                  onChange={handleChange}
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <CFormInput
                  type="email"
                  name="email"
                  value={user.email || ''}
                  onChange={handleChange}
                />
              </div>
              <CButton type="submit" color="primary">
                Save Changes
              </CButton>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  )
}

export default EditProfile
