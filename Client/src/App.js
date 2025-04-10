import React, { Suspense, useEffect } from 'react';
import { HashRouter, Route, Routes } from 'react-router-dom';
import { useSelector } from 'react-redux';
import axios from 'axios';
import { UserContextProvider } from './context/userContext';
import { ChatProvider } from './context/ChatContext';
import { NotificationsProvider } from './context/NotificationsContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import PrivateRoute from './utils/PrivateRoute';

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
const EditProject = React.lazy(() => import('./views/projects/EditProject'));

// Axios configuration
axios.defaults.withCredentials = true;

const App = () => {
  const { isColorModeSet, setColorMode } = useColorModes('coreui-free-react-admin-template-theme');
  const storedTheme = useSelector((state) => state.theme);

  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.href.split('?')[1]);
    const theme = urlParams.get('theme') && urlParams.get('theme').match(/^[A-Za-z0-9\s]+/)[0];
    if (theme) {
      setColorMode(theme);
    }

    if (!isColorModeSet()) {
      setColorMode(storedTheme);
    }
  }, [isColorModeSet, setColorMode, storedTheme]);

  return (
    <>
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
                  <Route path="/login" name="Login Page" element={<Login />} />
                  <Route path="/dashboard" element={<PrivateRoute><DefaultLayout /></PrivateRoute>} />
                  <Route path="/register" name="Register Page" element={<Register />} />
                  <Route path="/404" name="Page 404" element={<Page404 />} />
                  <Route path="/500" name="Page 500" element={<Page500 />} />
                  <Route path="/profile/:id" name="Profile Page" element={<Profile />} />
                  <Route path="/edit-profile/:id" name="Edit Profile Page" element={<EditProfile />} />
                  <Route path="/projects/edit/:id" name="Edit Project" element={<EditProject />} />
                  <Route path="*" name="Home" element={<DefaultLayout />} />
                </Routes>
              </Suspense>
            </HashRouter>
          </NotificationsProvider>
        </ChatProvider>
      </UserContextProvider>
      <ToastContainer />
    </>
  );
};

export default App;