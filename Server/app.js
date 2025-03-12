const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const db = require('./config/db.json');
const userRoutes = require("./routes/user");

const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());

// Routes
app.use("/", userRoutes);

// Connect to MongoDB
//mongoose.connect(db.url)
 // .then(() => console.log('Database connected'))
  //.catch((err) => console.log('Error:', err));

  mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Cloud Database connected'))
  .catch((err) => console.log('Databasenot connected:', err));
// Start the server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;