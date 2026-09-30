// ============================================================
// ARK — Panier (panier.html)
// ============================================================
document.addEventListener("DOMContentLoaded", renderCart);

async function renderCart() {
  const container = document.getElementById("cart-content");
  const cart = await Api.getCart();
  const items = cart.items || [];

  if (!items.length) {
    container.innerHTML = `
      <div class="empty-cart">
        <p>Votre panier est vide pour le moment.</p>
        <a href="decouvrir-nos-modeles.html">Découvrir nos modèles</a> ou
        <a href="creer-ma-montre.html">créer votre montre</a>.
      </div>`;
    return;
  }

  const total = items.reduce((sum, i) => sum + i.unitPrice * (i.quantity || 1), 0);

  container.innerHTML = `
    <div class="cart-layout">
      <div id="cart-items"></div>
      <div class="summary-box">
        <h3 style="font-size:19px;margin-bottom:18px;">Récapitulatif</h3>
        <div class="line"><span>Sous-total</span><span>${formatPrice(total)}</span></div>
        <div class="line"><span>Livraison</span><span>Offerte</span></div>
        <div class="line total"><span>Total</span><span>${formatPrice(total)}</span></div>
        <button id="btn-checkout" class="btn solid" style="display:block;width:100%;text-align:center;margin-top:22px;cursor:pointer;">Passer au paiement</button>
        <div class="reassure-mini">
          <div>Paiement sécurisé</div>
          <div>Délai estimatif affiché avant validation</div>
          <div>Suivi de commande inclus</div>
          <div>SAV accessible depuis votre compte</div>
        </div>
      </div>
    </div>`;

  const itemsEl = document.getElementById("cart-items");
  itemsEl.innerHTML = items.map((item) => renderItem(item)).join("");

  itemsEl.querySelectorAll(".remove").forEach((btn) => {
    btn.addEventListener("click", async (e) => {
      await Api.removeCartItem(e.target.dataset.id);
      await renderCart();
      await refreshHeaderCounts();
    });
  });

  document.getElementById("btn-checkout").addEventListener("click", () => {
    alert(
      "Le paiement réel n'est pas branché dans ce prototype (nécessite un compte marchand Stripe/PayPal et un serveur sécurisé). Voir backend/README.md, section « Ce qui reste à brancher »."
    );
  });
}

function renderItem(item) {
  const name = item.configuration ? item.configuration.label || "Création personnalisée" : item.product?.name || "Article";
  const image =
    item.configuration?.pieces?.[0]?.piece?.imageUrl ||
    item.product?.images?.[0]?.url ||
    item.product?.images?.[0] ||
    "";
  const metaParts = item.configuration
    ? item.configuration.pieces.map((p) => p.piece.name)
    : [];
  if (item.packaging) metaParts.push(item.packaging.name);
  const meta = metaParts.join(" · ") || "—";

  return `
    <div class="cart-item">
      <div class="th"><img src="${image}" alt=""></div>
      <div>
        <h4>${name}</h4>
        <div class="meta">${meta}</div>
      </div>
      <div class="price-col">
        <div class="price">${formatPrice(item.unitPrice)}</div>
        <button class="remove" data-id="${item.id}">Retirer</button>
      </div>
    </div>`;
}
