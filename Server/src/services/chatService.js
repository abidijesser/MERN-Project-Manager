const Message = require('../models/Message');

const chatService = {
  // Sauvegarder un nouveau message
  async saveMessage(messageData) {
    const message = new Message({
      projectId: messageData.projectId,
      userId: messageData.userId,
      userName: messageData.userName,
      text: messageData.text,
      timestamp: messageData.timestamp
    });
    return await message.save();
  },

  // Récupérer les messages d'un projet
  async getProjectMessages(projectId) {
    return await Message.find({ projectId })
      .sort({ timestamp: 1 })
      .limit(100); // Limiter à 100 messages pour éviter la surcharge
  }
};

module.exports = chatService; 