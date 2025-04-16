const jwt = require("jsonwebtoken");
const User = require("../models/User");
const speakeasy = require("speakeasy");

module.exports = async (req, res, next) => {
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
