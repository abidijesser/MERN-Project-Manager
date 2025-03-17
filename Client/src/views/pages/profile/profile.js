// filepath: c:\Users\Lenovo\Desktop\pi1\MERN-Project-Manager\Client\src\views\pages\profile\profile.js
import React, { useState, useEffect } from 'react';
import {
  CCard,
  CCardBody,
  CCardHeader,
  CCol,
  CRow,
  CForm,
  CFormInput,
  CButton,
} from '@coreui/react';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    role: '',
  });

  useEffect(() => {
    // Charger les données du profil
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:3001/profile', {
          withCredentials: true,
        });
        if (response.data) {
          setUser(response.data);
        }
      } catch (error) {
        console.error('Erreur lors du chargement du profil:', error);
      }
    };

    fetchProfile();
  }, []);

  return (
    <CRow>
      <CCol md={8}>
        <CCard className="mb-4">
          <CCardHeader>
            <h4>Profile</h4>
          </CCardHeader>
          <CCardBody>
            <CForm>
              <div className="mb-3">
                <label className="form-label">Nom</label>
                <CFormInput
                  type="text"
                  value={user.name || ''}
                  disabled
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Email</label>
                <CFormInput
                  type="email"
                  value={user.email || ''}
                  disabled
                />
              </div>
              <div className="mb-3">
                <label className="form-label">Rôle</label>
                <CFormInput
                  type="text"
                  value={user.role || ''}
                  disabled
                />
              </div>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Profile;