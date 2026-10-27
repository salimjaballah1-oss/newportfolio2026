# Portfolio — Salim Jaballah

Portfolio professionnel réalisé dans le cadre du BTS SIO (option SLAM),
session 2027 — support pour l'épreuve E5 (parcours de professionnalisation).

## Stack

Site 100 % statique — aucun backend, aucune base de données.

- HTML5 sémantique
- CSS3 (variables CSS, grid/flexbox, sans framework)
- JavaScript vanilla (aucune dépendance externe)
- Polices : Inter + Space Grotesk (Google Fonts)

## Structure

```
index.html              → page d'accueil (sections + cartes projets)
projets/*.html          → une page détaillée par projet
projets/i18n-projets.js → traductions anglaises des pages projet
i18n.js                 → bascule FR / EN (le français est dans le HTML)
style.css               → design system + responsive
script.js               → loader, navigation, captures, galerie (lightbox)
assets/projets/<projet>/→ captures d'écran publiées
captures/               → dépôt des captures brutes à trier (non publié)
CAPTURES.md             → emplacements de captures prévus
```

## Déploiement

Aucune étape de build nécessaire. Le site peut être déployé tel quel sur
GitHub Pages, Netlify ou Vercel en pointant sur `index.html`.

## À compléter

- Captures d'écran des projets (voir `CAPTURES.md`)
- Section personnalité / centres d'intérêt (« En dehors du code »)
