/* eslint-disable prettier/prettier */
import React, { useContext } from 'react'
import { CFooter } from '@coreui/react'
import { UserContext } from '../../context/userContext'

const AppFooter = () => {
  const { user } = useContext(UserContext)
  return (
    <CFooter className="px-4">
      <div>
        <a href="https://coreui.io" target="_blank" rel="noopener noreferrer">
          CoreUI
        </a>
        <span className="ms-1">&copy; 2025 creativeLabs. {user ? user.name : 'Loading user...'} </span>
      </div>
      <div className="ms-auto">
        <span className="me-1">Powered by</span>
        <a href="https://coreui.io/react" target="_blank" rel="noopener noreferrer">
          CoreUI React Admin &amp; Dashboard Template
        </a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
