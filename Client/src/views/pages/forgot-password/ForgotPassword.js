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
      const response = await axios.post('http://localhost:3001/forgot-password', { email })

      if (response.data.resetUrl) {
        setResetLink(response.data.resetUrl)
        setError('')
      } else {
        setError('Une erreur est survenue')
      }
    } catch (err) {
      setError(err.response?.data?.error || 'Une erreur est survenue')
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

                    {resetLink && (
                      <CAlert color="success">
                        <p>Cliquez sur ce lien pour réinitialiser votre mot de passe :</p>
                        <a href={resetLink} className="alert-link">
                          Réinitialiser mon mot de passe
                        </a>
                      </CAlert>
                    )}

                    <div className="mb-3">
                      <CFormInput
                        type="email"
                        placeholder="Email"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        required
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
