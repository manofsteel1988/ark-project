# ARK — Projet complet

Site e-commerce de montres personnalisables (ARK), Suisse & France.

```
ark-project/
  frontend/    → site statique (HTML/CSS/JS), démo autonome ou branchée sur l'API
  backend/     → API Node/Express + Prisma, prête à héberger
```

## Pour démarrer

1. **Voir le site tout de suite, sans rien installer** → ouvrir
   `frontend/pages/accueil.html` dans un navigateur (voir `frontend/README.md`).
2. **Mettre en route l'API réelle** → suivre `backend/README.md`
   (`npm install`, `npx prisma migrate dev`, `npm run seed`, `npm run dev`),
   puis passer `frontend/js/api.js` en `mode: "live"`.

## État du projet

- ✅ Toutes les pages du parcours client validé (accueil, configurateur,
  étape packaging obligatoire, catalogue avec filtres, fiche produit, panier,
  packaging, pack couple)
- ✅ Configurateur avec vraie logique de compatibilité des pièces et prix
  dynamique
- ✅ Panier, favoris, avis clients avec photo — fonctionnels
- ✅ Backend testé : installation npm propre, tout le code validé
  syntaxiquement
- ⚠️ Prisma n'a pas pu migrer dans l'environnement de génération (domaine
  bloqué) — à faire chez le développeur, voir `backend/README.md`
- ❌ Pas de paiement réel, pas de vrai configurateur 3D, pas d'hébergement —
  ce sont les prochains chantiers, détaillés dans `backend/README.md`
  ("Ce qui reste à brancher pour la mise en production")

## Pour le développeur qui reprend le projet

Le schéma de données (`backend/prisma/schema.prisma`) est le document de
référence : il couvre toutes les entités du cahier des charges (produits,
pièces et compatibilité, configurations sauvegardées/partagées, panier,
commandes avec statut de suivi, favoris, avis avec photo, packaging). Les
contrôleurs Express (`backend/src/controllers/`) contiennent déjà la logique
métier (calcul de prix, filtrage par compatibilité) — pas seulement des
routes vides.
