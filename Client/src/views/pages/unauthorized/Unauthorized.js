import React from 'react';
import { Link } from 'react-router-dom';
import {
  CButton,
  CCol,
  CContainer,
  CRow,
} from '@coreui/react';

const Unauthorized = () => {
  return (
    <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
      <CContainer>
        <CRow className="justify-content-center">
          <CCol md={6}>
            <div className="clearfix">
              <h1 className="float-start display-3 me-4">403</h1>
              <h4 className="pt-3">Unauthorized</h4>
              <p className="text-medium-emphasis float-start">
                You do not have permission to access this page.
              </p>
            </div>
            <CRow className="mt-4">
              <CCol xs={6}>
                <Link to="/login">
                  <CButton color="primary" className="px-4">
                    Back to Login
                  </CButton>
                </Link>
              </CCol>
              <CCol xs={6} className="text-end">
                <Link to="/dashboard">
                  <CButton color="info" className="px-4">
                    Dashboard
                  </CButton>
                </Link>
              </CCol>
            </CRow>
          </CCol>
        </CRow>
      </CContainer>
    </div>
  );
};

export default Unauthorized;
