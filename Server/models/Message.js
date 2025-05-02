const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ['user', 'bot'], required: true },
    sender: { type: String }, // Optionnel, pour compatibilité avec le code existant
    id: { type: String } // ID unique pour le message
  },
  { collection: "messages" } // Nom de la collection dans la base de données
);

module.exports = mongoose.model("Message", messageSchema);
