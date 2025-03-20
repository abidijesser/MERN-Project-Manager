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
import { Link } from 'react-router-dom';
import axios from 'axios';

const Profile = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    role: '',
  });

  useEffect(() => {
    // Load profile data
    const fetchProfile = async () => {
      try {
        const response = await axios.get('http://localhost:3001/profile', {
          withCredentials: true,
        });
        if (response.data) {
          setUser(response.data);
        }
      } catch (error) {
        console.error('Error loading profile:', error);
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
                <label className="form-label">Name</label>
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
                <label className="form-label">Role</label>
                <CFormInput
                  type="text"
                  value={user.role || ''}
                  disabled
                />
              </div>
              <Link to={`/profile/edit/${user._id}`}>
                <CButton color="primary">Edit Profile</CButton>
              </Link>
            </CForm>
          </CCardBody>
        </CCard>
      </CCol>
    </CRow>
  );
};

export default Profile;