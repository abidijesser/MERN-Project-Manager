// const User = require('../models/User');
// const router = express.Router();
// const adminController = require('../controllers/adminController');

// router.get('/allUsers', adminController.gellAllusers);// filepath: c:\Users\Lenovo\Desktop\pi1\MERN-Project-Manager\Server\routes\adminRoutes.js
const express = require('express');
const { getAllUsers } = require('../controllers/adminController');
const router = express.Router();

router.get('/users', getAllUsers);

module.exports = router;