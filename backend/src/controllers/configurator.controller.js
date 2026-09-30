const prisma = require("../db");
const { nanoid } = require("nanoid");
const { HttpError } = require("../middleware/errorHandler");
const { computePrice, findCompatiblePieces } = require("../services/pricing.service");

// GET /api/configurator/pieces?type=CADRAN&selected=id1,id2
// Renvoie les pièces disponibles pour l'étape en cours, filtrées par compatibilité
// avec les pièces déjà choisies (rotation/zoom/mise à jour instantanée côté front —
// ici on ne fournit que la donnée, l'aperçu 3D est un sujet front-end à part entière,
// voir le README pour les prérequis : modèles 3D par pièce).
async function getPieces(req, res, next) {
  try {
    const { type, selected } = req.query;
    if (!type) throw new HttpError(400, "Paramètre 'type' requis (BOITIER, CADRAN, BRACELET, AIGUILLES, OPTION)", "MISSING_TYPE");
    const selectedIds = selected ? selected.split(",").filter(Boolean) : [];
    const pieces = await findCompatiblePieces(type.toUpperCase(), selectedIds);
    res.json(pieces);
  } catch (err) {
    next(err);
  }
}

// POST /api/configurator/price  { pieceIds: [...] }
// Prix dynamique affiché en direct dans "Votre configuration : XXX €"
async function getPrice(req, res, next) {
  try {
    const { pieceIds = [] } = req.body;
    const price = await computePrice(pieceIds);
    res.json({ price });
  } catch (err) {
    next(err);
  }
}

// POST /api/configurator  { pieceIds: [...], label?, save?: boolean }
// Crée une configuration. save=true -> "Sauvegarder ma création" (nécessite un compte,
// sinon renvoie un shareToken utilisable pour "Partager ma création" sans compte).
async function createConfiguration(req, res, next) {
  try {
    const { pieceIds = [], label, save } = req.body;
    if (!pieceIds.length) throw new HttpError(400, "Aucune pièce sélectionnée", "EMPTY_CONFIGURATION");

    const totalPrice = await computePrice(pieceIds);

    const configuration = await prisma.configuration.create({
      data: {
        userId: req.userId ?? null,
        label: label || "Ma création ARK",
        totalPrice,
        isSaved: Boolean(save),
        shareToken: nanoid(10),
        pieces: { create: pieceIds.map((pieceId) => ({ pieceId })) },
      },
      include: { pieces: { include: { piece: true } } },
    });

    res.status(201).json(configuration);
  } catch (err) {
    next(err);
  }
}

// GET /api/configurator/:id
async function getConfiguration(req, res, next) {
  try {
    const configuration = await prisma.configuration.findUnique({
      where: { id: req.params.id },
      include: { pieces: { include: { piece: true } } },
    });
    if (!configuration) throw new HttpError(404, "Création introuvable", "CONFIGURATION_NOT_FOUND");
    res.json(configuration);
  } catch (err) {
    next(err);
  }
}

// GET /api/configurator/shared/:shareToken — pour "Partager ma création"
async function getSharedConfiguration(req, res, next) {
  try {
    const configuration = await prisma.configuration.findUnique({
      where: { shareToken: req.params.shareToken },
      include: { pieces: { include: { piece: true } } },
    });
    if (!configuration) throw new HttpError(404, "Lien de partage invalide ou expiré", "SHARE_NOT_FOUND");
    res.json(configuration);
  } catch (err) {
    next(err);
  }
}

module.exports = { getPieces, getPrice, createConfiguration, getConfiguration, getSharedConfiguration };
