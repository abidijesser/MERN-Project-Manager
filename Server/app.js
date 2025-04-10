const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();
const cookieParser = require("cookie-parser");
const passport = require("passport");
const session = require("express-session");
<<<<<<< HEAD
const { authRouter, googleAuthRouter } = require("./routes/authRoutes");
=======
const path = require("path");
const http = require("http");
const { Server } = require("socket.io");
const authRoutes = require("./routes/authRoutes");
>>>>>>> doua
const adminRoutes = require("./routes/admin");
const taskRoutes = require("./routes/taskRoutes");
const projectRoutes = require("./routes/projectRoutes");
const chatRoutes = require("./routes/chat");
const notificationRoutes = require("./routes/notificationRoutes");
const Message = require("./models/Message");
const { auth, isAdmin } = require("./middleware/auth");
const passportConfig = require("./config/passportConfig"); // Import passport configuration

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
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

<<<<<<< HEAD
// Mount Google Auth routes under /auth
app.use("/auth", googleAuthRouter);

// Mount other Auth routes under /api/auth
app.use("/api/auth", authRouter);

app.use("/admin", adminRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/projects", projectRoutes);
app.use("/api/chat", chatRoutes);
app.use("/api/notifications", notificationRoutes);

// Add a simple test route
app.get("/api/test", (req, res) => {
  res.json({ message: "Server is running" });
});

=======
// Routes publiques
app.use("/api/auth", authRoutes);

// Routes API protégées
app.use("/api/tasks", auth, taskRoutes);
app.use("/api/projects", auth, projectRoutes);
app.use("/api/chat", auth, chatRoutes);
app.use("/api/notifications", auth, notificationRoutes);

// Routes admin protégées
app.use("/api/admin", auth, isAdmin, adminRoutes);

// Static files for Admin
app.use('/free', express.static(path.join(__dirname, '../Admin/dist')));
app.use('/free/assets', express.static(path.join(__dirname, '../Admin/dist/assets')));

// Static files for Client
app.use('/', express.static(path.join(__dirname, '../Client/build')));

// Handle React routing for Admin
app.get('/free/*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Admin/dist/index.html'));
});

// Handle React routing for Client
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../Client/build/index.html'));
});

// MongoDB connection
>>>>>>> doua
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("Cloud Database connected"))
  .catch((err) => {
<<<<<<< HEAD
    if (err.code === "ENOTFOUND") {
      console.error("Network error. Please check your internet connection.");
    } else {
      console.error("Database connection error:", err);
    }
=======
    console.error("Database connection error:", err.message);
    process.exit(1);
>>>>>>> doua
  });

// WebSocket configuration
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
});

io.on("connection", (socket) => {
  console.log("A user connected");

  socket.on("sendMessage", async (messageData) => {
    try {
      const newMessage = new Message(messageData);
      await newMessage.save();
      io.emit("receiveMessage", messageData);
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