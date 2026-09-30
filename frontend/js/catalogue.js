// ============================================================
// ARK — Découvrir nos modèles (decouvrir-nos-modeles.html)
// ============================================================
document.addEventListener("DOMContentLoaded", () => {
  document.querySelectorAll(".filterbar .pill").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".filterbar .pill").forEach((b) => b.classList.remove("active"));
      btn.classList.add("active");
      loadProducts(btn.dataset.category);
    });
  });
  loadProducts("");
});

async function loadProducts(category) {
  const grid = document.getElementById("products-grid");
  grid.innerHTML = `<p style="color:var(--grey);font-size:13px;">Chargement des modèles…</p>`;

  const products = await Api.getProducts(category ? { category } : {});
  if (!products.length) {
    grid.innerHTML = `<p style="color:var(--grey);font-size:13px;">Aucun modèle dans cette catégorie pour le moment.</p>`;
    return;
  }

  grid.innerHTML = products
    .map(
      (p) => `
    <a class="pcard" href="fiche-produit.html?slug=${p.slug}">
      <div class="ph">
        <img src="${p.images[0]?.url || ""}" alt="${p.name}">
        <span class="heart" data-slug="${p.slug}">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.9a5.5 5.5 0 0 0-7.8 0L12 5.9l-1-1a5.5 5.5 0 1 0-7.8 7.8L12 21.2l8.8-8.5a5.5 5.5 0 0 0 0-7.8z"/></svg>
        </span>
      </div>
      <div class="info">
        <h4>${p.name}</h4>
        <div class="meta"><span>${categoryLabel(p.category)}</span><span>Guide des tailles</span><span>Avis</span></div>
        <div class="price">${formatPrice(p.basePrice)}</div>
      </div>
    </a>`
    )
    .join("");

  // Branche chaque cœur sur Api.toggleFavorite (favorites.js)
  grid.querySelectorAll(".heart").forEach((heartEl) => {
    const product = products.find((p) => p.slug === heartEl.dataset.slug);
    wireFavoriteButton(heartEl, product);
  });
}

function categoryLabel(cat) {
  return { HOMME: "Homme", FEMME: "Femme", MIXTE: "Mixte" }[cat] || cat;
}
