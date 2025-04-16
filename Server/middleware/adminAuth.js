/**
 * Middleware pour vérifier si l'utilisateur a le rôle Admin
 */
module.exports = (req, res, next) => {
  // L'utilisateur est déjà authentifié par le middleware auth
  // Vérifier si l'utilisateur a le rôle Admin
  if (req.user && req.user.role === 'Admin') {
    return next();
  }
  
  return res.status(403).json({
    success: false,
    error: 'Access denied. Admin role required.'
  });
};
