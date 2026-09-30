const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const prisma = require("../db");
const { HttpError } = require("../middleware/errorHandler");

function issueToken(userId) {
  return jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || "7d" });
}

// POST /api/auth/register  { email, password, firstName, lastName }
async function register(req, res, next) {
  try {
    const { email, password, firstName, lastName } = req.body;
    if (!email || !password || !firstName || !lastName) {
      throw new HttpError(400, "Tous les champs sont requis", "MISSING_FIELDS");
    }
    const existing = await prisma.user.findUnique({ where: { email } });
    if (existing) throw new HttpError(409, "Un compte existe déjà avec cet email", "EMAIL_TAKEN");

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await prisma.user.create({
      data: { email, passwordHash, firstName, lastName },
    });

    res.status(201).json({
      token: issueToken(user.id),
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
    });
  } catch (err) {
    next(err);
  }
}

// POST /api/auth/login  { email, password }
async function login(req, res, next) {
  try {
    const { email, password } = req.body;
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) throw new HttpError(401, "Identifiants invalides", "INVALID_CREDENTIALS");

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) throw new HttpError(401, "Identifiants invalides", "INVALID_CREDENTIALS");

    res.json({
      token: issueToken(user.id),
      user: { id: user.id, email: user.email, firstName: user.firstName, lastName: user.lastName },
    });
  } catch (err) {
    next(err);
  }
}

// GET /api/auth/me — utilisé par le front pour savoir si la session est valide
async function me(req, res, next) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: req.userId },
      select: { id: true, email: true, firstName: true, lastName: true },
    });
    if (!user) throw new HttpError(404, "Utilisateur introuvable", "USER_NOT_FOUND");
    res.json(user);
  } catch (err) {
    next(err);
  }
}

module.exports = { register, login, me };
