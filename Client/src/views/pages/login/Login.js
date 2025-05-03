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
  CFormSelect,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilLockLocked, cilUser } from '@coreui/icons'
import axios from '../../../utils/axios'
import { toast } from 'react-toastify'

const Login = () => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState('Client')
  const [error, setError] = useState('')
  const navigate = useNavigate()

  useEffect(() => {
    // Récupérer les paramètres de l'URL
    const params = new URLSearchParams(window.location.hash.split('?')[1]);
    const userInfo = params.get('user');
    const token = params.get('token');
    const error = params.get('error');

    if (token && userInfo) {
      try {
        // Stocker le token
        localStorage.setItem('token', token);
        // Stocker les informations utilisateur
        localStorage.setItem('user', userInfo);
        
        const user = JSON.parse(decodeURIComponent(userInfo));
        
        toast.success('Connexion réussie !');
        
        // Rediriger en fonction du rôle
        if (user.role === 'Admin') {
          window.location.href = 'http://localhost:3001/free';
        } else {
          navigate('/dashboard');
        }
      } catch (err) {
        console.error('Erreur lors du traitement des informations de connexion:', err);
        toast.error('Erreur lors de la connexion');
      }
    } else if (error) {
      toast.error('Erreur lors de la connexion avec Facebook');
    }
  }, [navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        password,
        role,
      })

      console.log('Réponse login:', response.data)

      if (response.data.error) {
        setError(response.data.error)
        return
      }

      if (response.data.token) {
        // Stocker le token JWT
        localStorage.setItem('token', response.data.token)
        // Stocker les informations utilisateur
        localStorage.setItem('user', JSON.stringify(response.data.user))
        toast.success('Connexion réussie !')
        
        // Rediriger en fonction du rôle
        if (response.data.user.role === 'Admin') {
          window.location.href = 'http://localhost:3001/free'
        } else {
          navigate('/dashboard')
        }
      } else {
        setError('Token non reçu')
      }
    } catch (err) {
      console.error('Erreur de connexion:', err)
      const errorMessage = err.response?.data?.error || 'Erreur lors de la connexion'
      setError(errorMessage)
      toast.error(errorMessage)
    }
  }

  const handleGoogleLogin = () => {
    window.location.href = 'http://localhost:3001/api/auth/google'
  }

  const handleFacebookLogin = () => {
    window.location.href = 'http://localhost:3001/api/auth/facebook'
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={8}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Login</h1>
                    <p className="text-body-secondary">Sign In to your account</p>
                    {error && <p className="text-danger">{error}</p>}
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilUser} />
                      </CInputGroupText>
                      <CFormInput
                        type="email"
                        placeholder="Email"
                        autoComplete="email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-3">
                      <CInputGroupText>
                        <CIcon icon={cilLockLocked} />
                      </CInputGroupText>
                      <CFormInput
                        type="password"
                        placeholder="Password"
                        autoComplete="current-password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                      />
                    </CInputGroup>
                    <CInputGroup className="mb-4">
                      <CInputGroupText>Role</CInputGroupText>
                      <CFormSelect
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        required
                      >
                        <option value="Client">Client</option>
                        <option value="Admin">Admin</option>
                      </CFormSelect>
                    </CInputGroup>
                    <CRow>
                      <CCol xs={6}>
                        <CButton type="submit" color="primary" className="px-4">
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
                    <CButton 
                      color="danger" 
                      className="w-100 mb-2"
                      onClick={handleGoogleLogin}
                    >
                      Se connecter avec Google
                    </CButton>
                    <CButton 
                      color="primary" 
                      className="w-100"
                      onClick={handleFacebookLogin}
                    >
                      Se connecter avec Facebook
                    </CButton>
                  </div>
                </CCardBody>
              </CCard>
              <CCard className="text-white bg-primary py-5" style={{ width: '44%' }}>
                <CCardBody className="text-center">
                  <div>
                    <h2>Sign up</h2>
                    <p>
                      Créez votre compte pour accéder à toutes les fonctionnalités de gestion de projet.
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
