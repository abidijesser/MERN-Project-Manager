// filepath: c:\Users\Lenovo\Desktop\pi1\MERN-Project-Manager\Client\src\routes.js
import React from 'react';
import Profile from './views/pages/profile/Profile'

const Dashboard = React.lazy(() => import('./views/dashboard/Dashboard'));
const Login = React.lazy(() => import('./views/pages/login/Login'));
const Register = React.lazy(() => import('./views/pages/register/Register'));
const Page404 = React.lazy(() => import('./views/pages/page404/Page404'));
const Page500 = React.lazy(() => import('./views/pages/page500/Page500'));
const EditProfile = React.lazy(() => import('./views/pages/profile/EditProfile'));
const UserDetails = React.lazy(() => import('./views/pages/userDetails/UserDetails'));

const routes = [
  { path: '/', exact: true, name: 'Home' },
  { path: '/dashboard', name: 'Dashboard', element: Dashboard },
  { path: '/login', name: 'Login', element: Login },
  { path: '/register', name: 'Register', element: Register },
  { path: '/404', name: 'Page 404', element: Page404 },
  { path: '/500', name: 'Page 500', element: Page500 },
  { path: '/profile', name: 'Profile', element: Profile },
  { path: '/edit-profile/:id', name: 'Edit Profile', element: EditProfile },
  { path: '/user-details/:id', name: 'User Details', element: UserDetails },
];

export default routes;