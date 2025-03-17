// filepath: c:\Users\Lenovo\Desktop\pi1\MERN-Project-Manager\Client\src\views\pages\profile\EditProfile.js
import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useParams, useNavigate } from 'react-router-dom';
import DefaultLayout from '../../../layout/DefaultLayout';

const EditProfile = () => {
  const [user, setUser] = useState({
    name: '',
    email: '',
    registered: ''
  });
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`http://localhost:3001/admin/users/${id}`)
      .then(response => {
        setUser(response.data);
      })
      .catch(error => {
        console.error('There was an error fetching the user!', error);
      });
  }, [id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setUser(prevState => ({
      ...prevState,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    axios.put(`http://localhost:3001/admin/users/${id}`, user)
      .then(response => {
        console.log('Profile updated successfully');
        navigate(`/profile/${id}`);
      })
      .catch(error => {
        console.error('There was an error updating the profile!', error);
      });
  };

  return (
    <DefaultLayout>
      <div>
        <h1>Edit Profile</h1>
        <form onSubmit={handleSubmit}>
          <div>
            <label>Name:</label>
            <input
              type="text"
              name="name"
              value={user.name}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Email:</label>
            <input
              type="email"
              name="email"
              value={user.email}
              onChange={handleChange}
            />
          </div>
          <div>
            <label>Registered:</label>
            <input
              type="text"
              name="registered"
              value={user.registered}
              onChange={handleChange}
            />
          </div>
          <button type="submit">Save</button>
        </form>
      </div>
    </DefaultLayout>
  );
};

export default EditProfile;