const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    sender: { type: String, required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
  },
  { collection: "messages" } // Nom de la collection dans la base de données
);

module.exports = mongoose.model("Message", messageSchema);
