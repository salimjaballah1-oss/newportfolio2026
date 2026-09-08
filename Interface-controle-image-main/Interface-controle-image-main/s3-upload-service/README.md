# s3-upload-service

Micro-service qui reçoit la **photo HD** (fichier original, non compressé) depuis
l'interface produit et la dépose directement sur S3, en contournant la limite
de taille (413) de l'API Admin Chazal. Les photos "web" (compressées)
continuent d'être envoyées à l'API Admin comme avant — seule la HD passe par ici.

## Déploiement : intégré à l'app principale (pas une app Coolify séparée)

Ce service tourne **dans le même conteneur** que le site (nginx). Le
[Dockerfile](../Dockerfile) à la racine du projet construit les deux :
nginx sert le front, et lance ce service Node en interne au démarrage
(voir [entrypoint.sh](../entrypoint.sh)). nginx proxy en interne les
requêtes `/s3-upload/*` vers `http://127.0.0.1:4000` (voir
[nginx.conf](../nginx.conf)) — le port 4000 n'est jamais exposé à
l'extérieur du conteneur.

```
navigateur ──(même origine, /s3-upload/upload-hd)──▶ nginx ──(proxy interne :4000)──▶ node ──▶ S3
```

Conséquence : **une seule app Coolify**, un seul domaine, pas de CORS à
configurer, pas de variable `VITE_S3_UPLOAD_URL` à définir.

### Variables d'environnement à ajouter sur l'app Coolify existante

(celle qui sert déjà le site — pas une nouvelle app)

```
AWS_REGION=eu-west-3
AWS_ACCESS_KEY_ID=...
AWS_SECRET_ACCESS_KEY=...
S3_BUCKET=maisonchazal
S3_PREFIX=image/products-hd
S3_ACL=public-read
```

Rien d'autre à toucher (ni le port, ni "Ports Exposes", qui restent à 80).

## Développement local

`npm run dev` (à la racine du front) lance désormais vite + le serveur GED
local + ce service, tous les trois ensemble (voir `package.json`). Le fichier
`.env` de ce dossier (`s3-upload-service/.env`, jamais commité) doit contenir
les mêmes variables que ci-dessus.

## Fichiers `Dockerfile` / `.dockerignore` de ce dossier

Ils ne sont **plus utilisés par Coolify** (qui construit désormais tout depuis
le `Dockerfile` racine). Ils restent utiles uniquement si tu veux tester ce
service seul, en dehors du conteneur principal (`docker build` +
`docker run` directement dans ce dossier).

## Ce dont j'ai besoin de ta part

- **Credentials AWS** d'un utilisateur IAM avec une policy limitée à ce bucket
  (voir `iam-policy.example.json`) — pas de clé root ni de clé avec des droits
  larges.
- Confirmation que le bucket `maisonchazal` autorise la lecture publique sur
  `image/products-hd/*` (ACL `public-read` par objet, comme le reste du
  bucket, ou une bucket policy équivalente si les ACLs sont désactivées).
