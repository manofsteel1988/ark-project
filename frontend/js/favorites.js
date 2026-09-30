// ============================================================
// ARK — Favoris (partagé par catalogue.js et product.js)
// ============================================================
// Rend un cœur cliquable et gère son état visuel (rempli / contour) en le
// synchronisant avec Api.toggleFavorite(). Utilisé sur les cartes produit
// (page catalogue) et sur la fiche produit.
async function wireFavoriteButton(el, product, { onToggle } = {}) {
  const isFav = await Api.isFavorite(product.slug);
  setFavState(el, isFav);

  el.addEventListener("click", async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const nowFav = await Api.toggleFavorite(product);
    setFavState(el, nowFav);
    await refreshHeaderCounts();
    if (onToggle) onToggle(nowFav);
  });
}

function setFavState(el, isFav) {
  el.classList.toggle("is-favorite", isFav);
  const svg = el.querySelector("svg");
  if (svg) svg.setAttribute("fill", isFav ? "currentColor" : "none");
  if (isFav) {
    el.style.color = "var(--gold)";
  } else {
    el.style.color = "";
  }
}
