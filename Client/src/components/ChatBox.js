import React, { useState, useContext, useEffect, useRef } from 'react';
import { FaPaperPlane, FaSmile, FaRobot, FaMicrophone, FaPaperclip } from 'react-icons/fa';
import ChatContext from '../context/ChatContext';
import { sendMessageToGemini, testGeminiConnection } from '../services/geminiService';
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
  const handleSendMessage = async () => {
    if (newMessage.trim()) {
      setIsTyping(true);
      // Envoyer le message de l'utilisateur
      // Utiliser local: true pour éviter les doublons
      sendMessage({
        content: newMessage,
        timestamp: new Date(),
        type: 'user',
        local: true
      });

      const userMessage = newMessage;
      setNewMessage('');

      try {
        // Obtenir une réponse de Gemini
        const response = await sendMessageToGemini(userMessage);

        // Envoyer la réponse de Gemini
        sendMessage({
          content: response.content,
          timestamp: new Date(),
          type: 'bot',
          local: true
        });
      } catch (error) {
        console.error('Error getting response from Gemini:', error);
        // Envoyer un message d'erreur
        sendMessage({
          content: "Désolé, je n'ai pas pu traiter votre demande. Veuillez réessayer plus tard.",
          timestamp: new Date(),
          type: 'bot',
          local: true
        });
      } finally {
        setIsTyping(false);
      }
    }
  };

  // Gère les changements dans le champ de texte
  const handleInputChange = (e) => {
    setNewMessage(e.target.value);
  };

  // Gère l'envoi avec la touche Entrée
  const handleKeyDown = (e) => {
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

  // Tester la connexion à l'API Gemini au chargement
  useEffect(() => {
    const testConnection = async () => {
      try {
        const result = await testGeminiConnection();
        if (result.success) {
          console.log('Gemini API connection successful:', result.message);
          // Afficher un message de bienvenue avec mention des questions prédéfinies
          sendMessage({
            content: "Bonjour ! Je suis l'Assistant Gemini. Je peux vous aider avec vos projets et tâches. Vous pouvez me poser des questions ou utiliser les boutons rapides ci-dessous pour obtenir des informations sur vos tâches d'aujourd'hui, les projets en retard, les membres disponibles ou comment ajouter une nouvelle tâche.",
            timestamp: new Date(),
            type: 'bot',
            local: true
          });
        } else {
          console.error('Gemini API connection failed:', result.error);
          sendMessage({
            content: "Désolé, je ne peux pas me connecter à l'API Gemini en ce moment. Veuillez réessayer plus tard.",
            timestamp: new Date(),
            type: 'bot',
            local: true
          });
        }
      } catch (error) {
        console.error('Error testing Gemini connection:', error);
      }
    };

    testConnection();
  }, []);

  const quickReplies = [
    'Quelles sont mes tâches aujourd\'hui ?',
    'Quels projets sont en retard ?',
    'Qui est disponible dans l\'équipe ?',
    'Comment ajouter une nouvelle tâche ?'
  ];

  return (
    <div className="chatbox-container">
      <div className="chatbox-wrapper">
        {/* En-tête du chatbot */}
        <div className="chatbot-header">
          <div className="chatbot-header-left">
            <FaRobot className="chatbot-icon" />
            <h2 className="chatbot-name">Assistant Gemini</h2>
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
            onKeyDown={handleKeyDown}
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
