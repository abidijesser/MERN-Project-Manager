// filepath: c:\Users\Lenovo\Desktop\pi1\MERN-Project-Manager\Client\src\views\pages\profile\profile.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, Link } from 'react-router-dom';
import DefaultLayout from '../../../layout/DefaultLayout';
import { CCard, CCardFooter, CListGroup, CListGroupItem } from '@coreui/react';

const Profile = () => {
  const [user, setUser] = useState(null);
  const { id } = useParams();

  useEffect(() => {
    axios.get(`http://localhost:3001/admin/users/${id}`)
      .then(response => {
        setUser(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the user!', error);
      });
  }, [id]);

  if (!user) {
    return <div>Loading...</div>;
  }

  return (
    <DefaultLayout>
      <div>
        <h1>Profile Page</h1>
        <CCard style={{ width: '18rem' }}>
          <CListGroup flush>
            <CListGroupItem>Name: {user.name}</CListGroupItem>
            <CListGroupItem>Email: {user.email}</CListGroupItem>
            <CListGroupItem>Registered: {user.registered}</CListGroupItem>
            {/* Add more user details as needed */}
          </CListGroup>
          <CCardFooter>
            <Link to={`/edit-profile/${user._id}`}>Edit Profile</Link>
          </CCardFooter>
        </CCard>
      </div>
    </DefaultLayout>
  );
};

export default Profile;