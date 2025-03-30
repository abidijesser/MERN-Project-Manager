import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'
import Notifications from '../../components/Notifications'
import MeetingScheduler from '../../components/MeetingScheduler'

const socket = io('http://localhost:3000') // Remplacez par l'URL de votre serveur Socket.io

const Collaboration = () => {
  // States
  const [activeTab, setActiveTab] = useState('chat')
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [chatList, setChatList] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  // Effets
  useEffect(() => {
    socket.on('message', (message) => {
      setMessages((prevMessages) => [...prevMessages, message])
    })

    socket.on('chatList', (chats) => {
      setChatList(chats)
    })

    return () => {
      socket.off('message')
      socket.off('chatList')
    }
  }, [])

  // Fonctions
  const sendMessage = () => {
    if (newMessage.trim()) {
      socket.emit('sendMessage', { text: newMessage, timestamp: new Date(), sender: 'me' })
      setMessages((prevMessages) => [
        ...prevMessages,
        { text: newMessage, timestamp: new Date(), sender: 'me' },
      ])
      setNewMessage('')
    }
  }

  const filteredChats = chatList.filter((chat) =>
    chat.toLowerCase().includes(searchTerm.toLowerCase())
  )

  const renderChatTab = () => (
    <div className="chat-tab">
      <div className="chatbox-container">
        <div className="chatbot-sidebar">
          <h2>Discussions</h2>
          <input
            type="text"
            placeholder="Rechercher ..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-bar"
          />
          <ul className="chatbot-list">
            {filteredChats.map((chat, index) => (
              <li key={index} className="chatbot-item">
                <div className="chatbot-avatar">
                  <img src={`https://i.pravatar.cc/40?img=${index + 1}`} alt="Avatar" />
                </div>
                <span>{chat}</span>
              </li>
            ))}
          </ul>
        </div>
        <div className="chat-main">
          <div className="chatbot-messages">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`chatbot-message ${
                  msg.sender === 'me' ? 'my-message' : 'other-message'
                }`}
              >
                <div className="chatbot-message-content">
                  <p>{msg.text}</p>
                  <span className="chatbot-timestamp">
                    {new Date(msg.timestamp).toLocaleTimeString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
          <div className="chatbot-input">
            <input
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Écrire un message..."
              className="input-field"
            />
            <button onClick={sendMessage} className="send-button">
              <span role="img" aria-label="send">
                envoyer
              </span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )

  const renderContent = () => {
    switch (activeTab) {
      case 'chat':
        return renderChatTab()
      case 'notifications':
        return <Notifications />
      case 'scheduler':
        return <MeetingScheduler />
      default:
        return null
    }
  }

  // Rendu principal
  return (
    <div className="chatbot-collaboration-container">
      <div className="chatbot-tabs">
        <button
          onClick={() => setActiveTab('chat')}
          className={`tab-button ${activeTab === 'chat' ? 'active blue-tab' : ''}`}
        >
          Chat
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`tab-button ${activeTab === 'notifications' ? 'active blue-tab' : ''}`}
        >
          Notifications
        </button>
        <button
          onClick={() => setActiveTab('scheduler')}
          className={`tab-button ${activeTab === 'scheduler' ? 'active blue-tab' : ''}`}
        >
          Planifier une Réunions
        </button>
      </div>
      <div className="chatbot-container">
        {renderContent()}
      </div>
    </div>
  )
}

export default Collaboration
