import React, { useState, useEffect } from 'react'
import './Notifications.css' // Assurez-vous de créer ce fichier CSS pour les styles

const Notifications = () => {
  const [notifications, setNotifications] = useState([])

  useEffect(() => {
    const interval = setInterval(() => {
      const newNotification = {
        id: Date.now(),
        avatar: '/assets/chatbot-avatar.png', // Assurez-vous que ce fichier existe
        name: 'Chatbot',
        message: `Nouvelle alerte à ${new Date().toLocaleTimeString()}`,
      }
      setNotifications((prev) => [...prev, newNotification])
      playNotificationSound()
    }, 10000) // Ajoute une notification toutes les 10 secondes

    return () => clearInterval(interval)
  }, [])

  const playNotificationSound = () => {
    const audio = new Audio('/assets/notification.wav') // Assurez-vous que ce fichier existe
    audio.play()
  }

  return (
    <div className="notifications-container">
      <h2>Notifications</h2>
      <ul className="notifications-list">
        {notifications.map((notification) => (
          <li key={notification.id} className="notification-item">
            <img
              src={notification.avatar}
              alt="Avatar"
              className="notification-avatar"
            />
            <div className="notification-content">
              <span className="notification-name">{notification.name}</span>
              <p className="notification-message">{notification.message}</p>
              <div className="quick-replies">
                <button className="reply-button">👍</button>
                <button className="reply-button">👎</button>
                <button className="reply-button">Répondre</button>
              </div>
            </div>
          </li>
        ))}
      </ul>
      
    </div>
  )
}

export default Notifications
