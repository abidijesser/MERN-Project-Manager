import React, { useState } from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CRow,
  CAlert,
} from '@coreui/react'
import axios from 'axios'

const ForgotPassword = () => {
  const [email, setEmail] = useState('')
  const [resetLink, setResetLink] = useState('')
  const [error, setError] = useState('')

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const response = await axios.post('http://localhost:3001/api/auth/forgot-password', { email })

      if (response.data.success) {
        setError('')
        setResetLink(
          response.data.message ||
            'Un email de réinitialisation a été envoyé à votre adresse email.',
        )
      } else {
        setError(response.data.error || 'Une erreur est survenue')
        setResetLink('')
      }
    } catch (err) {
      setError(err.response?.data?.error || "Une erreur est survenue lors de l'envoi de l'email")
      setResetLink('')
    }
  }

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <CCardGroup>
              <CCard className="p-4">
                <CCardBody>
                  <CForm onSubmit={handleSubmit}>
                    <h1>Mot de passe oublié</h1>
                    <p className="text-body-secondary">
                      Entrez votre email pour réinitialiser votre mot de passe
                    </p>

                    {error && <CAlert color="danger">{error}</CAlert>}

                    {resetLink && <CAlert color="success">{resetLink}</CAlert>}

                    <div className="mb-3">
                      <CFormInput
                        type="email"
                        id="forgotPasswordEmail"
                        name="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
                        autoComplete="email"
                      />
                    </div>

                    <CButton color="primary" type="submit">
                      Envoyer le lien
                    </CButton>
                  </CForm>
                </CCardBody>
              </CCard>
            </CCardGroup>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default ForgotPassword
