const express = require('express');
const router = express.Router();
const shareController = require('../controllers/shareController');
const auth = require('../middleware/auth');

// Routes protégées par authentification
router.use(auth);

// Créer un lien de partage pour un document
router.post('/document/:documentId', shareController.createShareLink);

// Obtenir tous les liens de partage pour un document
router.get('/document/:documentId', shareController.getShareLinks);

// Désactiver un lien de partage
router.delete('/:token', shareController.deactivateShareLink);

// Envoyer un lien de partage par email
router.post('/:token/email', shareController.sendShareLinkByEmail);

// Route publique pour valider un lien de partage (pas besoin d'authentification)
router.post('/validate/:token', shareController.validateShareLink);

module.exports = router;
