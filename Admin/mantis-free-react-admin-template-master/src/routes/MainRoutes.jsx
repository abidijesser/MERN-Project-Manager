import { lazy } from 'react';

// project imports
import Loadable from 'components/Loadable';
import DashboardLayout from 'layout/Dashboard';
import ProtectedRoute from 'components/ProtectedRoute';
import AuthVerifier from 'components/AuthVerifier';

// render- Dashboard
const DashboardDefault = Loadable(lazy(() => import('pages/dashboard/default')));

// render - color
const Color = Loadable(lazy(() => import('pages/component-overview/color')));
const Typography = Loadable(lazy(() => import('pages/component-overview/typography')));
const Shadow = Loadable(lazy(() => import('pages/component-overview/shadows')));

// render - sample page
const SamplePage = Loadable(lazy(() => import('pages/extra-pages/sample-page')));

// render - user management
const UserManagement = Loadable(lazy(() => import('pages/user-management')));

// render - project management
const ProjectManagement = Loadable(lazy(() => import('pages/project-management')));

// render - profile
const ProfilePage = Loadable(lazy(() => import('pages/profile')));

// render - statistics
const StatisticsPage = Loadable(lazy(() => import('pages/statistics')));

// render - task management
const TaskManagement = Loadable(lazy(() => import('pages/task-management')));

// render - calendar sync
const CalendarSync = Loadable(lazy(() => import('pages/calendar-sync')));

// render - media management
const MediaManagement = Loadable(lazy(() => import('pages/media')));

// ==============================|| MAIN ROUTING ||============================== //

const MainRoutes = {
  path: '/',
  element: (
    <AuthVerifier>
      <DashboardLayout />
    </AuthVerifier>
  ),
  children: [
    {
      path: '/',
      element: <DashboardDefault />
    },
    {
      path: 'dashboard',
      children: [
        {
          path: 'default',
          element: <DashboardDefault />
        }
      ]
    },
    {
      path: 'typography',
      element: <Typography />
    },
    {
      path: 'color',
      element: <Color />
    },
    {
      path: 'shadow',
      element: <Shadow />
    },
    {
      path: 'sample-page',
      element: <SamplePage />
    },
    {
      path: 'user-management',
      element: <UserManagement />
    },
    {
      path: 'project-management',
      element: <ProjectManagement />
    },
    {
      path: 'profile',
      element: <ProfilePage />
    },
    {
      path: 'statistics',
      element: <StatisticsPage />
    },
    {
      path: 'task-management',
      element: <TaskManagement />
    },
    {
      path: 'calendar-sync',
      element: <CalendarSync />
    },
    {
      path: 'media',
      element: <MediaManagement />
    }
  ]
};

export default MainRoutes;
