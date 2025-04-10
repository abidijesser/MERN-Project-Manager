import React from 'react'
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CContainer,
  CRow,
  CButton,
} from '@coreui/react'
import axios from '../../utils/axios'
import { useNavigate } from 'react-router-dom'
import { toast } from 'react-toastify'

const DeleteAccount = () => {
  const navigate = useNavigate()

  const handleDeleteAccount = async () => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer votre compte ? Cette action est irréversible.')) {
      try {
        await axios.delete('/api/auth/delete-account')
        localStorage.removeItem('token')
        localStorage.removeItem('user')
        toast.success('Votre compte a été supprimé avec succès')
        navigate('/login')
      } catch (error) {
        console.error('Erreur lors de la suppression du compte:', error)
        toast.error(error.response?.data?.error || 'Erreur lors de la suppression du compte')
      }
    }
  }

  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardHeader>
                <h1>Suppression du compte</h1>
              </CCardHeader>
              <CCardBody className="p-4">
                <h2>Comment supprimer votre compte</h2>
                <p>
                  Si vous souhaitez supprimer votre compte et toutes les données associées, veuillez suivre ces étapes :
                </p>
                <ol>
                  <li>Assurez-vous de vouloir vraiment supprimer votre compte (cette action est irréversible)</li>
                  <li>Sauvegardez toutes les données importantes si nécessaire</li>
                  <li>Cliquez sur le bouton "Supprimer mon compte" ci-dessous</li>
                  <li>Confirmez votre choix dans la fenêtre de dialogue</li>
                </ol>
                <p>
                  <strong>Note importante :</strong> La suppression de votre compte entraînera :
                </p>
                <ul>
                  <li>La suppression permanente de toutes vos données personnelles</li>
                  <li>La perte d'accès à tous vos projets et tâches</li>
                  <li>La déconnexion immédiate de votre compte</li>
                </ul>
                <div className="d-grid gap-2 mt-4">
                  <CButton color="danger" onClick={handleDeleteAccount}>
                    Supprimer mon compte
                  </CButton>
                </div>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default DeleteAccount 