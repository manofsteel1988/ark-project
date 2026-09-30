const prisma = require("../db");

// GET /api/packaging — alimente l'étape obligatoire ET la page dédiée "Packaging"
async function list(req, res, next) {
  try {
    const packaging = await prisma.packaging.findMany({ orderBy: { priceModifier: "asc" } });
    res.json(packaging);
  } catch (err) {
    next(err);
  }
}

module.exports = { list };
