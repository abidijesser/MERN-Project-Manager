// assets
import {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  PieChartOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
  CalendarOutlined,
  FileImageOutlined
} from '@ant-design/icons';

// icons
const icons = {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  PieChartOutlined,
  ProjectOutlined,
  CheckSquareOutlined,
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
      icon: icons.TeamOutlined,
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
      icon: icons.CheckSquareOutlined,
      breadcrumbs: false
    },
    {
      id: 'statistics',
      title: 'Statistics',
      type: 'item',
      url: '/statistics',
      icon: icons.PieChartOutlined,
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
