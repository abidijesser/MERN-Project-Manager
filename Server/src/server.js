const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const socketIo = require('socket.io');
const chatService = require('./services/chatService');

const app = express();
const server = http.createServer(app);
const io = socketIo(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"]
  }
});

// Middleware
app.use(cors());
app.use(express.json());

// Connexion à MongoDB
mongoose.connect('mongodb://localhost:27017/project-manager', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

// Gestion des connexions Socket.IO
io.on('connection', (socket) => {
  console.log('New client connected');

  // Rejoindre une room spécifique au projet
  socket.on('joinProject', (projectId) => {
    socket.join(projectId);
  });

  // Envoyer un message
  socket.on('sendMessage', async (message) => {
    try {
      const savedMessage = await chatService.saveMessage(message);
      io.to(message.projectId).emit('message', savedMessage);
    } catch (error) {
      console.error('Error saving message:', error);
    }
  });

  // Récupérer les messages d'un projet
  socket.on('getMessages', async (projectId) => {
    try {
      const messages = await chatService.getProjectMessages(projectId);
      socket.emit('messages', messages);
    } catch (error) {
      console.error('Error fetching messages:', error);
    }
  });

  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});

// Routes API
// ... (vos routes existantes)

const PORT = process.env.PORT || 5000;
server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
}); 