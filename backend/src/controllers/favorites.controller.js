const prisma = require("../db");
const { HttpError } = require("../middleware/errorHandler");

// GET /api/favorites — nécessite un compte (section 31 & 35)
async function list(req, res, next) {
  try {
    const favorites = await prisma.favorite.findMany({
      where: { userId: req.userId },
      include: { product: { include: { images: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(favorites);
  } catch (err) {
    next(err);
  }
}

// POST /api/favorites/:productId
async function add(req, res, next) {
  try {
    const favorite = await prisma.favorite.upsert({
      where: { userId_productId: { userId: req.userId, productId: req.params.productId } },
      create: { userId: req.userId, productId: req.params.productId },
      update: {},
    });
    res.status(201).json(favorite);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/favorites/:productId
async function remove(req, res, next) {
  try {
    await prisma.favorite.delete({
      where: { userId_productId: { userId: req.userId, productId: req.params.productId } },
    });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { list, add, remove };
