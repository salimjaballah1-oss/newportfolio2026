# Captures d'écran

## Comment ça marche

1. Dépose toutes tes captures en vrac dans `captures/` (dossier non publié).
2. Claude les trie et les copie dans `assets/projets/<projet>/` sous les noms
   ci-dessous (ou en ajoute d'autres), avec leur légende FR/EN.
3. Une capture présente apparaît automatiquement sur la page du projet ; la
   première devient l'image principale de la page et de la carte de l'accueil.
   Une capture absente est simplement masquée.

Pour voir les emplacements encore vides : ouvrir une page projet avec `?captures`
(ex. `projets/catalogue.html?captures`).

## Règles

- **Floute ou remplace toute donnée réelle** : noms de clients, de commerciaux,
  emails, téléphones, adresses, prix, chiffres de vente. Sur ChazalGo, c'est
  indispensable (RGPD).
- **Jamais de clé ni de jeton visible** : en-têtes `Authorization` dans Postman,
  fichiers `.env`, console Firebase / AWS.
- Pas d'URL interne ni d'adresse IP dans la barre d'adresse.
- Fais valider les captures des projets Chazal par ton maître d'alternance.
- Desktop : fenêtre ~1440 px de large, zoom 100 %. Mobile : portrait.

## État des captures

✅ = en ligne · ⬜ = emplacement prévu, encore vide. Images en `.webp`, vidéos en
`.mp4` (H.264, sans le son).

| Projet | Dossier | Captures |
|---|---|---|
| Photos produits | `assets/projets/photos/` | ✅ recherche · fiche produit · actions · IA · ambiance · ma liste · historique · vidéo de démo — ⬜ `08-import-masse` |
| Synchro S3 → GED | `assets/projets/ged/` | ⬜ `01-terminal` · `02-registre-excel` · `03-dossier-ged` |
| Catalogue | `assets/projets/catalogue/` | ✅ dépôt · générer · catalogues en ligne · visionneuse · 2 vidéos — ⬜ `05-suivi` (page de suivi pendant une génération) |
| ChazalGo | `assets/projets/chazalgo/` | ✅ carte (noms floutés) · utilisateurs (floutés) · droits — ⬜ `04-tableau-de-bord` (avec de vraies valeurs, chiffres floutés) |
| myChazal (mobile) | `assets/projets/mychazal/` | ✅ lancements — ⬜ `02-catalogues` · `03-partage` |
| Les Halles (mobile) | `assets/projets/leshalles/` | ✅ accueil · catalogues · page · produits · challenge · boutique — ⬜ `07-flutterflow` · `08-firebase` · `09-postman` |
| CinéSIO | `assets/projets/cinesio/` | ⬜ `01-catalogue` · `02-fiche-film` · `03-favoris` · `04-ajout-film` · `05-profil` |
| site-vitrine-BTSIO | `assets/projets/vitrine/` | ✅ accueil · produits · fiche produit · panier |
| Agent emploi | `assets/projets/agent/` | ⬜ `01-offres` · `02-detail-score` · `03-candidatures` · `04-recherche-auto` · `05-tests` |
| calorie-app | `assets/projets/calorie/` | ⬜ `01-suivi` · `02-recherche-aliment` |

## Modifier le contenu des pages projet

Les pages `projets/*.html` sont du HTML statique : on peut les modifier
directement. Le texte français est dans le HTML ; sa traduction anglaise est
dans `projets/i18n-projets.js`, sous la même clé `data-i18n`.
