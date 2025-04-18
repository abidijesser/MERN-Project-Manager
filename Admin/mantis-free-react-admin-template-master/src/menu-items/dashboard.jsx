// assets
import { DashboardOutlined, UserOutlined, TeamOutlined, PieChartOutlined } from '@ant-design/icons';

// icons
const icons = {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined,
  PieChartOutlined
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
      id: 'statistics',
      title: 'Statistics',
      type: 'item',
      url: '/statistics',
      icon: icons.PieChartOutlined,
      breadcrumbs: false
    }
  ]
};

export default dashboard;
