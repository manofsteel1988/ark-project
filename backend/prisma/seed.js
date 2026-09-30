// Jeu de données de démonstration — cohérent avec les maquettes déjà validées
// par le client (mêmes noms de modèles, mêmes options de packaging).
// Lancer avec : npm run seed (après npx prisma migrate dev)
const { PrismaClient } = require("@prisma/client");
const bcrypt = require("bcryptjs");
const prisma = new PrismaClient();

const IMG = {
  wrist: "https://images.unsplash.com/photo-1702865053958-71ec751c4118?auto=format&fit=crop&w=800&q=75",
  marble: "https://images.unsplash.com/photo-1566041510394-cf7c8fe21800?auto=format&fit=crop&w=800&q=75",
  macro: "https://images.unsplash.com/photo-1772638904187-1d1e8f1452f3?auto=format&fit=crop&w=800&q=75",
  car: "https://images.unsplash.com/photo-1782009064607-9facb439f328?auto=format&fit=crop&w=800&q=75",
  yacht: "https://images.unsplash.com/photo-1528154291023-a6525fabe5b4?auto=format&fit=crop&w=800&q=75",
};

async function main() {
  console.log("Nettoyage de la base...");
  await prisma.review.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.configurationPiece.deleteMany();
  await prisma.configuration.deleteMany();
  await prisma.favorite.deleteMany();
  await prisma.productDefaultPiece.deleteMany();
  await prisma.pieceCompatibility.deleteMany();
  await prisma.piece.deleteMany();
  await prisma.productImage.deleteMany();
  await prisma.product.deleteMany();
  await prisma.packaging.deleteMany();
  await prisma.user.deleteMany();

  console.log("Création des pièces du configurateur...");
  const boitiers = await Promise.all([
    prisma.piece.create({ data: { type: "BOITIER", name: "Acier 36mm", sku: "BOI-036-ACIER", priceModifier: 0, imageUrl: IMG.wrist } }),
    prisma.piece.create({ data: { type: "BOITIER", name: "Acier 40mm", sku: "BOI-040-ACIER", priceModifier: 8000, imageUrl: IMG.macro } }),
    prisma.piece.create({ data: { type: "BOITIER", name: "Pierre claire 36mm", sku: "BOI-036-PIERRE", priceModifier: 15000, imageUrl: IMG.marble } }),
  ]);

  const cadrans = await Promise.all([
    prisma.piece.create({ data: { type: "CADRAN", name: "Nacre", sku: "CAD-NACRE", priceModifier: 0, imageUrl: IMG.wrist } }),
    prisma.piece.create({ data: { type: "CADRAN", name: "Anthracite", sku: "CAD-ANTHRACITE", priceModifier: 5000, imageUrl: IMG.macro } }),
    prisma.piece.create({ data: { type: "CADRAN", name: "Bleu marine", sku: "CAD-MARINE", priceModifier: 5000, imageUrl: IMG.yacht } }),
  ]);

  const bracelets = await Promise.all([
    prisma.piece.create({ data: { type: "BRACELET", name: "Cuir beige", sku: "BRA-CUIR-BEIGE", priceModifier: 0, imageUrl: IMG.wrist } }),
    prisma.piece.create({ data: { type: "BRACELET", name: "Cuir noir", sku: "BRA-CUIR-NOIR", priceModifier: 0, imageUrl: IMG.car } }),
    prisma.piece.create({ data: { type: "BRACELET", name: "Acier milanais", sku: "BRA-ACIER-MIL", priceModifier: 12000, imageUrl: IMG.macro } }),
  ]);

  const aiguilles = await Promise.all([
    prisma.piece.create({ data: { type: "AIGUILLES", name: "Or fin", sku: "AIG-OR", priceModifier: 3000, imageUrl: IMG.wrist } }),
    prisma.piece.create({ data: { type: "AIGUILLES", name: "Argent", sku: "AIG-ARGENT", priceModifier: 0, imageUrl: IMG.macro } }),
    prisma.piece.create({ data: { type: "AIGUILLES", name: "Noir mat", sku: "AIG-NOIR", priceModifier: 0, imageUrl: IMG.car } }),
  ]);

  const options = await Promise.all([
    prisma.piece.create({ data: { type: "OPTION", name: "Gravure au dos du boîtier", sku: "OPT-GRAVURE", priceModifier: 4000, imageUrl: IMG.macro } }),
    prisma.piece.create({ data: { type: "OPTION", name: "Verre saphir anti-reflet", sku: "OPT-SAPHIR", priceModifier: 6000, imageUrl: IMG.wrist } }),
  ]);

  console.log("Déclaration des règles de compatibilité...");
  // Règle simple pour la démo : le boîtier "Pierre claire" n'est compatible
  // qu'avec les cadrans Nacre et Bleu marine (pas Anthracite) — pour illustrer
  // le mécanisme. Le développeur adaptera ces règles aux vraies contraintes ARK.
  const [boitierAcier36, boitierAcier40, boitierPierre] = boitiers;
  const [cadranNacre, cadranAnthracite, cadranMarine] = cadrans;

  await prisma.pieceCompatibility.create({ data: { fromPieceId: boitierPierre.id, toPieceId: cadranNacre.id } });
  await prisma.pieceCompatibility.create({ data: { fromPieceId: boitierPierre.id, toPieceId: cadranMarine.id } });
  await prisma.pieceCompatibility.create({ data: { fromPieceId: boitierAcier36.id, toPieceId: cadranNacre.id } });
  await prisma.pieceCompatibility.create({ data: { fromPieceId: boitierAcier36.id, toPieceId: cadranAnthracite.id } });
  await prisma.pieceCompatibility.create({ data: { fromPieceId: boitierAcier36.id, toPieceId: cadranMarine.id } });
  await prisma.pieceCompatibility.create({ data: { fromPieceId: boitierAcier40.id, toPieceId: cadranAnthracite.id } });

  console.log("Création du packaging...");
  await prisma.packaging.createMany({
    data: [
      { name: "Packaging 01", description: "Écrin sobre, finition mate.", priceModifier: 0, imageUrl: IMG.marble },
      { name: "Packaging 02", description: "Écrin structuré, intérieur velours.", priceModifier: 0, imageUrl: IMG.wrist },
      { name: "Packaging Premium", description: "Coffret rigide, gravure possible.", priceModifier: 4500, imageUrl: IMG.macro },
      { name: "Coffret cadeau", description: "Emballage complet prêt à offrir, avec carte personnalisée.", priceModifier: 6500, imageUrl: IMG.yacht },
    ],
  });

  console.log("Création des modèles catalogue...");
  const riviera = await prisma.product.create({
    data: {
      slug: "modele-riviera",
      name: "Modèle Riviera",
      category: "FEMME",
      basePrice: 109000,
      description: "Boîtier acier 316L, cadran nacre, bracelet cuir pleine fleur. Une pièce pensée pour un usage quotidien élégant.",
      isBestSeller: true,
      images: { create: [{ url: IMG.wrist, position: 0 }, { url: IMG.marble, position: 1 }] },
    },
  });

  const solaire = await prisma.product.create({
    data: {
      slug: "modele-solaire",
      name: "Modèle Solaire",
      category: "MIXTE",
      basePrice: 119000,
      description: "Un modèle polyvalent, boîtier acier 36mm et cadran anthracite.",
      isNew: true,
      images: { create: [{ url: IMG.marble, position: 0 }] },
    },
  });

  const nocturne = await prisma.product.create({
    data: {
      slug: "modele-nocturne",
      name: "Modèle Nocturne",
      category: "HOMME",
      basePrice: 134000,
      description: "Boîtier acier 40mm, cadran anthracite, bracelet cuir noir.",
      images: { create: [{ url: IMG.macro, position: 0 }, { url: IMG.car, position: 1 }] },
    },
  });

  await prisma.product.create({
    data: {
      slug: "modele-horizon",
      name: "Modèle Horizon",
      category: "MIXTE",
      basePrice: 125000,
      description: "Un modèle intemporel, inspiré de l'horizon marin.",
      images: { create: [{ url: IMG.yacht, position: 0 }] },
    },
  });

  console.log("Création d'un utilisateur de démo...");
  const passwordHash = await bcrypt.hash("demo1234", 10);
  await prisma.user.create({
    data: { email: "demo@ark.fr", passwordHash, firstName: "Camille", lastName: "Demo" },
  });

  console.log("Création des avis clients (avec photo)...");
  await prisma.review.createMany({
    data: [
      {
        productId: riviera.id,
        authorName: "Camille",
        rating: 5,
        comment: "Une montre qui me ressemble vraiment, du choix du cadran au bracelet. La finition dépasse ce à quoi je m'attendais.",
        photoUrl: IMG.wrist,
      },
      {
        productId: solaire.id,
        authorName: "Julien",
        rating: 5,
        comment: "Le configurateur est très simple à utiliser, et le packaging à la réception est vraiment soigné.",
        photoUrl: IMG.macro,
      },
      {
        productId: nocturne.id,
        authorName: "Sarah",
        rating: 4,
        comment: "Délai annoncé respecté, montre conforme à ma configuration. Je recommande pour un cadeau de couple.",
        photoUrl: null,
      },
    ],
  });

  console.log("Terminé.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(() => prisma.$disconnect());
