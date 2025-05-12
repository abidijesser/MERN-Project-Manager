const mongoose = require("mongoose");

const messageSchema = new mongoose.Schema(
  {
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now },
    type: { type: String, enum: ["user", "bot", "meeting", "project"], default: "user" },
    sender: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // User ID of the sender
    senderName: { type: String }, // Display name of the sender
    room: { type: String }, // Room identifier (e.g., meeting-123)
    id: { type: String }, // Optional unique ID for the message
    projectId: { type: mongoose.Schema.Types.ObjectId, ref: "Project" }, // Project ID for project chat messages
  },
  {
    collection: "messages", // Collection name in the database
    timestamps: true, // Add createdAt and updatedAt fields
  }
);

module.exports = mongoose.model("Message", messageSchema);
