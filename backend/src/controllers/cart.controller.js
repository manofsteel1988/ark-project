const prisma = require("../db");
const { HttpError } = require("../middleware/errorHandler");

// Retrouve ou crée le panier lié à la session (invité) ou au compte (connecté).
async function getOrCreateCart(req) {
  const where = req.userId ? { userId: req.userId } : { sessionId: req.sessionId };
  let cart = await prisma.cart.findFirst({ where });
  if (!cart) {
    cart = await prisma.cart.create({
      data: req.userId ? { userId: req.userId } : { sessionId: req.sessionId },
    });
  }
  return cart;
}

const CART_INCLUDE = {
  items: {
    include: { product: { include: { images: true } }, configuration: { include: { pieces: { include: { piece: true } } } }, packaging: true },
  },
};

// GET /api/cart
async function getCart(req, res, next) {
  try {
    const cart = await getOrCreateCart(req);
    const full = await prisma.cart.findUnique({ where: { id: cart.id }, include: CART_INCLUDE });
    res.json(full);
  } catch (err) {
    next(err);
  }
}

// POST /api/cart/items  { productId? , configurationId?, packagingId?, quantity? }
// IMPORTANT : côté front, l'ajout au panier doit systématiquement rediriger vers
// l'étape "Choisissez votre packaging" avant validation finale (exigence explicite
// du parcours client) — packagingId peut donc être nul à la création puis complété
// via PATCH /api/cart/items/:id une fois l'étape passée.
async function addItem(req, res, next) {
  try {
    const { productId, configurationId, packagingId, quantity = 1 } = req.body;
    if (!productId && !configurationId) {
      throw new HttpError(400, "productId ou configurationId requis", "MISSING_ITEM_SOURCE");
    }

    const cart = await getOrCreateCart(req);

    let unitPrice;
    if (productId) {
      const product = await prisma.product.findUnique({ where: { id: productId } });
      if (!product) throw new HttpError(404, "Modèle introuvable", "PRODUCT_NOT_FOUND");
      unitPrice = product.basePrice;
    } else {
      const configuration = await prisma.configuration.findUnique({ where: { id: configurationId } });
      if (!configuration) throw new HttpError(404, "Création introuvable", "CONFIGURATION_NOT_FOUND");
      unitPrice = configuration.totalPrice;
    }

    if (packagingId) {
      const packaging = await prisma.packaging.findUnique({ where: { id: packagingId } });
      if (!packaging) throw new HttpError(404, "Packaging introuvable", "PACKAGING_NOT_FOUND");
      unitPrice += packaging.priceModifier;
    }

    const item = await prisma.cartItem.create({
      data: { cartId: cart.id, productId, configurationId, packagingId, quantity, unitPrice },
      include: { product: true, configuration: true, packaging: true },
    });

    res.status(201).json(item);
  } catch (err) {
    next(err);
  }
}

// PATCH /api/cart/items/:id  { packagingId?, quantity? }
// Utilisé notamment pour enregistrer le choix fait sur l'étape packaging obligatoire.
async function updateItem(req, res, next) {
  try {
    const { packagingId, quantity } = req.body;
    const data = {};
    if (packagingId !== undefined) data.packagingId = packagingId;
    if (quantity !== undefined) data.quantity = quantity;

    const item = await prisma.cartItem.update({ where: { id: req.params.id }, data });
    res.json(item);
  } catch (err) {
    next(err);
  }
}

// DELETE /api/cart/items/:id
async function removeItem(req, res, next) {
  try {
    await prisma.cartItem.delete({ where: { id: req.params.id } });
    res.status(204).end();
  } catch (err) {
    next(err);
  }
}

module.exports = { getCart, addItem, updateItem, removeItem };
