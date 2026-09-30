# ARK — Front-end

HTML/CSS/JS "vanilla" (aucun framework, aucune étape de build) — direction
visuelle Riviera Lumière validée par le client, avec un front-end réellement
interactif.

## Démarrage rapide

Aucune installation requise pour le **mode démo** :

```bash
cd frontend
# ouvrez pages/accueil.html directement dans un navigateur,
# ou servez le dossier pour éviter les restrictions CORS de certains navigateurs :
python3 -m http.server 5500
# puis http://localhost:5500/pages/accueil.html
```

## Deux modes de fonctionnement

Tout est piloté depuis un seul endroit : `js/api.js`, tout en haut du fichier :

```js
const ARK_CONFIG = {
  mode: "demo", // "demo" | "live"
  apiBase: "http://localhost:4000/api",
};
```

- **`demo`** (par défaut) — aucune dépendance au backend. Toutes les données
  (produits, pièces du configurateur, packaging, avis) sont incluses dans
  `api.js` et reproduisent exactement `backend/prisma/seed.js`. Panier et
  favoris sont persistés dans le `localStorage` du navigateur. **C'est le mode
  à utiliser pour continuer à présenter le site au client** : aucun serveur à
  lancer, ça marche en ouvrant simplement les fichiers.
- **`live`** — bascule tous les appels vers le vrai backend Express
  (`/backend`, voir son README). Nécessite de lancer le serveur
  (`npm run dev` dans `/backend`) et d'ajuster `FRONTEND_ORIGIN` dans son
  `.env` pour autoriser les requêtes CORS depuis l'origine du front (ex.
  `http://localhost:5500`).

Aucun autre fichier ne connaît la différence entre les deux modes — `cart.js`,
`configurator.js`, etc. appellent toujours les mêmes fonctions `Api.xxx()`.

## Ce qui est réellement fonctionnel

| Page | Comportement |
|---|---|
| `accueil.html` | Carrousel chargé dynamiquement (photo + nom uniquement, comme demandé), flèches de défilement fonctionnelles |
| `creer-ma-montre.html` | Menus déroulants remplis selon la compatibilité réelle des pièces avec le boîtier ; prix recalculé à chaque changement ; aperçu qui change d'image ; "Ajouter au panier" et "Sauvegarder ma création" fonctionnels |
| `etape-packaging.html` | Les 4 options viennent de l'API ; la sélection est rattachée à l'article du panier avant de continuer |
| `decouvrir-nos-modeles.html` | Filtres Homme/Femme/Mixte réels ; favoris cliquables |
| `fiche-produit.html` | Chargée dynamiquement via `?slug=...` (ex. `fiche-produit.html?slug=modele-nocturne`) ; avis réels ; favoris ; ajout au panier |
| `panier.html` | Liste réelle, suppression d'articles, total recalculé |
| `packaging.html` | Vitrine des options, chargée depuis l'API |
| `pack-couple.html` | Reste statique (contenu éditorial, pas de logique dynamique nécessaire) |

Le compteur panier/favoris dans le header (`header.js`) se met à jour sur
toutes les pages.

## Limites connues (volontaires à ce stade)

- **Pas de vrai aperçu 3D** — le bandeau du configurateur l'indique
  explicitement. Une vraie visionneuse 3D interactive nécessite des modèles
  3D par pièce (boîtier, cadran, bracelet...), que le client n'a pas encore
  fournis. Une fois ces modèles disponibles, ce bloc `cfg-left` est le seul
  endroit à remplacer par une vraie librairie 3D (Three.js, model-viewer...).
- **Pas de paiement réel** — le bouton "Passer au paiement" du panier l'indique
  clairement plutôt que de simuler un faux succès.
- **Compte client minimal** — inscription/connexion existent côté backend
  (JWT) mais aucune page de connexion n'a été construite côté front à ce
  stade ; en mode démo, favoris et panier fonctionnent sans compte.
