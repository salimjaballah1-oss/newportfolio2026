# s3-to-ged-sync

> ⚠️ Le nom du dossier est trompeur (historique) — ce script ne touche **pas**
> au partage GED Infologic (`\\10.1.2.63\ged_infologic\...`). Les photos HD
> vont sur le lecteur réseau de la **BDD Photos** : `U:\BDD Photos\PHOTOS_V`.

Script Python à lancer depuis un poste ayant le lecteur `U:` monté (ni S3 ni
Coolify ne peuvent l'atteindre — c'est pour ça que ça tourne depuis un PC sur
le réseau, pas dans le cloud).

## Ce qu'il fait

À chaque exécution :
1. Liste tout ce qui existe actuellement sur S3 sous `image/products-hd/`
2. Compare avec `synced_state.json` (créé automatiquement à côté du script) —
   la liste de ce qui a déjà été copié
3. Télécharge uniquement les nouvelles photos et les dépose dans
   `U:\BDD Photos\PHOTOS_V\{code}\{code}-hd.jpg`

Comme l'état est sauvegardé sur disque (pas en mémoire), le script identifie
correctement les nouvelles arrivées à chaque redémarrage — peu importe qui a
uploadé la photo (n'importe quel utilisateur de l'interface produit) ni
depuis combien de temps le script était arrêté entre deux lancements.

## Installation

```
pip install -r requirements.txt
copy .env.example .env
```

Puis remplir `.env` avec les credentials AWS (les mêmes que `s3-upload-service`
fonctionnent, à condition d'avoir aussi les droits `s3:ListBucket` et
`s3:GetObject` sur le bucket — voir plus bas).

## Utilisation

```
python sync.py
```

Relance-le quand tu veux : il ne retraite jamais ce qui a déjà été copié.
Si tu veux l'automatiser plus tard, ça se planifie facilement avec le
planificateur de tâches Windows (ex. toutes les 15 minutes).

## Permissions IAM nécessaires

Ce script est en **lecture seule** sur S3 (il ne fait que lister et
télécharger). Il faut ajouter ces deux actions à la policy IAM existante
(`S3UploadServiceHDPhotos`), en plus de celles déjà en place pour
`s3-upload-service` :

```json
{
  "Version": "2012-10-17",
  "Statement": [
    {
      "Sid": "S3UploadServiceHDPhotos",
      "Effect": "Allow",
      "Action": ["s3:PutObject", "s3:PutObjectAcl", "s3:DeleteObject"],
      "Resource": "arn:aws:s3:::maisonchazal/image/products-hd/*"
    },
    {
      "Sid": "S3SyncReadHDPhotos",
      "Effect": "Allow",
      "Action": ["s3:GetObject"],
      "Resource": "arn:aws:s3:::maisonchazal/image/products-hd/*"
    },
    {
      "Sid": "S3SyncListHDPhotos",
      "Effect": "Allow",
      "Action": ["s3:ListBucket"],
      "Resource": "arn:aws:s3:::maisonchazal",
      "Condition": {
        "StringLike": { "s3:prefix": ["image/products-hd/*"] }
      }
    }
  ]
}
```

(`ListBucket` s'applique sur le bucket lui-même, pas sur les objets — d'où
la ressource différente et la condition qui restreint le listage au même
dossier.)
