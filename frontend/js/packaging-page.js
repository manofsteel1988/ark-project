// ============================================================
// ARK — Packaging (page dédiée, packaging.html)
// ============================================================
// Page informative : contrairement à l'étape obligatoire après ajout au
// panier (etape-packaging.html / packaging-step.js), ici il n'y a rien à
// valider — c'est juste la vitrine des options, accessible depuis le menu.
document.addEventListener("DOMContentLoaded", async () => {
  const grid = document.getElementById("packaging-page-grid");
  const packagingList = await Api.getPackaging();

  grid.innerHTML = packagingList
    .map(
      (p) => `
    <div class="pk-card">
      <div class="ph"><img src="${p.imageUrl}" alt=""></div>
      <h4>${p.name}</h4>
      <p style="font-size:12px;color:var(--grey);padding:0 14px 10px;">${p.description}</p>
      <div class="price">${p.priceModifier > 0 ? "+ " + formatPrice(p.priceModifier) : "Inclus"}</div>
      <a class="btn ghost small" href="creer-ma-montre.html">Choisir ce modèle</a>
    </div>`
    )
    .join("");
});
