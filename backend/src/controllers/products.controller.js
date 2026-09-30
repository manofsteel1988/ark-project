const prisma = require("../db");
const { HttpError } = require("../middleware/errorHandler");

// GET /api/products?category=HOMME&bestSeller=true
// Alimente la page "Découvrir nos modèles" (filtres Homme/Femme/Mixte — section 3 du parcours client)
async function list(req, res, next) {
  try {
    const { category, bestSeller, isNew, packCouple } = req.query;
    const where = {};
    if (category) where.category = category.toUpperCase();
    if (bestSeller !== undefined) where.isBestSeller = bestSeller === "true";
    if (isNew !== undefined) where.isNew = isNew === "true";
    if (packCouple !== undefined) where.isPackCouple = packCouple === "true";

    const products = await prisma.product.findMany({
      where,
      include: { images: { orderBy: { position: "asc" } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
}

// GET /api/products/carousel
// Alimente le carrousel de la home : UNIQUEMENT photo + nom, aucun prix/filtre
// (exigence explicite du parcours client, section 3).
async function carousel(req, res, next) {
  try {
    const products = await prisma.product.findMany({
      take: 8,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        slug: true,
        name: true,
        images: { take: 1, orderBy: { position: "asc" }, select: { url: true } },
      },
    });
    res.json(products);
  } catch (err) {
    next(err);
  }
}

// GET /api/products/:slug
// Fiche produit complète : prix, avis, description — tout le réassurant (section 3 & 9)
async function getBySlug(req, res, next) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug: req.params.slug },
      include: {
        images: { orderBy: { position: "asc" } },
        reviews: { orderBy: { createdAt: "desc" } },
        defaultPieces: { include: { piece: true } },
      },
    });
    if (!product) throw new HttpError(404, "Modèle introuvable", "PRODUCT_NOT_FOUND");
    res.json(product);
  } catch (err) {
    next(err);
  }
}

module.exports = { list, carousel, getBySlug };
