// filepath: c:\Users\Lenovo\Desktop\pi1\MERN-Project-Manager\Client\src\App.js
import React, { Suspense, useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { UserContextProvider } from './context/userContext';
import { ChatProvider } from './context/ChatContext';
import { NotificationsProvider } from './context/NotificationsContext';
import ChatBox from './components/ChatBox';
import MeetingScheduler from './components/MeetingScheduler';
import Notifications from './components/Notifications';

axios.defaults.withCredentials = true;

import { CSpinner, useColorModes } from '@coreui/react';
import './scss/style.scss';

// Containers
const DefaultLayout = React.lazy(() => import('./layout/DefaultLayout'));

// Pages
const Login = React.lazy(() => import('./views/pages/login/Login'));
const Register = React.lazy(() => import('./views/pages/register/Register'));
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'));
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'));
const Profile = React.lazy(() => import('./views/pages/profile/Profile'));
const EditProfile = React.lazy(() => import('./views/pages/profile/EditProfile'));

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme');
  const storedTheme = useSelector((state) => state.theme);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1]);
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0];
    if (theme) {
      setColorMode(theme);
    }

    if (isColorModeSet()) {
      return;
    }

    setColorMode(storedTheme);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <UserContextProvider>
      <ChatProvider>
        <NotificationsProvider>
          <HashRouter>
            <Suspense
              fallback={
                <div className="pt-3 text-center">
                  <CSpinner color="primary" variant="grow" />
                </div>
              }
            >
              <Routes>
                <Route exact path="/login" name="Login Page" element={<Login />} />
                <Route exact path="/register" name="Register Page" element={<Register />} />
                <Route exact path="/404" name="Page 404" element={<Page404 />} />
                <Route exact path="/500" name="Page 500" element={<Page500 />} />
                <Route exact path="/profile/:id" name="Profile Page" element={<Profile />} />
                <Route exact path="/edit-profile/:id" name="Edit Profile Page" element={<EditProfile />} />
                <Route path="*" name="Home" element={<DefaultLayout />} />
              </Routes>
            </Suspense>
          </HashRouter>
          
        </NotificationsProvider>
      </ChatProvider>
    </UserContextProvider>
  );
};

export default App;