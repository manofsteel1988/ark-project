// ============================================================
// ARK — Comportement du header, commun à toutes les pages
// ============================================================
document.addEventListener("DOMContentLoaded", async () => {
  await refreshHeaderCounts();
});

async function refreshHeaderCounts() {
  try {
    const [cart, favorites] = await Promise.all([Api.getCart(), Api.getFavorites()]);
    setBadge("cart-badge", cart.items?.length || 0);
    setBadge("fav-badge", favorites?.length || 0);
  } catch (err) {
    console.warn("Impossible de charger panier/favoris :", err);
  }
}

function setBadge(id, count) {
  const el = document.getElementById(id);
  if (!el) return;
  if (count > 0) {
    el.textContent = count;
    el.style.display = "flex";
  } else {
    el.style.display = "none";
  }
}
