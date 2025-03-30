const mongoose = require('mongoose')

const notificationSchema = new mongoose.Schema({
  recipient: { type: String, required: true }, // Email ou ID utilisateur
  message: { type: String, required: true },
  type: { type: String, enum: ['email', 'push'], required: true },
  timestamp: { type: Date, default: Date.now },
})

module.exports = mongoose.model('Notification', notificationSchema)
