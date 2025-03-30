/* eslint-disable prettier/prettier */
import React, { useContext } from 'react'
import { CFooter } from '@coreui/react'
import { UserContext } from '../../context/userContext'

const AppFooter = () => {
  const { user } = useContext(UserContext)
  return (
    <CFooter className="px-4">
      <div>
        <a href="#" target="_blank" rel="noopener noreferrer">
          WorkTrack
        </a>
        <span className="ms-1">&copy; 2025 creativeLabs. {user ? user.name : 'Loading user...'} </span>
      </div>
      <div>
        <span>Contactez-nous : </span>
        <span>Téléphone : +216 72 454 227</span> | 
        <a href="https://facebook.com" target="_blank" rel="noopener noreferrer"> Facebook</a> | 
        <a href="https://instagram.com" target="_blank" rel="noopener noreferrer"> Instagram</a>
      </div>
    </CFooter>
  )
}

export default React.memo(AppFooter)
