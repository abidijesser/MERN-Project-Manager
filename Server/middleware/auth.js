const jwt = require("jsonwebtoken");
const User = require("../models/User");

// Middleware pour vérifier l'authentification
const auth = async (req, res, next) => {
  try {
    // Get token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Verify and decode token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Get user from database
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    // For Google users, ensure they are verified
    if (user.googleId && !user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    // Add user to request
    req.user = user;
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
};

// Middleware pour vérifier le rôle admin
const isAdmin = async (req, res, next) => {
  try {
    if (req.user.role !== 'Admin') {
      return res.status(403).json({
        success: false,
        error: "Accès non autorisé. Rôle admin requis.",
      });
    }
    next();
  } catch (error) {
    console.error("Admin middleware error:", error);
    res.status(500).json({
      success: false,
      error: "Erreur lors de la vérification du rôle",
    });
  }
};

module.exports = { auth, isAdmin };
