import React, { useState } from 'react';
import axios from 'axios';
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
} from '@coreui/react';
import CIcon from '@coreui/icons-react';
import { cilTask, cilDescription } from '@coreui/icons';

const CreateProject = () => {
  const [formData, setFormData] = useState({ projectName: '', description: '' });
  const [message, setMessage] = useState('');

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    try {
      const response = await axios.post('http://localhost:3001/createProject', {
        ...formData,
        owner: '67bf10ef6558dfcc43af7fe2', 
      });
      setMessage(response.data);
      setFormData({ projectName: '', description: '' });
    } catch (error) {
      setMessage('Erreur lors de la création du projet');
    }
  };

  return (
    <div className="bg-body-tertiary min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={9} lg={7} xl={6}>
            <CCard className="mx-4">
              <CCardBody className="p-4">
                <CForm onSubmit={handleSubmit}>
                  <h1>Créer un Projet</h1>
                  <p className="text-body-secondary">Remplissez les informations ci-dessous</p>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilTask} />
                    </CInputGroupText>
                    <CFormInput
                      name="projectName"
                      placeholder="Nom du projet"
                      autoComplete="off"
                      value={formData.projectName}
                      onChange={handleChange}
                    />
                  </CInputGroup>

                  <CInputGroup className="mb-3">
                    <CInputGroupText>
                      <CIcon icon={cilDescription} />
                    </CInputGroupText>
                    <CFormTextarea
                      name="description"
                      rows={4}
                      placeholder="Description du projet"
                      autoComplete="off"
                      value={formData.description}
                      onChange={handleChange}
                    />
                  </CInputGroup>

                  <div className="d-grid">
                    <CButton type="submit" color="primary">
                      Créer le Projet
                    </CButton>
                  </div>

                  {message && <p className="mt-3 text-center">{message}</p>}
                </CForm>
              </CCardBody>
            </CCard>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default CreateProject;
