const express = require("express");
const passport = require("passport");
const router = express.Router();
const authController = require("../controllers/authController");
const jwt = require("jsonwebtoken");

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
    res.redirect("http://localhost:3000/#/dashboard");
  }
);

// Logout route
router.get("/logout", (req, res) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    res.redirect("http://localhost:3000/#/login");
  });
});

// New route
router.get("/verify-email/:token", authController.verifyEmail);

// Ajouter cette route pour tester l'authentification
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

module.exports = router;