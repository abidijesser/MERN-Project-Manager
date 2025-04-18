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

    // Check if 2FA is enabled and verify the token
    if (user.twoFactorEnabled) {
      const twoFactorToken = req.headers["x-2fa-token"]; // Assume 2FA token is sent in a custom header
      const verified = speakeasy.totp.verify({
        secret: user.twoFactorSecret,
        encoding: "base32",
        token: twoFactorToken,
      });

      if (!verified) {
        return res
          .status(401)
          .json({ success: false, error: "Invalid 2FA token" });
      }
    }

    // Add user to request
    req.user = user;
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
