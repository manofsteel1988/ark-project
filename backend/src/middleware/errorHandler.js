// Middleware d'erreur centralisé — chaque contrôleur fait next(err) en cas de souci,
// et tout remonte ici avec un format de réponse JSON cohérent.
function errorHandler(err, req, res, next) {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({
    error: {
      message: err.message || "Erreur interne du serveur",
      code: err.code || "INTERNAL_ERROR",
    },
  });
}

// Petit helper pour créer une erreur HTTP proprement typée depuis un contrôleur.
class HttpError extends Error {
  constructor(status, message, code) {
    super(message);
    this.status = status;
    this.code = code;
  }
}

module.exports = { errorHandler, HttpError };
