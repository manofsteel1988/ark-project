const { nanoid } = require("nanoid");

const COOKIE_NAME = "ark_session";

// Chaque visiteur (connecté ou non) a un identifiant de session posé en cookie,
// utilisé pour retrouver/panier tant qu'il n'a pas de compte. Une fois connecté,
// le panier "session" peut être fusionné avec le panier lié au compte (non
// implémenté ici — c'est le genre de détail à trancher avec le développeur).
function sessionMiddleware(req, res, next) {
  let sessionId = req.cookies?.[COOKIE_NAME];
  if (!sessionId) {
    sessionId = nanoid();
    res.cookie(COOKIE_NAME, sessionId, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24 * 90, // 90 jours
    });
  }
  req.sessionId = sessionId;
  next();
}

module.exports = { sessionMiddleware, COOKIE_NAME };
