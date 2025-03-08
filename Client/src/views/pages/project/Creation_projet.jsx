import React from 'react'
import {
  CButton,
  CCard,
  CCardBody,
  CCol,
  CContainer,
  CForm,
  CFormInput,
  CFormTextarea,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react'
import CIcon from '@coreui/icons-react'
import { cilTask, cilDescription } from '@coreui/icons'

const CreateProject = () => {
  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm>
                  <h1>Créer un Projet</h1>
                  <p className="text-body-secondary">Remplissez les informations ci-dessous</p>
                  
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilTask} />
                    </CInputGroupText>
                    <CFormInput placeholder="Nom du projet" autoComplete="off" />
                  </CInputGroup>
                  
                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilDescription} />
                    </CInputGroupText>
                    <CFormTextarea rows={4} placeholder="Description du projet" autoComplete="off" />
                  </CInputGroup>
                  
                  <div className="d-grid">
                    <CButton color="primary">Créer le Projet</CButton>
                  </div>
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  )
}

export default CreateProject