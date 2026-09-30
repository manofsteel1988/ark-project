const prisma = require("../db");
const { HttpError } = require("../middleware/errorHandler");

const BASE_PRICE = 89000; // 890,00 € — prix de départ d'un boîtier nu, en centimes

// Calcule le prix total d'une configuration à partir d'une liste d'ids de pièces.
async function computePrice(pieceIds) {
  if (!pieceIds?.length) return BASE_PRICE;
  const pieces = await prisma.piece.findMany({ where: { id: { in: pieceIds } } });
  const modifiersSum = pieces.reduce((sum, p) => sum + p.priceModifier, 0);
  return BASE_PRICE + modifiersSum;
}

// Renvoie, pour un type de pièce donné, uniquement les pièces compatibles avec
// les pièces déjà choisies par le client (section 39 du cahier des charges :
// "impossible de créer une combinaison techniquement irréalisable").
// La compatibilité est stockée dans les deux sens (A->B ou B->A) donc on teste les deux colonnes.
async function findCompatiblePieces(type, selectedPieceIds) {
  if (!selectedPieceIds?.length) {
    return prisma.piece.findMany({ where: { type, available: true } });
  }

  const candidates = await prisma.piece.findMany({ where: { type, available: true } });

  const compatible = [];
  for (const candidate of candidates) {
    const links = await prisma.pieceCompatibility.findMany({
      where: {
        OR: [
          { fromPieceId: candidate.id, toPieceId: { in: selectedPieceIds } },
          { toPieceId: candidate.id, fromPieceId: { in: selectedPieceIds } },
        ],
      },
    });
    // Une pièce est retenue si elle est déclarée compatible avec TOUTES les pièces
    // déjà sélectionnées (autant de liens trouvés que de pièces sélectionnées).
    const compatibleWithIds = new Set(
      links.map((l) => (l.fromPieceId === candidate.id ? l.toPieceId : l.fromPieceId))
    );
    const isFullyCompatible = selectedPieceIds.every((id) => compatibleWithIds.has(id));
    if (isFullyCompatible) compatible.push(candidate);
  }
  return compatible;
}

module.exports = { BASE_PRICE, computePrice, findCompatiblePieces };
