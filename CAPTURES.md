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

## Captures en ligne

Images en `.webp`, vidéos en `.mp4` (H.264, sans le son). Seuls les projets qui
ont de vraies captures sont présentés sur le site : pour en ajouter un autre
(CinéSIO, agent emploi, calorie-app…), dépose d'abord ses captures.

| Projet | Dossier | Contenu |
|---|---|---|
| Photos produits (+ synchro GED) | `assets/projets/photos/` | 7 captures, 1 vidéo |
| Catalogue | `assets/projets/catalogue/` | 4 captures, 2 vidéos |
| ChazalGo | `assets/projets/chazalgo/` | 3 captures (noms et emails floutés) |
| Les Halles (mobile) | `assets/projets/leshalles/` | 6 captures (+ vidéo du catalogue) |
| myChazal (mobile) | `assets/projets/mychazal/` | 1 capture |
| site-vitrine-BTSIO | `assets/projets/vitrine/` | 4 captures |

Captures utiles à ajouter plus tard : suivi d'une génération de catalogue,
dashboard ChazalGo (chiffres floutés), FlutterFlow / Firebase / Postman pour
Les Halles, catalogues et partage dans myChazal.

## Modifier le contenu des pages projet

Les pages `projets/*.html` sont du HTML statique : on peut les modifier
directement. Le texte français est dans le HTML ; sa traduction anglaise est
dans `projets/i18n-projets.js`, sous la même clé `data-i18n`.
