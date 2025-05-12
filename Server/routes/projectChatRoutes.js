const express = require('express');
const router = express.Router();
const projectChatController = require('../controllers/projectChatController');
const auth = require('../middleware/auth');

// Appliquer le middleware d'authentification à toutes les routes
router.use(auth);

// Récupérer les messages d'un projet
router.get('/:projectId', projectChatController.getProjectMessages);

// Créer un nouveau message dans un projet
router.post('/', projectChatController.createProjectMessage);

module.exports = router;
