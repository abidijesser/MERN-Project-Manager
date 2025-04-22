const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");
const { authRouter, googleAuthRouter } = require("./routes/authRoutes");
const adminRoutes = require("./routes/admin");
const taskRoutes = require("./routes/taskRoutes");
const projectRoutes = require("./routes/projectRoutes");
const projectsRoutes = require("./routes/projectsRoutes"); // Nouvelle route sans préfixe API
const usersRoutes = require("./routes/usersRoutes"); // Nouvelle route sans préfixe API
const chatRoutes = require("./routes/chat");
const notificationRoutes = require("./routes/notificationRoutes");
const statsRoutes = require("./routes/statsRoutes");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/Message"); // Assurez-vous que le modèle Message existe
require("./config/passportConfig");
require("./config/facebookStrategy");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:5173"],
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

// Mount routes
app.use("/api/auth", authRouter);
app.use("/", googleAuthRouter); // This should be before other routes

app.use("/admin", adminRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/projects", projectsRoutes); // Nouvelle route sans préfixe API
app.use("/users", usersRoutes); // Nouvelle route sans préfixe API
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/stats", statsRoutes);

// Add a simple test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running" });
});

// Add a route to check OAuth configurations
app.get("/api/check-oauth-config", (req, res) => {
  res.json({
    google: {
      clientID: process.env.GOOGLE_CLIENT_ID ? "Configured" : "Missing",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ? "Configured" : "Missing",
      callbackURL: "http://localhost:3001/auth/google/callback",
    },
    facebook: {
      clientID: process.env.FACEBOOK_APP_ID ? "Configured" : "Missing",
      clientSecret: process.env.FACEBOOK_APP_SECRET ? "Configured" : "Missing",
      callbackURL: "http://localhost:3001/api/auth/facebook/callback",
    },
  });
});

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Cloud Database connected"))
  .catch((err) => {
    if (err.code === "ENOTFOUND") {
      console.error("Network error. Please check your internet connection.");
    } else {
      console.error("Database connection error:", err);
    }
  });

const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: ["http://localhost:3000", "http://localhost:5173"],
    methods: ["GET", "POST"],
  },
});

// WebSocket pour le chat
io.on("connection", (socket) => {
  console.log("A user connected");

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
    console.log("User disconnected");
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
