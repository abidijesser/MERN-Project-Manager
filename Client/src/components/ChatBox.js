import React, { useState, useContext, useEffect, useRef } from 'react';
import ChatContext from '../context/ChatContext';

const ChatBox = () => {
  const { messages, sendMessage } = useContext(ChatContext);
  const [newMessage, setNewMessage] = useState('');
  const messagesEndRef = useRef(null);

  // Envoie un message
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      sendMessage({
        content: newMessage,
        timestamp: new Date(),
      });
      setNewMessage('');
    }
  };

  // Gère les changements dans le champ de texte
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  // Définit une réponse rapide
  const handleQuickReply = (reply) => {
    setNewMessage(reply);
  };

  // Fait défiler jusqu'au bas des messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const quickReplies = ['Aujourd\'hui', 'Demain', 'Cette semaine'];

  return (
    <div className="chatbox-container">
      <div className="chatbox-wrapper">
        {/* En-tête du chatbot */}
        <div className="chatbot-header">
          <img src="/path/to/avatar.png" alt="Chatbot Avatar" className="chatbot-avatar" />
          <h2 className="chatbot-name">Planifier une réunion</h2>
        </div>

        {/* Messages du chat */}
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className="chat-message">
              <span>{msg.content}</span>
              <span className="timestamp">{msg.timestamp.toLocaleTimeString()}</span>
            </div>
          ))}
          <div ref={messagesEndRef} />
        </div>

        {/* Champ de texte et bouton d'envoi */}
        <div className="input-group">
          <input
            type="text"
            placeholder="Écrivez un message..."
            className="input-field"
            value={newMessage}
            onChange={handleInputChange}
          />
          <button onClick={handleSendMessage} className="send-button">Envoyer</button>
        </div>

        {/* Réponses rapides */}
        <div className="quick-replies">
          {quickReplies.map((reply, index) => (
            <button
              key={index}
              className="quick-reply"
              onClick={() => handleQuickReply(reply)}
            >
              {reply}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
