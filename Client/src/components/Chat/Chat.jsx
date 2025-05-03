import React, { useState, useEffect, useRef } from 'react';
import { io } from 'socket.io-client';
import { Box, TextField, Button, Paper, Typography, List, ListItem, ListItemText, Avatar, Alert, Snackbar } from '@mui/material';
import SendIcon from '@mui/icons-material/Send';

const getAvatarColor = (name) => {
  // Simple hash for color
  const colors = ['#1976d2', '#388e3c', '#fbc02d', '#d32f2f', '#7b1fa2', '#0288d1', '#c2185b'];
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const Chat = ({ projectId }) => {
  // Récupérer l'utilisateur depuis localStorage
  let user = null;
  try {
    user = JSON.parse(localStorage.getItem('user'));
  } catch (e) {
    user = null;
  }
  if (!user) {
    // fallback sur les autres clés
    const userId = localStorage.getItem('userId');
    const userName = localStorage.getItem('userName');
    const userEmail = localStorage.getItem('userEmail');
    if (userId && (userName || userEmail)) {
      user = {
        _id: userId,
        name: userName,
        email: userEmail
      };
    }
  }
  console.log('DEBUG Chat.jsx - user from localStorage:', user);

  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [error, setError] = useState(null);
  const [isAuthorized, setIsAuthorized] = useState(true);
  const socketRef = useRef();
  const messagesEndRef = useRef(null);

  if (!user) {
    return (
      <div>
        Utilisateur non connecté ou informations utilisateur manquantes.<br />
        <pre>{JSON.stringify(localStorage.getItem('user'), null, 2)}</pre>
      </div>
    );
  }

  useEffect(() => {
    socketRef.current = io('http://localhost:3001', {
      query: { projectId, userId: user._id }
    });

    // Gérer les erreurs d'autorisation
    socketRef.current.on('error', (errorData) => {
      console.error('Socket error:', errorData);
      setError(errorData.message);

      // Si l'erreur concerne l'autorisation, désactiver l'interface de chat
      if (errorData.message.includes('not authorized')) {
        setIsAuthorized(false);
      }
    });

    // Rejoindre la room du projet
    socketRef.current.emit('joinRoom', `project-${projectId}`);

    socketRef.current.on('messages', (msgs) => {
      console.log('Historique reçu:', msgs);
      setMessages(msgs);
    });

    socketRef.current.on('message', (message) => {
      console.log('Message reçu du serveur:', message);
      setMessages((prevMessages) => [...prevMessages, message]);
    });

    socketRef.current.emit('getMessages', projectId);

    return () => {
      socketRef.current.disconnect();
    };
  }, [projectId, user._id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (newMessage.trim()) {
      const message = {
        projectId,
        content: newMessage,  // Changed from text to content to match server model
        sender: user._id,     // Changed from userId to sender to match server model
        senderName: user.name || user.email || 'Utilisateur', // Changed from userName to senderName
        timestamp: new Date(),
        type: 'user'
      };
      socketRef.current.emit('sendMessage', message);
      setNewMessage('');
    }
  };

  // Gérer l'affichage des erreurs
  const handleCloseError = () => {
    setError(null);
  };

  return (
    <Box sx={{ height: 350, display: 'flex', flexDirection: 'column', background: '#232733', borderRadius: 2, boxShadow: 2, p: 1 }}>
      <Typography variant="h6" sx={{ color: '#fff', mb: 1, textAlign: 'center' }}>Chat du projet</Typography>

      {/* Afficher un message d'erreur si l'utilisateur n'est pas autorisé */}
      {!isAuthorized ? (
        <Alert severity="error" sx={{ mb: 2 }}>
          Vous n'êtes pas autorisé à participer à ce chat. Seuls les membres du projet peuvent communiquer entre eux.
        </Alert>
      ) : (
        <>
          <Paper elevation={0} sx={{ flexGrow: 1, overflow: 'auto', mb: 1, background: 'transparent' }}>
            <List>
              {messages.map((message, index) => {
                const isMe = message.sender === user._id;
                return (
                  <ListItem
                    key={index}
                    alignItems="flex-start"
                    sx={{
                      flexDirection: isMe ? 'row-reverse' : 'row',
                      textAlign: isMe ? 'right' : 'left',
                      mb: 0.5
                    }}
                  >
                    <Avatar sx={{ bgcolor: getAvatarColor(message.senderName || 'User'), ml: isMe ? 2 : 0, mr: isMe ? 0 : 2 }}>
                      {(message.senderName || 'U')[0]}
                    </Avatar>
                    <ListItemText
                      primary={
                        <Typography sx={{ fontWeight: isMe ? 'bold' : 'normal', color: isMe ? '#90caf9' : '#fff' }}>
                          {message.senderName}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography component="span" variant="body2" color={isMe ? '#90caf9' : '#b0bec5'}>
                            {message.content}
                          </Typography>
                          <Typography variant="caption" display="block" color="#b0bec5">
                            {new Date(message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </Typography>
                        </>
                      }
                      sx={{ maxWidth: 320, ml: isMe ? 'auto' : 0, mr: isMe ? 0 : 'auto', bgcolor: isMe ? '#1565c0' : '#374151', borderRadius: 2, p: 1, color: '#fff' }}
                    />
                  </ListItem>
                );
              })}
              <div ref={messagesEndRef} />
            </List>
          </Paper>
          <Box component="form" onSubmit={handleSendMessage} sx={{ display: 'flex', gap: 1, mt: 1 }}>
            <TextField
              fullWidth
              variant="outlined"
              placeholder="Type a message..."
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              sx={{ bgcolor: '#fff', borderRadius: 1 }}
              disabled={!isAuthorized}
            />
            <Button
              type="submit"
              variant="contained"
              color="primary"
              endIcon={<SendIcon />}
              disabled={!isAuthorized}
            >
              Send
            </Button>
          </Box>
        </>
      )}

      {/* Snackbar pour afficher les erreurs */}
      <Snackbar open={!!error} autoHideDuration={6000} onClose={handleCloseError}>
        <Alert onClose={handleCloseError} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Chat;