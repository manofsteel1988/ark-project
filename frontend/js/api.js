// ============================================================
// ARK — Couche d'accès aux données (api.js)
// ============================================================
// Deux modes :
//  - "demo"  (par défaut) : tout tourne en local dans le navigateur via
//    localStorage + les données ci-dessous, qui reproduisent exactement le
//    jeu de données du seed backend (prisma/seed.js). Permet de présenter
//    le site au client sans lancer de serveur.
//  - "live"  : les mêmes fonctions appellent l'API Express réelle
//    (voir /backend). Pour activer : ARK_CONFIG.mode = "live" ci-dessous,
//    et lancer le backend (npm run dev dans /backend).
//
// Le reste du front-end (configurator.js, cart.js, catalogue.js...) n'appelle
// jamais fetch() ni localStorage directement : tout passe par ce fichier,
// pour que la bascule démo -> vraie API se fasse à un seul endroit.
// ============================================================

const ARK_CONFIG = {
  mode: "demo", // "demo" | "live"
  apiBase: "http://localhost:4000/api",
};

// ------------------------------------------------------------
// Données de démonstration — miroir de backend/prisma/seed.js
// ------------------------------------------------------------
const DEMO_IMG = {
  wrist: "https://images.unsplash.com/photo-1702865053958-71ec751c4118?auto=format&fit=crop&w=800&q=75",
  marble: "https://images.unsplash.com/photo-1566041510394-cf7c8fe21800?auto=format&fit=crop&w=800&q=75",
  macro: "https://images.unsplash.com/photo-1772638904187-1d1e8f1452f3?auto=format&fit=crop&w=800&q=75",
  car: "https://images.unsplash.com/photo-1782009064607-9facb439f328?auto=format&fit=crop&w=800&q=75",
  yacht: "https://images.unsplash.com/photo-1528154291023-a6525fabe5b4?auto=format&fit=crop&w=800&q=75",
};

const DEMO_PRODUCTS = [
  { id: "riviera", slug: "modele-riviera", name: "Modèle Riviera", category: "FEMME", basePrice: 109000, description: "Boîtier acier 316L, cadran nacre, bracelet cuir pleine fleur. Une pièce pensée pour un usage quotidien élégant.", images: [DEMO_IMG.wrist, DEMO_IMG.marble], isBestSeller: true },
  { id: "solaire", slug: "modele-solaire", name: "Modèle Solaire", category: "MIXTE", basePrice: 119000, description: "Un modèle polyvalent, boîtier acier 36mm et cadran anthracite.", images: [DEMO_IMG.marble], isNew: true },
  { id: "nocturne", slug: "modele-nocturne", name: "Modèle Nocturne", category: "HOMME", basePrice: 134000, description: "Boîtier acier 40mm, cadran anthracite, bracelet cuir noir.", images: [DEMO_IMG.macro, DEMO_IMG.car] },
  { id: "horizon", slug: "modele-horizon", name: "Modèle Horizon", category: "MIXTE", basePrice: 125000, description: "Un modèle intemporel, inspiré de l'horizon marin.", images: [DEMO_IMG.yacht] },
];

const DEMO_PIECES = [
  { id: "boi-acier-36", type: "BOITIER", name: "Acier 36mm", priceModifier: 0, imageUrl: DEMO_IMG.wrist },
  { id: "boi-acier-40", type: "BOITIER", name: "Acier 40mm", priceModifier: 8000, imageUrl: DEMO_IMG.macro },
  { id: "boi-pierre-36", type: "BOITIER", name: "Pierre claire 36mm", priceModifier: 15000, imageUrl: DEMO_IMG.marble },

  { id: "cad-nacre", type: "CADRAN", name: "Nacre", priceModifier: 0, imageUrl: DEMO_IMG.wrist },
  { id: "cad-anthracite", type: "CADRAN", name: "Anthracite", priceModifier: 5000, imageUrl: DEMO_IMG.macro },
  { id: "cad-marine", type: "CADRAN", name: "Bleu marine", priceModifier: 5000, imageUrl: DEMO_IMG.yacht },

  { id: "bra-cuir-beige", type: "BRACELET", name: "Cuir beige", priceModifier: 0, imageUrl: DEMO_IMG.wrist },
  { id: "bra-cuir-noir", type: "BRACELET", name: "Cuir noir", priceModifier: 0, imageUrl: DEMO_IMG.car },
  { id: "bra-acier-mil", type: "BRACELET", name: "Acier milanais", priceModifier: 12000, imageUrl: DEMO_IMG.macro },

  { id: "aig-or", type: "AIGUILLES", name: "Or fin", priceModifier: 3000, imageUrl: DEMO_IMG.wrist },
  { id: "aig-argent", type: "AIGUILLES", name: "Argent", priceModifier: 0, imageUrl: DEMO_IMG.macro },
  { id: "aig-noir", type: "AIGUILLES", name: "Noir mat", priceModifier: 0, imageUrl: DEMO_IMG.car },

  { id: "opt-gravure", type: "OPTION", name: "Gravure au dos du boîtier", priceModifier: 4000, imageUrl: DEMO_IMG.macro },
  { id: "opt-saphir", type: "OPTION", name: "Verre saphir anti-reflet", priceModifier: 6000, imageUrl: DEMO_IMG.wrist },
];

// boîtier -> cadrans compatibles (même règle que prisma/seed.js).
// Bracelet / aiguilles / options : compatibles avec tout, pour la démo.
const DEMO_COMPATIBILITY = {
  "boi-pierre-36": ["cad-nacre", "cad-marine"],
  "boi-acier-36": ["cad-nacre", "cad-anthracite", "cad-marine"],
  "boi-acier-40": ["cad-anthracite"],
};

const DEMO_PACKAGING = [
  { id: "pk-01", name: "Packaging 01", description: "Écrin sobre, finition mate.", priceModifier: 0, imageUrl: DEMO_IMG.marble },
  { id: "pk-02", name: "Packaging 02", description: "Écrin structuré, intérieur velours.", priceModifier: 0, imageUrl: DEMO_IMG.wrist },
  { id: "pk-premium", name: "Packaging Premium", description: "Coffret rigide, gravure possible.", priceModifier: 4500, imageUrl: DEMO_IMG.macro },
  { id: "pk-coffret", name: "Coffret cadeau", description: "Emballage complet prêt à offrir, avec carte personnalisée.", priceModifier: 6500, imageUrl: DEMO_IMG.yacht },
];

const DEMO_REVIEWS = [
  { productId: "riviera", authorName: "Camille", rating: 5, comment: "Une montre qui me ressemble vraiment, du choix du cadran au bracelet. La finition dépasse ce à quoi je m'attendais.", photoUrl: DEMO_IMG.wrist },
  { productId: "solaire", authorName: "Julien", rating: 5, comment: "Le configurateur est très simple à utiliser, et le packaging à la réception est vraiment soigné.", photoUrl: DEMO_IMG.macro },
  { productId: "nocturne", authorName: "Sarah", rating: 4, comment: "Délai annoncé respecté, montre conforme à ma configuration. Je recommande pour un cadeau de couple.", photoUrl: null },
];

const BASE_PRICE = 89000;

// ------------------------------------------------------------
// Petit utilitaire localStorage (mode démo uniquement)
// ------------------------------------------------------------
const Store = {
  get(key, fallback) {
    try {
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    } catch {
      return fallback;
    }
  },
  set(key, value) {
    localStorage.setItem(key, JSON.stringify(value));
  },
};

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

// ------------------------------------------------------------
// API publique — mêmes signatures en mode "demo" et "live"
// ------------------------------------------------------------
const Api = {
  // ---- Produits ----
  async getCarousel() {
    if (ARK_CONFIG.mode === "live") return liveGet("/products/carousel");
    return DEMO_PRODUCTS.map((p) => ({ slug: p.slug, name: p.name, images: [{ url: p.images[0] }] }));
  },

  async getProducts(filters = {}) {
    if (ARK_CONFIG.mode === "live") {
      const qs = new URLSearchParams(filters).toString();
      return liveGet(`/products${qs ? "?" + qs : ""}`);
    }
    let list = DEMO_PRODUCTS;
    if (filters.category) list = list.filter((p) => p.category === filters.category.toUpperCase());
    return list.map((p) => ({ ...p, images: p.images.map((url) => ({ url })) }));
  },

  async getProductBySlug(slug) {
    if (ARK_CONFIG.mode === "live") return liveGet(`/products/${slug}`);
    const p = DEMO_PRODUCTS.find((p) => p.slug === slug) || DEMO_PRODUCTS[0];
    const reviews = DEMO_REVIEWS.filter((r) => r.productId === p.id);
    return { ...p, images: p.images.map((url) => ({ url })), reviews };
  },

  // ---- Configurateur ----
  async getPieces(type, selectedIds = []) {
    if (ARK_CONFIG.mode === "live") {
      const qs = new URLSearchParams({ type, selected: selectedIds.join(",") }).toString();
      return liveGet(`/configurator/pieces?${qs}`);
    }
    const candidates = DEMO_PIECES.filter((p) => p.type === type);
    const boitierId = selectedIds.find((id) => DEMO_PIECES.find((p) => p.id === id)?.type === "BOITIER");
    if (type === "CADRAN" && boitierId && DEMO_COMPATIBILITY[boitierId]) {
      return candidates.filter((p) => DEMO_COMPATIBILITY[boitierId].includes(p.id));
    }
    return candidates;
  },

  async getPrice(pieceIds = []) {
    if (ARK_CONFIG.mode === "live") return (await livePost("/configurator/price", { pieceIds })).price;
    const modifiers = pieceIds.reduce((sum, id) => {
      const piece = DEMO_PIECES.find((p) => p.id === id);
      return sum + (piece ? piece.priceModifier : 0);
    }, 0);
    return BASE_PRICE + modifiers;
  },

  async saveConfiguration(pieceIds, label) {
    const totalPrice = await Api.getPrice(pieceIds);
    if (ARK_CONFIG.mode === "live") {
      return livePost("/configurator", { pieceIds, label, save: true });
    }
    const configuration = {
      id: uid(),
      label: label || "Ma création ARK",
      totalPrice,
      pieces: pieceIds.map((id) => ({ piece: DEMO_PIECES.find((p) => p.id === id) })),
    };
    const saved = Store.get("ark_saved_configurations", []);
    saved.unshift(configuration);
    Store.set("ark_saved_configurations", saved);
    return configuration;
  },

  // ---- Packaging ----
  async getPackaging() {
    if (ARK_CONFIG.mode === "live") return liveGet("/packaging");
    return DEMO_PACKAGING;
  },

  // ---- Avis ----
  async getReviews(productSlugOrId) {
    if (ARK_CONFIG.mode === "live") return liveGet(`/reviews?productId=${productSlugOrId}`);
    return DEMO_REVIEWS;
  },

  // ---- Panier (mode démo : localStorage ; mode live : backend + cookie session) ----
  async getCart() {
    if (ARK_CONFIG.mode === "live") return liveGet("/cart");
    return { items: Store.get("ark_cart_items", []) };
  },

  async addCartItem({ productId, productSnapshot, configuration, packagingId }) {
    if (ARK_CONFIG.mode === "live") {
      return livePost("/cart/items", { productId, configurationId: configuration?.id, packagingId });
    }
    const items = Store.get("ark_cart_items", []);
    const packaging = packagingId ? DEMO_PACKAGING.find((p) => p.id === packagingId) : null;
    const item = {
      id: uid(),
      product: productSnapshot || null,
      configuration: configuration || null,
      packaging: packaging || null,
      quantity: 1,
      unitPrice: (configuration ? configuration.totalPrice : productSnapshot?.basePrice || 0) + (packaging?.priceModifier || 0),
    };
    items.push(item);
    Store.set("ark_cart_items", items);
    Store.set("ark_pending_cart_item_id", item.id); // pour l'étape packaging obligatoire
    return item;
  },

  async setCartItemPackaging(itemId, packagingId) {
    if (ARK_CONFIG.mode === "live") return livePatch(`/cart/items/${itemId}`, { packagingId });
    const items = Store.get("ark_cart_items", []);
    const packaging = DEMO_PACKAGING.find((p) => p.id === packagingId);
    const idx = items.findIndex((i) => i.id === itemId);
    if (idx >= 0) {
      const base = items[idx].unitPrice - (items[idx].packaging?.priceModifier || 0);
      items[idx].packaging = packaging;
      items[idx].unitPrice = base + (packaging?.priceModifier || 0);
      Store.set("ark_cart_items", items);
    }
    return items[idx];
  },

  async removeCartItem(itemId) {
    if (ARK_CONFIG.mode === "live") return liveDelete(`/cart/items/${itemId}`);
    const items = Store.get("ark_cart_items", []).filter((i) => i.id !== itemId);
    Store.set("ark_cart_items", items);
  },

  getPendingCartItemId() {
    return Store.get("ark_pending_cart_item_id", null);
  },

  // ---- Favoris (mode démo : localStorage, pas de compte requis pour la démo) ----
  async getFavorites() {
    if (ARK_CONFIG.mode === "live") return liveGet("/favorites");
    return Store.get("ark_favorites", []);
  },

  async isFavorite(productSlug) {
    const favs = await Api.getFavorites();
    return favs.some((f) => (f.product?.slug || f.slug) === productSlug);
  },

  async toggleFavorite(product) {
    if (ARK_CONFIG.mode === "live") {
      const isFav = await Api.isFavorite(product.slug);
      return isFav ? liveDelete(`/favorites/${product.id}`) : livePost(`/favorites/${product.id}`);
    }
    let favs = Store.get("ark_favorites", []);
    const exists = favs.some((f) => f.slug === product.slug);
    favs = exists ? favs.filter((f) => f.slug !== product.slug) : [...favs, product];
    Store.set("ark_favorites", favs);
    return !exists;
  },
};

// ------------------------------------------------------------
// Appels réseau réels (mode "live" uniquement)
// ------------------------------------------------------------
async function liveGet(path) {
  const res = await fetch(ARK_CONFIG.apiBase + path, { credentials: "include" });
  if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
  return res.json();
}
async function livePost(path, body) {
  const res = await fetch(ARK_CONFIG.apiBase + path, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
  return res.status === 204 ? null : res.json();
}
async function livePatch(path, body) {
  const res = await fetch(ARK_CONFIG.apiBase + path, {
    method: "PATCH",
    credentials: "include",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
  return res.json();
}
async function liveDelete(path) {
  const res = await fetch(ARK_CONFIG.apiBase + path, { method: "DELETE", credentials: "include" });
  if (!res.ok) throw new Error(`API ${path} -> ${res.status}`);
}

// ------------------------------------------------------------
// Helpers d'affichage partagés
// ------------------------------------------------------------
function formatPrice(cents) {
  return (cents / 100).toLocaleString("fr-FR", { minimumFractionDigits: 0 }) + " €";
}
function renderStars(rating) {
  return "★".repeat(rating) + "☆".repeat(5 - rating);
}
