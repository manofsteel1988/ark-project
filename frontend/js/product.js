// ============================================================
// ARK — Fiche produit (fiche-produit.html)
// ============================================================
const productSlug = new URLSearchParams(location.search).get("slug") || "modele-riviera";

document.addEventListener("DOMContentLoaded", async () => {
  const product = await Api.getProductBySlug(productSlug);
  renderProduct(product);
  renderReviews(product.reviews || []);
});

function renderProduct(p) {
  document.getElementById("pd-crumb-name").textContent = p.name;
  document.title = `ARK — ${p.name}`;

  const images = p.images.map((i) => i.url || i);
  const [main, ...thumbs] = images;

  document.getElementById("pd-content").innerHTML = `
    <div class="pd-gallery">
      <div class="main"><img id="pd-main-image" src="${main}" alt="${p.name}"></div>
      <div class="thumbs">
        ${thumbs.map((url) => `<div><img src="${url}" class="pd-thumb" data-full="${url}"></div>`).join("") || `<div><img src="${main}"></div>`}
      </div>
    </div>
    <div class="pd-info">
      <span class="eyebrow">${categoryLabel(p.category)}</span>
      <h1>${p.name}</h1>
      <div class="price">${formatPrice(p.basePrice)}</div>
      <div class="fav-row">
        <button id="pd-fav-btn" class="btn ghost small" style="display:inline-flex;align-items:center;gap:8px;cursor:pointer;">
          <svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M20.8 4.9a5.5 5.5 0 0 0-7.8 0L12 5.9l-1-1a5.5 5.5 0 1 0-7.8 7.8L12 21.2l8.8-8.5a5.5 5.5 0 0 0 0-7.8z"/></svg>
          Ajouter aux favoris
        </button>
      </div>
      <p style="font-size:13.5px;color:var(--grey);max-width:420px;">${p.description}</p>
      <ul class="trustlist">
        <li>Assemblage réalisé avec soin</li>
        <li>Paiement sécurisé</li>
        <li>Suivi de commande</li>
        <li>Retours sous conditions</li>
      </ul>
      <button id="pd-add-cart" class="btn solid" style="display:block;width:100%;text-align:center;cursor:pointer;">Ajouter au panier</button>
    </div>`;

  document.querySelectorAll(".pd-thumb").forEach((thumb) => {
    thumb.addEventListener("click", () => {
      document.getElementById("pd-main-image").src = thumb.dataset.full;
    });
  });

  wireFavoriteButton(document.getElementById("pd-fav-btn"), p);

  document.getElementById("pd-add-cart").addEventListener("click", async (e) => {
    const btn = e.currentTarget;
    btn.disabled = true;
    btn.textContent = "Ajout en cours…";
    await Api.addCartItem({ productId: p.id, productSnapshot: p });
    location.href = "etape-packaging.html";
  });
}

function renderReviews(reviews) {
  const el = document.getElementById("pd-reviews");
  if (!reviews.length) {
    el.innerHTML = `<p style="color:var(--grey);font-size:13px;">Pas encore d'avis pour ce modèle.</p>`;
    return;
  }
  el.innerHTML = reviews
    .map((r) => {
      const withPhoto = r.photoUrl ? "with-photo" : "";
      return `
      <div class="avis-card ${withPhoto}">
        <div>
          <div class="stars">${renderStars(r.rating)}</div>
          <p class="quote">"${r.comment}"</p>
          <div class="who"><div class="ph"><img src="${r.photoUrl || ""}"></div><div><strong>${r.authorName}</strong></div></div>
        </div>
        ${r.photoUrl ? `<div class="customer-photo"><img src="${r.photoUrl}"></div>` : ""}
      </div>`;
    })
    .join("");
}

function categoryLabel(cat) {
  return { HOMME: "Homme", FEMME: "Femme", MIXTE: "Mixte" }[cat] || cat;
}
