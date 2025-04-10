import React, { useState, useContext, useEffect, useRef } from 'react';
import { FaPaperPlane, FaSmile, FaRobot, FaMicrophone, FaPaperclip } from 'react-icons/fa';
import ChatContext from '../context/ChatContext';
import './ChatBox.css';

const ChatBox = () => {
  const { messages, sendMessage } = useContext(ChatContext);
  const [newMessage, setNewMessage] = useState('');
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [isTyping, setIsTyping] = useState(false);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);

  // Liste simple d'emojis
  const commonEmojis = ['😊', '👍', '❤️', '🙏', '👋', '🎉', '🔥', '✨', '💪', '👏'];

  // Envoie un message
  const handleSendMessage = () => {
    if (newMessage.trim()) {
      setIsTyping(true);
      sendMessage({
        content: newMessage,
        timestamp: new Date(),
        type: 'user'
      });
      setNewMessage('');
      
      // Simuler une réponse du bot
      setTimeout(() => {
        sendMessage({
          content: "Je suis votre assistant virtuel. Comment puis-je vous aider ?",
          timestamp: new Date(),
          type: 'bot'
        });
        setIsTyping(false);
      }, 1000);
    }
  };

  // Gère les changements dans le champ de texte
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  // Gère l'envoi avec la touche Entrée
  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  // Gère la sélection d'emoji
  const handleEmojiClick = (emoji) => {
    setNewMessage(prev => prev + emoji);
    setShowEmojiPicker(false);
  };

  // Gère le téléchargement de fichiers
  const handleFileUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Ici, vous pouvez implémenter la logique de téléchargement de fichiers
      console.log('File selected:', file.name);
    }
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

  const quickReplies = ['Aujourd\'hui', 'Demain', 'Cette semaine', 'Plus tard'];

  return (
    <div className="chatbox-container">
      <div className="chatbox-wrapper">
        {/* En-tête du chatbot */}
        <div className="chatbot-header">
          <div className="chatbot-header-left">
            <FaRobot className="chatbot-icon" />
            <h2 className="chatbot-name">Assistant Virtuel</h2>
          </div>
          <div className="chatbot-header-right">
            <span className="status-indicator online"></span>
            <span className="status-text">En ligne</span>
          </div>
        </div>

        {/* Messages du chat */}
        <div className="chat-messages">
          {messages.map((msg, index) => (
            <div key={index} className={`chat-message ${msg.type}`}>
              <div className="message-content">
                <span className="message-text">{msg.content}</span>
                <span className="timestamp">
                  {new Date(msg.timestamp).toLocaleTimeString([], { 
                    hour: '2-digit', 
                    minute: '2-digit' 
                  })}
                </span>
              </div>
            </div>
          ))}
          {isTyping && (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
          <div ref={messagesEndRef} />
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

        {/* Zone de saisie */}
        <div className="input-group">
          <button 
            className="action-button"
            onClick={() => setShowEmojiPicker(!showEmojiPicker)}
          >
            <FaSmile />
          </button>
          {showEmojiPicker && (
            <div className="emoji-picker-container">
              <div className="emoji-grid">
                {commonEmojis.map((emoji, index) => (
                  <button
                    key={index}
                    className="emoji-button"
                    onClick={() => handleEmojiClick(emoji)}
                  >
                    {emoji}
                  </button>
                ))}
              </div>
            </div>
          )}
          <button 
            className="action-button"
            onClick={() => fileInputRef.current?.click()}
          >
            <FaPaperclip />
          </button>
          <input
            type="file"
            ref={fileInputRef}
            onChange={handleFileUpload}
            style={{ display: 'none' }}
          />
          <textarea
            placeholder="Écrivez un message..."
            className="input-field"
            value={newMessage}
            onChange={handleInputChange}
            onKeyPress={handleKeyPress}
            rows="1"
          />
          <button 
            className="action-button"
            onClick={() => {/* Implémenter l'enregistrement vocal */}}
          >
            <FaMicrophone />
          </button>
          <button 
            className="send-button"
            onClick={handleSendMessage}
            disabled={!newMessage.trim()}
          >
            <FaPaperPlane />
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBox;
