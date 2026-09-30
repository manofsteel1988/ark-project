const jwt = require("jsonwebtoken");
const { HttpError } = require("./errorHandler");

// Décode le JWT s'il est présent, sans bloquer la requête (utile pour le panier,
// les favoris... qui marchent aussi bien en invité).
function optionalAuth(req, res, next) {
  const header = req.headers.authorization;
  if (header?.startsWith("Bearer ")) {
    try {
      const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
      req.userId = payload.userId;
    } catch {
      // token invalide ou expiré -> on continue en invité plutôt que de bloquer
    }
  }
  next();
}

// Bloque la requête si l'utilisateur n'est pas authentifié (compte, commandes...).
function requireAuth(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return next(new HttpError(401, "Authentification requise", "UNAUTHENTICATED"));
  }
  try {
    const payload = jwt.verify(header.slice(7), process.env.JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch {
    next(new HttpError(401, "Session expirée, reconnectez-vous", "INVALID_TOKEN"));
  }
}

module.exports = { optionalAuth, requireAuth };
