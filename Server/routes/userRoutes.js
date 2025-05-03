const express = require("express");
const router = express.Router();
const userController = require("../controllers/userController");
const auth = require("../middleware/auth");
const { isAdmin } = require("../middleware/roleAuth");

// Routes protégées par authentification
router.use(auth);

// Routes accessibles à tous les utilisateurs authentifiés
router.get("/profile", (req, res) => {
  // Rediriger vers le profil de l'utilisateur connecté
  res.redirect(`/api/users/${req.user.id}`);
});
router.get("/:id", userController.getUserById);

// Routes nécessitant des droits d'administration ou l'utilisateur lui-même
router.put("/:id", (req, res, next) => {
  // Autoriser la modification si c'est l'utilisateur lui-même ou un admin
  if (req.user.id === req.params.id || req.user.role === "Admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    error: "Non autorisé à modifier cet utilisateur",
  });
}, userController.updateUser);

router.put("/:id/password", (req, res, next) => {
  // Autoriser la modification du mot de passe si c'est l'utilisateur lui-même ou un admin
  if (req.user.id === req.params.id || req.user.role === "Admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    error: "Non autorisé à modifier le mot de passe de cet utilisateur",
  });
}, userController.updatePassword);

router.delete("/:id", (req, res, next) => {
  // Autoriser la suppression si c'est l'utilisateur lui-même ou un admin
  if (req.user.id === req.params.id || req.user.role === "Admin") {
    return next();
  }
  return res.status(403).json({
    success: false,
    error: "Non autorisé à supprimer cet utilisateur",
  });
}, userController.deleteUser);

// Routes réservées aux administrateurs
router.get("/", isAdmin, userController.getAllUsers);
router.post("/", isAdmin, userController.createUser);

module.exports = router;
