const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/admin");
const taskRoutes = require("./routes/taskRoutes");
const projectRoutes = require("./routes/projectRoutes");
const chatRoutes = require("./routes/chat");
const notificationRoutes = require("./routes/notificationRoutes");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/Message"); // Assurez-vous que le modèle Message existe
require("./config/passportConfig");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: "http://localhost:3000",
    credentials: true,
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Session configuration
app.use(
  session({
    secret: process.env.SESSION_SECRET || "votre_secret",
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: process.env.NODE_ENV === "production",
      maxAge: 24 * 60 * 60 * 1000, // 24 heures
    },
  })
);

app.use(passport.initialize());
app.use(passport.session());

app.use("/", authRoutes);
app.use("/admin", adminRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Cloud Database connected"))
  .catch((err) => {
    if (err.code === 'ENOTFOUND') {
      console.error("DNS error: Unable to resolve MongoDB host. Check your MONGO_URI.");
    } else {
      console.error("Database connection error:", err.message);
    }
    process.exit(1); // Arrête l'application si la connexion échoue
  });

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

// WebSocket pour le chat
io.on("connection", (socket) => {
  console.log("Utilisateur connecté");

  // Écoute des messages envoyés par le client
  socket.on("sendMessage", async (messageData) => {
    try {
      const newMessage = new Message(messageData);
      await newMessage.save(); // Stocke le message en base de données
      io.emit("receiveMessage", messageData); // Diffuse le message à tous les clients
    } catch (err) {
      console.error("Erreur lors de l'enregistrement du message:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("Utilisateur déconnecté");
  });
});

server.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;
