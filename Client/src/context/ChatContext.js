import React, { createContext, useState, useEffect } from 'react';
import io from 'socket.io-client';

const ChatContext = createContext();

const socket = io('http://localhost:3000'); // Remplacez par l'URL de votre serveur WebSocket

export const ChatProvider = ({ children }) => {
  const [messages, setMessages] = useState([]);

  useEffect(() => {
    // Écoute les messages entrants
    socket.on('receiveMessage', (message) => {
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    return () => {
      socket.off('receiveMessage');
    };
  }, []);

  const sendMessage = (messageData) => {
    socket.emit('sendMessage', messageData); // Envoie le message au serveur WebSocket
    setMessages((prevMessages) => [...prevMessages, messageData]); // Ajoute localement
  };

  return (
    <ChatContext.Provider value={{ messages, sendMessage }}>
      {children}
    </ChatContext.Provider>
  );
};

export default ChatContext;
