// ============================================================
// ARK — Accueil (accueil.html)
// ============================================================
// Rappel du brief : le carrousel n'affiche QUE la photo et le nom du modèle,
// jamais de prix ni de filtre Homme/Femme/Mixte (section 3 du parcours client).
document.addEventListener("DOMContentLoaded", async () => {
  const track = document.getElementById("home-carousel");
  const products = await Api.getCarousel();

  track.innerHTML = products
    .map(
      (p) => `
    <a class="citem" href="fiche-produit.html?slug=${p.slug}">
      <div class="ph"><img src="${p.images[0]?.url || ""}" alt="${p.name}"></div>
      <h4>${p.name}</h4>
    </a>`
    )
    .join("");

  const scrollAmount = 320;
  document.getElementById("carousel-prev").addEventListener("click", () => {
    track.scrollBy({ left: -scrollAmount, behavior: "smooth" });
  });
  document.getElementById("carousel-next").addEventListener("click", () => {
    track.scrollBy({ left: scrollAmount, behavior: "smooth" });
  });
});
