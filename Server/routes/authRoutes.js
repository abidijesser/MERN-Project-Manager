const express = require("express");
const passport = require("passport");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");
const { auth, isAdmin } = require('../middleware/auth');

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes
router.get("/profile", auth, authController.getProfile);
router.get("/profile/:id", auth, authController.getProfileById);
router.put("/profile/:id", auth, authController.updateProfile);
router.get("/users", auth, authController.getAllUsers);

// Password reset routes
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);

// Logout route
router.get("/logout", auth, (req, res) => {
  try {
    // Clear the session
    req.session.destroy((err) => {
      if (err) {
        console.error("Error destroying session:", err);
        return res.status(500).json({
          success: false,
          error: "Error during logout",
        });
      }

      // Clear the token from the response
      res.clearCookie("token");

      // Send success response
      res.json({
        success: true,
        message: "Logged out successfully",
      });
    });
  } catch (error) {
    console.error("Logout error:", error);
    res.status(500).json({
      success: false,
      error: "Error during logout",
    });
  }
});

// Email verification
router.get("/verify-email/:token", authController.verifyEmail);

// Google authentication routes
const googleAuthRouter = express.Router();
googleAuthRouter.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

googleAuthRouter.get(
  "/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
<<<<<<< HEAD
    if (!req.user) {
      return res.redirect(
        "http://localhost:3000/#/login?error=authentication_failed"
      );
    }
    // Generate JWT token
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );
    // Redirect to frontend with token
    res.redirect(`http://localhost:3000/#/dashboard?token=${token}`);
  }
);

module.exports = { authRouter: router, googleAuthRouter };
=======
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

      // Stocker le token dans un cookie
      res.cookie("token", token, { 
        httpOnly: true, 
        secure: false, // En production, mettre à true
        sameSite: 'lax',
        maxAge: 3600000 // 1 heure
      });

      // Rediriger directement vers le dashboard en fonction du rôle
      if (req.user.role === 'Admin') {
        res.redirect('http://localhost:3001/free/dashboard');
      } else {
        res.redirect('http://localhost:3000/#/dashboard');
      }
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
>>>>>>> doua
