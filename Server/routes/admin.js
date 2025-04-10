// filepath: c:\Users\Lenovo\Desktop\pi1\MERN-Project-Manager\Server\routes\adminRoutes.js
const express = require('express');
const { getAllUsers, getUserById, updateUserById } = require('../controllers/adminController');
const { auth, isAdmin } = require('../middleware/auth');
const router = express.Router();

// Protéger toutes les routes admin avec auth et isAdmin
router.use(auth);
router.use(isAdmin);

router.get('/users', getAllUsers);
router.get('/users/:id', getUserById);
router.put('/users/:id', updateUserById);

module.exports = router;