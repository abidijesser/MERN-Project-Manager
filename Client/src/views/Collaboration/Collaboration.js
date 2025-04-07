import React, { useState, useEffect } from 'react'
import io from 'socket.io-client'
import { useLocation } from 'react-router-dom'
import Notifications from '../../components/Notifications'
import MeetingScheduler from '../../components/MeetingScheduler'
import ChatBox from '../../components/ChatBox'
import { FaComments, FaBell, FaCalendarAlt } from 'react-icons/fa'

const socket = io('http://localhost:3000') // Remplacez par l'URL de votre serveur Socket.io

const Collaboration = () => {
  const location = useLocation()
  const [activeTab, setActiveTab] = useState('chat')
  const [messages, setMessages] = useState([])
  const [newMessage, setNewMessage] = useState('')
  const [chatList, setChatList] = useState([])
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    const params = new URLSearchParams(location.search)
    const tab = params.get('tab')
    if (tab) {
      setActiveTab(tab)
    }
  }, [location.search])

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
    <div className="collaboration-chat-container">
      <div className="chat-sidebar">
        <div className="sidebar-header">
          <h2>Discussions</h2>
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="search-input"
          />
        </div>
        <div className="chat-list">
          {filteredChats.map((chat, index) => (
            <div key={index} className="chat-item">
              <div className="chat-avatar">
                <img src={`https://i.pravatar.cc/40?img=${index + 1}`} alt="Avatar" />
              </div>
              <div className="chat-info">
                <span className="chat-name">{chat}</span>
                <span className="chat-status">En ligne</span>
              </div>
            </div>
          ))}
        </div>
      </div>
      <div className="chat-main">
        <ChatBox />
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
    <div className="collaboration-container">
      <div className="collaboration-tabs">
        <button
          onClick={() => setActiveTab('chat')}
          className={`tab-button ${activeTab === 'chat' ? 'active' : ''}`}
        >
          <FaComments className="tab-icon" />
          <span>Chat</span>
        </button>
        <button
          onClick={() => setActiveTab('notifications')}
          className={`tab-button ${activeTab === 'notifications' ? 'active' : ''}`}
        >
          <FaBell className="tab-icon" />
          <span>Notifications</span>
        </button>
        <button
          onClick={() => setActiveTab('scheduler')}
          className={`tab-button ${activeTab === 'scheduler' ? 'active' : ''}`}
        >
          <FaCalendarAlt className="tab-icon" />
          <span>Planifier une Réunion</span>
        </button>
      </div>
      <div className="collaboration-content">
        {renderContent()}
      </div>
    </div>
  )
}

export default Collaboration
