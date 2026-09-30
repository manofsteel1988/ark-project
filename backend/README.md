# ARK — Backend API

API REST pour le site ARK (montres personnalisables). Node.js + Express + Prisma.

## Stack

- **Express** — serveur HTTP et routage
- **Prisma** — ORM, migrations, et client de requêtes typé
- **SQLite** en développement (zéro configuration) — **PostgreSQL recommandé en production**
- **JWT** (jsonwebtoken + bcryptjs) — authentification compte client
- **Cookies de session** — panier invité avant connexion

## Démarrage rapide

```bash
cd backend
cp .env.example .env
npm install
npx prisma migrate dev --name init   # crée dev.db (SQLite) et les tables
npm run seed                          # jeu de données de démo
npm run dev                           # démarre l'API sur http://localhost:4000
```

> **Note sur l'installation dans cet environnement de génération** — le code a été
> installé (`npm install`, 123 paquets, 0 vulnérabilité) et tous les fichiers `.js`
> ont été vérifiés syntaxiquement (`node --check`) avec succès. En revanche,
> `npx prisma migrate dev` n'a pas pu être exécuté ici car Prisma télécharge ses
> moteurs binaires depuis `binaries.prisma.sh`, un domaine non joignable dans ce
> sandbox. **Chez vous / sur le poste du développeur, cette commande fonctionnera
> normalement** — c'est une simple restriction réseau de cet environnement de
> génération, pas un défaut du code.

## Architecture

```
backend/
  prisma/
    schema.prisma      # schéma complet de la base de données
    seed.js             # jeu de données de démonstration
  src/
    index.js            # point d'entrée Express
    db.js                # client Prisma partagé
    middleware/
      session.js         # cookie de panier invité
      auth.js             # JWT (optionalAuth / requireAuth)
      errorHandler.js     # gestion d'erreurs centralisée
    routes/               # définition des endpoints par domaine
    controllers/          # logique métier par domaine
    services/
      pricing.service.js  # calcul de prix + compatibilité des pièces
```

## Schéma de données — les entités clés

Le schéma (`prisma/schema.prisma`) couvre l'intégralité du parcours client transmis :

| Entité | Rôle |
|---|---|
| `Product` | Modèles du catalogue (Homme/Femme/Mixte), affichés dans le carrousel et « Découvrir nos modèles » |
| `Piece` + `PieceCompatibility` | Pièces du configurateur (boîtier, cadran, bracelet, aiguilles, options) et règles de compatibilité entre elles |
| `Configuration` | Une création personnalisée (sauvegardée ou partagée via `shareToken`) |
| `Packaging` | Les 4 options (01, 02, Premium, Coffret cadeau), utilisées à la fois pour l'étape obligatoire après ajout au panier et la page dédiée |
| `Cart` / `CartItem` | Panier invité (cookie de session) ou lié à un compte |
| `Order` / `OrderItem` | Commandes validées, avec statut pour la timeline de suivi |
| `Favorite` | Favoris liés à un compte |
| `Review` | Avis clients, avec photo optionnelle et réponse de la marque |

## Endpoints principaux

| Méthode | Route | Description |
|---|---|---|
| GET | `/api/products` | Catalogue, filtrable par `?category=HOMME\|FEMME\|MIXTE` |
| GET | `/api/products/carousel` | Photo + nom uniquement, pour le carrousel de la home |
| GET | `/api/products/:slug` | Fiche produit complète |
| GET | `/api/configurator/pieces?type=CADRAN&selected=id1,id2` | Pièces compatibles avec la sélection en cours |
| POST | `/api/configurator/price` | Prix dynamique à partir d'une liste de pièces |
| POST | `/api/configurator` | Créer / sauvegarder une configuration |
| GET | `/api/configurator/shared/:shareToken` | Récupérer une création partagée |
| GET/POST/PATCH/DELETE | `/api/cart...` | Panier (invité ou connecté) |
| GET/POST/DELETE | `/api/favorites...` | Favoris (compte requis) |
| GET | `/api/packaging` | Les options de packaging |
| GET/POST | `/api/reviews` | Avis clients |
| POST | `/api/auth/register`, `/api/auth/login` | Compte client |
| GET | `/api/account/orders`, `/api/account/configurations` | « Mon compte » |

Toutes les réponses d'erreur suivent le format `{ error: { message, code } }`.

## Ce qui reste à brancher pour la mise en production

Ce backend est une **fondation solide, pas un produit fini**. Ce que ce projet
ne couvre pas volontairement, et qui nécessite un vrai chantier :

1. **Paiement réel** — aucun PSP (Stripe, etc.) n'est intégré. `POST /api/account/orders`
   crée la commande mais ne débite personne. Il faut un compte marchand ARK, des clés
   API, et la gestion des webhooks de confirmation de paiement.
2. **Hébergement de la base de données** — SQLite convient au développement local
   uniquement. Passer `provider = "postgresql"` dans `schema.prisma` et héberger une
   vraie instance (Supabase, Railway, RDS...) avant la mise en ligne.
3. **Stockage des images** — les URLs d'images sont pour l'instant des photos
   Unsplash de démonstration. Il faudra un vrai service de stockage (S3, Cloudinary...)
   pour les photos produit et les photos d'avis clients envoyées par les acheteurs.
4. **Modération des avis** — `POST /api/reviews` accepte n'importe quel avis sans
   validation ; à encadrer avant mise en production (modération manuelle ou
   automatique).
5. **Fusion panier invité → panier compte** — à la connexion, le panier lié au
   cookie de session et celui lié au compte doivent être fusionnés (non implémenté).
