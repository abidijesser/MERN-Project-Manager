// assets
import {
  DashboardOutlined,
  UserOutlined,
  ProjectOutlined,
  FileTextOutlined,
  BarChartOutlined,
  CalendarOutlined,
  FileImageOutlined
} from '@ant-design/icons';

// icons
const icons = {
  DashboardOutlined,
  UserOutlined,
  ProjectOutlined,
  FileTextOutlined,
  BarChartOutlined,
  CalendarOutlined,
  FileImageOutlined
};

// ==============================|| MENU ITEMS - DASHBOARD ||============================== //

const dashboard = {
  id: 'group-dashboard',
  title: 'Navigation',
  type: 'group',
  children: [
    {
      id: 'dashboard',
      title: 'Dashboard',
      type: 'item',
      url: '/dashboard/default',
      icon: icons.DashboardOutlined,
      breadcrumbs: false
    },
    {
      id: 'user-management',
      title: 'User Management',
      type: 'item',
      url: '/user-management',
      icon: icons.UserOutlined,
      breadcrumbs: false
    },
    {
      id: 'project-management',
      title: 'Project Management',
      type: 'item',
      url: '/project-management',
      icon: icons.ProjectOutlined,
      breadcrumbs: false
    },
    {
      id: 'task-management',
      title: 'Task Management',
      type: 'item',
      url: '/task-management',
      icon: icons.FileTextOutlined,
      breadcrumbs: false
    },
    {
      id: 'statistics',
      title: 'Statistics',
      type: 'item',
      url: '/statistics',
      icon: icons.BarChartOutlined,
      breadcrumbs: false
    },
    {
      id: 'calendar-sync',
      title: 'Calendar Sync',
      type: 'item',
      url: '/calendar-sync',
      icon: icons.CalendarOutlined,
      breadcrumbs: false
    },
    {
      id: 'media',
      title: 'Media Management',
      type: 'item',
      url: '/media',
      icon: icons.FileImageOutlined,
      breadcrumbs: false
    }
  ]
};

export default dashboard;
