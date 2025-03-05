const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();
const cookieParser = require('cookie-parser');

const db = require('./config/db.json');
const authRoutes = require("./routes/authRoutes");
// const adminRoutes = require("./routes/admin");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(
  cors({
      origin: 'http://localhost:3000',
      credentials: true
  })
);

app.use(express.json());
app.use(cookieParser());
app.use(express.urlencoded({ extended: false }));

app.use("/", authRoutes);
// app.use("/admin", adminRoutes);


mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log('Cloud Database connected'))
  .catch((err) => console.log('Databasenot connected:', err));



// mongoose.connect(db.url)
//   .then(() => console.log('Database connected'))
//   .catch((err) => console.log('Error:', err));

app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});

module.exports = app;