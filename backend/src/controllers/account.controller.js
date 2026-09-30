const prisma = require("../db");

// GET /api/account/orders — "Mes commandes" avec statut / timeline (section 36)
async function orders(req, res, next) {
  try {
    const list = await prisma.order.findMany({
      where: { userId: req.userId },
      include: {
        items: {
          include: { product: { include: { images: true } }, configuration: { include: { pieces: { include: { piece: true } } } }, packaging: true },
        },
      },
      orderBy: { createdAt: "desc" },
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
}

// GET /api/account/configurations — "Mes créations sauvegardées"
async function savedConfigurations(req, res, next) {
  try {
    const list = await prisma.configuration.findMany({
      where: { userId: req.userId, isSaved: true },
      include: { pieces: { include: { piece: true } } },
      orderBy: { createdAt: "desc" },
    });
    res.json(list);
  } catch (err) {
    next(err);
  }
}

// POST /api/account/orders — validation finale de commande (checkout)
// NOTE : aucun paiement réel n'est traité ici. Brancher un PSP (Stripe, etc.)
// nécessite un compte marchand ARK et des clés API — voir README backend.
async function createOrder(req, res, next) {
  try {
    const { cartId, shippingName, shippingAddress, shippingCity, shippingZip } = req.body;

    const cart = await prisma.cart.findUnique({ where: { id: cartId }, include: { items: true } });
    const totalPrice = cart.items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);

    const order = await prisma.order.create({
      data: {
        userId: req.userId,
        totalPrice,
        shippingName,
        shippingAddress,
        shippingCity,
        shippingZip,
        items: {
          create: cart.items.map((item) => ({
            productId: item.productId,
            configurationId: item.configurationId,
            packagingId: item.packagingId,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
          })),
        },
      },
      include: { items: true },
    });

    await prisma.cartItem.deleteMany({ where: { cartId } });

    res.status(201).json(order);
  } catch (err) {
    next(err);
  }
}

module.exports = { orders, savedConfigurations, createOrder };
