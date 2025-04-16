const express = require("express");
const passport = require("passport");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");

// Import Facebook strategy
require("../config/facebookStrategy");

// Public routes
router.post("/register", authController.register);
router.post("/login", authController.login);

// Protected routes
router.get("/profile", auth, authController.getProfile);
router.get("/profile/:id", auth, authController.getProfileById);
router.put("/profile/:id", auth, authController.updateProfile);
// User management routes
router.get("/users", auth, authController.getAllUsers);
router.get("/users/:id", auth, authController.getUserById);
router.put("/users/:id", auth, authController.updateUser);
router.delete("/users/:id", auth, authController.deleteUser);

// Password routes
router.post("/forgot-password", authController.forgotPassword);
router.post("/reset-password", authController.resetPassword);
router.post("/change-password", auth, authController.changePassword);

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

// Route initiale pour l'authentification Google
googleAuthRouter.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"],
    accessType: "offline",
    prompt: "consent",
  })
);

// Facebook authentication routes
router.get(
  "/facebook",
  passport.authenticate("facebook", {
    scope: ["email", "public_profile"],
  })
);

// Route de callback Google
googleAuthRouter.get(
  "/auth/google/callback",
  passport.authenticate("google", { failureRedirect: "/login" }),
  (req, res) => {
    if (!req.user) {
      console.log("❌ Google auth callback: No user found");
      return res.redirect(
        "http://localhost:3000/#/login?error=authentication_failed"
      );
    }

    console.log("✅ Google auth callback: User authenticated", {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("✅ Token generated, redirecting to dashboard");

    // Redirect to frontend with token
    // Use hash format that works with the client's HashRouter
    res.redirect(`http://localhost:3000/#/auth-redirect?token=${token}`);
  }
);

// Route de callback Facebook
router.get(
  "/facebook/callback",
  passport.authenticate("facebook", { failureRedirect: "/login" }),
  (req, res) => {
    if (!req.user) {
      console.log("❌ Facebook auth callback: No user found");
      return res.redirect(
        "http://localhost:3000/#/login?error=authentication_failed"
      );
    }

    console.log("✅ Facebook auth callback: User authenticated", {
      id: req.user._id,
      email: req.user.email,
      role: req.user.role,
    });

    // Generate JWT token
    const token = jwt.sign(
      { id: req.user._id, email: req.user.email, role: req.user.role },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    console.log("✅ Token generated, redirecting to dashboard");

    // Redirect to frontend with token
    res.redirect(`http://localhost:3000/#/auth-redirect?token=${token}`);
  }
);

module.exports = { authRouter: router, googleAuthRouter };
