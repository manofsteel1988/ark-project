const prisma = require("../db");

// GET /api/reviews?productId=xxx
async function list(req, res, next) {
  try {
    const { productId } = req.query;
    const reviews = await prisma.review.findMany({
      where: productId ? { productId } : undefined,
      orderBy: { createdAt: "desc" },
    });
    res.json(reviews);
  } catch (err) {
    next(err);
  }
}

// POST /api/reviews  { productId, rating, comment, photoUrl? }
// authorName vient du compte connecté ; pas de compte -> à gérer côté front
// (formulaire "prénom" ou modération manuelle, à trancher avec le client).
async function create(req, res, next) {
  try {
    const { productId, rating, comment, photoUrl, authorName } = req.body;
    const review = await prisma.review.create({
      data: {
        productId,
        userId: req.userId ?? null,
        authorName: authorName || "Client ARK",
        rating,
        comment,
        photoUrl: photoUrl || null,
      },
    });
    res.status(201).json(review);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, create };
