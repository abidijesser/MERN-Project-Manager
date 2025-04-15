// assets
import { DashboardOutlined, UserOutlined, TeamOutlined } from '@ant-design/icons';

// icons
const icons = {
  DashboardOutlined,
  UserOutlined,
  TeamOutlined
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
    }
  ]
};

export default dashboard;
