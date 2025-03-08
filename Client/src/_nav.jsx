import React from 'react'
import CIcon from '@coreui/icons-react'
import {
  cilSpeedometer,
  cilChartPie,
} from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  // Summary Group
  {
    component: CNavGroup,
    name: 'Summary',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Dashboard',
        to: '/dashboard',
        icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
        badge: {
          color: 'info',
          text: 'NEW',
        },
      },
      {
        component: CNavItem,
        name: 'Charts',
        to: '/charts',
        icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
      },
      {
        component: CNavItem,
        name: 'Cards',
        to: '/base/cards',
      },
    ],
  },

  // Board Group
  {
    component: CNavGroup,
    name: 'Board',
    icon: <CIcon icon={cilChartPie} customClassName="nav-icon" />,
    items: [
      {
        component: CNavItem,
        name: 'Board Overview',
        to: '/board/overview', // Adjust the path to the actual board page
      },
      {
        component: CNavItem,
        name: 'Board Tasks',
        to: '/board/tasks',  // Adjust the path as necessary
      },
    ],
  },
]

export default _nav
