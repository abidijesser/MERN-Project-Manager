const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 5174;

// Middleware
app.use(cors({
  origin: ['http://localhost:3000', 'http://localhost:5173'],
  credentials: true
}));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// Serve static files
app.use(express.static(path.join(__dirname, 'dist')));

// Auth transfer endpoint
app.post('/auth-transfer', (req, res) => {
  console.log('Auth transfer request received');
  console.log('Token:', req.body.token ? 'exists' : 'missing');
  console.log('Role:', req.body.role);
  
  // Redirect to dashboard with token and role as query parameters
  res.redirect(`/dashboard/default?token=${encodeURIComponent(req.body.token)}&role=${encodeURIComponent(req.body.role)}`);
});

// Handle all other requests
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

// Start server
app.listen(PORT, () => {
  console.log(`Auth transfer server running on port ${PORT}`);
});
