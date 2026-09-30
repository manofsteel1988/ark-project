// ============================================================
// ARK — Configurateur (creer-ma-montre.html)
// ============================================================
// Le brief client ne liste que 4 menus (Bracelet, Cadran, Aiguilles, Autres
// options) : le boîtier est donc considéré comme déjà choisi en amont (via
// "Choisissez votre base" sur la home, ou le modèle cliqué dans le carrousel).
// On le récupère depuis l'URL (?boitier=xxx) avec un boîtier par défaut sinon.
const params = new URLSearchParams(location.search);
const BOITIER_ID = params.get("boitier") || "boi-acier-36";

const selects = {
  BRACELET: document.getElementById("select-bracelet"),
  CADRAN: document.getElementById("select-cadran"),
  AIGUILLES: document.getElementById("select-aiguilles"),
  OPTION: document.getElementById("select-option"),
};
const priceEl = document.getElementById("cfg-price-value");
const previewImg = document.getElementById("cfg-preview-img");

document.addEventListener("DOMContentLoaded", init);

async function init() {
  // Remplit chaque menu avec les pièces compatibles avec le boîtier choisi
  // (section 39 du cahier des charges : "impossible de créer une combinaison
  // techniquement irréalisable").
  for (const [type, select] of Object.entries(selects)) {
    const pieces = await Api.getPieces(type, [BOITIER_ID]);
    select.innerHTML = "";
    if (type === "OPTION") {
      select.appendChild(new Option("Aucune", ""));
    }
    pieces.forEach((piece) => {
      const label = piece.priceModifier > 0 ? `${piece.name} (+${formatPrice(piece.priceModifier)})` : piece.name;
      const opt = new Option(label, piece.id);
      opt.dataset.image = piece.imageUrl;
      select.appendChild(opt);
    });
    select.addEventListener("change", onChange);
  }
  await recomputePrice();
}

function getSelectedPieceIds() {
  return [BOITIER_ID, ...Object.values(selects).map((s) => s.value).filter(Boolean)];
}

async function onChange(e) {
  const selectedOption = e.target.selectedOptions[0];
  if (selectedOption?.dataset.image) {
    previewImg.src = selectedOption.dataset.image;
  }
  await recomputePrice();
}

async function recomputePrice() {
  const price = await Api.getPrice(getSelectedPieceIds());
  priceEl.textContent = formatPrice(price);
}

document.getElementById("btn-add-cart").addEventListener("click", async (e) => {
  const btn = e.currentTarget;
  btn.disabled = true;
  btn.textContent = "Ajout en cours…";
  try {
    const pieceIds = getSelectedPieceIds();
    const configuration = await Api.saveConfiguration(pieceIds, "Ma création ARK");
    await Api.addCartItem({ configuration });
    location.href = "etape-packaging.html";
  } catch (err) {
    console.error(err);
    btn.textContent = "Une erreur est survenue — réessayer";
    btn.disabled = false;
  }
});

document.getElementById("btn-save-config").addEventListener("click", async () => {
  const pieceIds = getSelectedPieceIds();
  await Api.saveConfiguration(pieceIds, "Ma création ARK");
  document.getElementById("cfg-save-confirm").style.display = "inline";
  setTimeout(() => {
    document.getElementById("cfg-save-confirm").style.display = "none";
  }, 3000);
});
