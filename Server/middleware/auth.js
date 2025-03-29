const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  try {
    const token = req.cookies.token;

    if (!token) {
      return res.status(401).json({
        success: false,
        error: "Authentification requise",
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = {
      id: decoded.id,
      email: decoded.email,
      name: decoded.name,
    };
    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(401).json({
      success: false,
      error: "Token invalide",
    });
  }
};
