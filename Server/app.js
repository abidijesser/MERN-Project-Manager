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
const chatRoutes = require("./routes/chat");
const geminiRoutes = require("./routes/gemini");
const notificationRoutes = require("./routes/notificationRoutes");
const statsRoutes = require("./routes/statsRoutes");
const statisticsRoutes = require("./routes/statisticsRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const calendarRoutes = require("./routes/calendarRoutes");
const commentRoutes = require("./routes/commentRoutes");
const activityLogRoutes = require("./routes/activityLogRoutes");
const mediaRoutes = require("./routes/mediaRoutes");
const documentRoutes = require("./routes/documentRoutes");
const shareRoutes = require("./routes/shareRoutes");
const http = require("http");
const { Server } = require("socket.io");
const Message = require("./models/Message"); // Assurez-vous que le modèle Message existe
const notificationService = require("./services/notificationService");
require("./config/passportConfig");
require("./config/facebookStrategy");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
    ],
    credentials: true,
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "x-request-id"], // Ajout de 'x-request-id'
  })
);
app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

// Serve static files from the public directory
app.use("/public", express.static("public"));

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
app.use("/api/chat", chatRoutes);
app.use("/api/gemini", geminiRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/stats", statsRoutes);
app.use("/api/statistics", statisticsRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/calendar", calendarRoutes);
app.use("/api/comments", commentRoutes);
app.use("/api/activity", activityLogRoutes);
app.use("/api/media", mediaRoutes);
app.use("/api/documents", documentRoutes);
app.use("/api/share", shareRoutes);
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
    origin: [
      "http://localhost:3000",
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "http://127.0.0.1:3000",
    ],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    credentials: true,
    allowedHeaders: ["Content-Type", "Authorization", "x-request-id"], // Ajout de 'x-request-id'
  },
});

// Initialize notification service with Socket.io
notificationService.initializeSocketIO(io);

// WebSocket implementation
io.on("connection", (socket) => {
  console.log("A user connected:", socket.id);

  // Join rooms for specific projects and tasks
  socket.on("joinRoom", (room) => {
    console.log(`Socket ${socket.id} joining room: ${room}`);
    socket.join(room);
  });

  // Leave rooms
  socket.on("leaveRoom", (room) => {
    console.log(`Socket ${socket.id} leaving room: ${room}`);
    socket.leave(room);
  });

  // Listen for chat messages
  socket.on("sendMessage", async (messageData) => {
    try {
      const newMessage = new Message(messageData);
      await newMessage.save(); // Store message in database
      io.emit("receiveMessage", messageData); // Broadcast to all clients
    } catch (err) {
      console.error("Error saving message:", err);
    }
  });

  // Listen for new comments
  socket.on("newComment", async (commentData) => {
    try {
      console.log("New comment received:", commentData);

      // Broadcast to the appropriate room
      if (commentData.taskId) {
        io.to(`task-${commentData.taskId}`).emit("commentAdded", commentData);
      } else if (commentData.projectId) {
        io.to(`project-${commentData.projectId}`).emit(
          "commentAdded",
          commentData
        );
      } else if (commentData.documentId) {
        io.to(`document-${commentData.documentId}`).emit(
          "commentAdded",
          commentData
        );
      }
    } catch (err) {
      console.error("Error processing comment:", err);
    }
  });

  // Listen for activity logs
  socket.on("newActivity", (activityData) => {
    try {
      console.log("New activity received:", activityData);

      // Broadcast to appropriate rooms
      if (activityData.task) {
        io.to(`task-${activityData.task}`).emit("activityAdded", activityData);
      }

      if (activityData.project) {
        io.to(`project-${activityData.project}`).emit(
          "activityAdded",
          activityData
        );
      }

      if (activityData.document) {
        io.to(`document-${activityData.document}`).emit(
          "activityAdded",
          activityData
        );
      }

      // Broadcast to all clients for dashboard updates
      io.emit("activityUpdated", activityData);
    } catch (err) {
      console.error("Error processing activity:", err);
    }
  });

  socket.on("disconnect", () => {
    console.log("User disconnected:", socket.id);
  });
});

server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});

module.exports = app;
