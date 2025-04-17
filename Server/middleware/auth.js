const jwt = require("jsonwebtoken");
const User = require("../models/User");
const speakeasy = require("speakeasy");

module.exports = async (req, res, next) => {
  try {
    console.log("Auth middleware - Request path:", req.path);
    console.log("Auth middleware - Method:", req.method);
    console.log("Auth middleware - Headers:", req.headers);

    // Log request body for status update requests
    if (req.path.includes("/status") && req.method === "PUT") {
      console.log(
        "Auth middleware - Request body for status update:",
        req.body
      );
    }

    // Get token from Authorization header
    const token = req.headers.authorization?.split(" ")[1];
    console.log("Auth middleware - Token exists:", !!token);

    if (!token) {
      console.log("Auth middleware - No token provided");
      return res.status(401).json({
        success: false,
        error: "Authentication required",
      });
    }

    // Verify and decode token
    console.log("Auth middleware - Verifying token");
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("Auth middleware - Token decoded:", decoded);

    // Get user from database
    console.log("Auth middleware - Finding user with ID:", decoded.id);
    const user = await User.findById(decoded.id);

    if (!user) {
      console.log("Auth middleware - User not found");
      return res.status(401).json({
        success: false,
        error: "User not found",
      });
    }

    console.log("Auth middleware - User found:", {
      id: user._id,
      email: user.email,
      role: user.role,
    });

    // For Google or Facebook users, ensure they are verified
    if ((user.googleId || user.facebookId) && !user.isVerified) {
      user.isVerified = true;
      await user.save();
    }

    // Note: We no longer check 2FA token for every request
    // 2FA is only verified during login
    // This comment is kept to document the change

    // Add user to request
    req.user = user;
    console.log(
      "Auth middleware - Authentication successful for user:",
      user.email
    );
    console.log("Auth middleware - User role:", user.role);
    console.log(
      "Auth middleware - 2FA enabled:",
      user.twoFactorEnabled || false
    );
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res
        .status(401)
        .json({ success: false, error: "Token has expired" });
    }
    console.error("Auth middleware error:", error);
    res.status(401).json({
      success: false,
      error: "Invalid token",
    });
  }
};
