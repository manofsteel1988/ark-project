// ============================================================
// ARK — Étape obligatoire "Choisissez votre packaging"
// ============================================================
// Cette page s'ouvre juste après un "Ajouter au panier" (configurateur ou
// fiche produit) : l'id de l'article en attente est retrouvé via
// Api.getPendingCartItemId() (posé au moment de l'ajout, voir api.js).
let selectedPackagingId = null;

document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("packaging-grid");
  const packagingList = await Api.getPackaging();

  grid.innerHTML = packagingList
    .map(
      (p) => `
    <div class="pk-card" data-id="${p.id}">
      <div class="ph"><img src="${p.imageUrl}" alt=""></div>
      <h4>${p.name}</h4>
      <div class="price">${p.priceModifier > 0 ? "+ " + formatPrice(p.priceModifier) : "Inclus"}</div>
      <button class="btn ghost small select-packaging" style="cursor:pointer;">Sélectionner</button>
    </div>`
    )
    .join("");

  grid.querySelectorAll(".pk-card").forEach((card) => {
    card.querySelector(".select-packaging").addEventListener("click", () => {
      grid.querySelectorAll(".pk-card").forEach((c) => c.classList.remove("sel"));
      card.classList.add("sel");
      selectedPackagingId = card.dataset.id;
      const btn = document.getElementById("btn-validate-packaging");
      btn.disabled = false;
      btn.textContent = "Valider et continuer vers le panier";
    });
  });
});

document.getElementById("btn-validate-packaging").addEventListener("click", async () => {
  const itemId = Api.getPendingCartItemId();
  if (itemId && selectedPackagingId) {
    await Api.setCartItemPackaging(itemId, selectedPackagingId);
  }
  location.href = "panier.html";
});
