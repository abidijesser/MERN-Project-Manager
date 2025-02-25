var express = require('express');
var router = express.Router();
const User = require('../models/User');
// Ensure the Batiment model is imported correctly
const userController = require('../controllers/UserController');

router.post('/register', userController.addUser);
router.post('/login', userController.login);

module.exports = router;