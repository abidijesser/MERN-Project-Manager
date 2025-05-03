const express = require("express");
const passport = require("passport");
const router = express.Router();
const authController = require("../controllers/authController");
const jwt = require("jsonwebtoken");
const { auth, isAdmin } = require('../middleware/auth');

// Existing routes
router.post("/register", authController.register);
router.post("/login", authController.login);
router.get("/profile", authController.getProfile);
router.get("/profile/:id", authController.getProfileById);
router.put("/profile/:id", authController.updateProfile);
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Google authentication routes
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/" }),
  (req, res) => {
    // Générer un token JWT après une connexion réussie
    const token = jwt.sign(
      { id: req.user._id, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // Envoyer le token au frontend via un cookie sécurisé
    res.cookie("token", token, { httpOnly: true, secure: false }); // `secure: true` en production
    res.redirect("http://localhost:3000/#/dashboard");
  }
);

// Facebook authentication routes
router.get(
  "/facebook",
  passport.authenticate("facebook", { scope: ["email"] })
);

router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/" }),
  (req, res) => {
    try {
      // Générer un token JWT après une connexion réussie
      const token = jwt.sign(
        { id: req.user._id, role: req.user.role },
        process.env.JWT_SECRET,
        { expiresIn: "1h" }
      );

      // Stocker le token et les informations utilisateur dans des cookies
      res.cookie("token", token, { 
        httpOnly: true, 
        secure: false, // En production, mettre à true
        sameSite: 'lax',
        maxAge: 3600000 // 1 heure
      });

      // Rediriger vers le dashboard avec les informations utilisateur
      const userInfo = encodeURIComponent(JSON.stringify({
        id: req.user._id,
        name: req.user.name,
        email: req.user.email,
        role: req.user.role
      }));

      res.redirect(`http://localhost:3000/#/dashboard?user=${userInfo}&token=${token}`);
    } catch (error) {
      console.error("Erreur dans le callback Facebook:", error);
      res.redirect("http://localhost:3000/#/login?error=auth_failed");
    }
  }
);

// Logout route
router.post("/logout", auth, (req, res) => {
  try {
    // Supprimer le cookie contenant le token
    res.clearCookie("token");
    
    // Répondre avec succès
    res.json({
      success: true,
      message: "Déconnexion réussie"
    });
  } catch (error) {
    console.error("Erreur lors de la déconnexion:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la déconnexion"
    });
  }
});

// Email verification route
router.get("/verify-email/:token", authController.verifyEmail);

// Test authentication route
router.get("/test-auth", (req, res) => {
  const { token } = req.cookies;
  if (!token) {
    return res.json({ authenticated: false });
  }

  jwt.verify(token, process.env.JWT_SECRET, (err, decoded) => {
    if (err) {
      return res.json({ authenticated: false, error: "Token invalide" });
    }
    res.json({ authenticated: true, user: decoded });
  });
});

// Delete account route
router.delete("/delete-account", auth, authController.deleteAccount);

module.exports = router;