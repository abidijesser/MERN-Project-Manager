import React, { useState, useEffect } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import axios from '../../../utils/axios'
import { toast } from 'react-toastify'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  async function handleSubmit(event) {
    event.preventDefault()
    setError('') // Clear any previous errors
    console.log('Attempting to login with email:', email)

    try {
      console.log('Sending login request to:', axios.defaults.baseURL + '/auth/login')
      const response = await axios.post('/auth/login', {
        email: email,
        password: password,
      })

      console.log('Login response:', response.data)

      if (response.data.success) {
        // Store the token in localStorage
        localStorage.setItem('token', response.data.token)
        console.log('Token stored from login')
        // Navigate to dashboard
        navigate('/dashboard')
      } else if (response.data.message === '2FA required') {
        const twoFactorToken = prompt('Enter your 2FA token:')

        console.log('Sending 2FA verification request')
        const finalResponse = await axios.post(
          '/auth/login',
          {
            email: email,
            password: password,
          },
          {
            headers: {
              'x-2fa-token': twoFactorToken,
            },
          },
        )

        console.log('2FA response:', finalResponse.data)

        if (finalResponse.data.success) {
          localStorage.setItem('token', finalResponse.data.token)
          console.log('Token stored from 2FA login')
          navigate('/dashboard')
        } else {
          setError(finalResponse.data.error || 'Login failed')
        }
      }
    } catch (error) {
      console.error('Login error details:', {
        message: error.message,
        response: error.response?.data,
        status: error.response?.status,
      })
      setError(error.response?.data?.error || 'An error occurred during login')
    }
  }

  // Add useEffect to handle token and errors from URL
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search)
    const token = urlParams.get('token')
    const error = urlParams.get('error')

    if (error) {
      toast.error('Authentication failed. Please try again.')
      return
    }

    if (token) {
      localStorage.setItem('token', token)
      navigate('/dashboard')
    }
  }, [navigate])

  const handleGoogleLogin = () => {
    // Clear any existing tokens
    localStorage.removeItem('token')
    // Use the full URL for Google auth since it's a redirect, not an API call
    window.location.href = 'http://localhost:3001/google'
  }

  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-muted">Sign In to your account</p>
                    {error && <div className="alert alert-danger">{error}</div>}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        placeholder="Email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                      />
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton color="primary" className="px-4" type="submit">
                          Login
                        </CButton>
                      </CCol>
                      <CCol xs={6} className="text-right">
                        <Link to="/forgot-password">
                          <CButton color="link" className="px-0">
                            Forgot password?
                          </CButton>
                        </Link>
                      </CCol>
                    </CRow>
                  </CForm>
                  <div className="mt-3">
                    <CButton color="danger" className="w-100" onClick={handleGoogleLogin}>
                      Sign in with Google
                    </CButton>
                  </div>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>
                      Lorem ipsum dolor sit amet, consectetur adipisicing elit, sed do eiusmod
                      tempor incididunt ut labore et dolore magna aliqua.
                    </p>
                    <Link to="/register">
                      <CButton color="primary" className="mt-3" active tabIndex={-1}>
                        Register Now!
                      </CButton>
                    </Link>
                  </div>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default Login
