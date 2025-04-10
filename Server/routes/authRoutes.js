const express = require("express");
const passport = require("passport");
const router = express.Router();
const authController = require("../controllers/authController");
const auth = require("../middleware/auth");
const jwt = require("jsonwebtoken");

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
