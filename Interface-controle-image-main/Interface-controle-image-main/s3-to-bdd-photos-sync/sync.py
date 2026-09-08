r"""
Synchronise les photos HD et web deposees sur S3 vers le lecteur reseau de la
BDD Photos (par defaut U:\BDD Photos\PHOTOS_V\{code}\).

ATTENTION : ce n'est PAS le partage GED Infologic (\\10.1.2.63\...). Les
photos HD ne doivent jamais y aller (la web y est envoyee separement, en
direct depuis l'appli, hors de ce script). Destination ici : U:\BDD Photos\PHOTOS_V
pour les DEUX variantes (HD et web).

A executer depuis un poste ayant ce lecteur U: monte -- S3 et Coolify n'y ont
pas acces, d'ou ce pont local.

A chaque execution, pour chaque variante (hd, web) :
  1. liste TOUT ce qui existe actuellement sur S3 sous son prefixe
  2. compare avec l'etat local (synced_state.json) : ce qui a deja ete copie
  3. ne traite que les nouvelles photos -- peu importe qui les a envoyees,
     ni depuis combien de temps le script etait arrete entre deux executions

Nommage des fichiers dans la BDD Photos ({code}-hd.ext / {code}-web.ext) a
confirmer -- voir VARIANTS ci-dessous, facilement ajustable.

Utilisation :
    pip install -r requirements.txt
    copier .env.example en .env et renseigner les valeurs
    python sync.py
"""
import json
import os
import sys
from pathlib import Path

import boto3
from botocore.exceptions import ClientError
from dotenv import load_dotenv

# Charge les variables depuis le fichier .env a cote de ce script (jamais commite).
load_dotenv()

AWS_REGION = os.environ.get("AWS_REGION", "eu-west-3")
# Ces deux-la sont obligatoires : os.environ[...] (et pas .get) plante volontairement
# si elles manquent, plutot que de laisser boto3 echouer plus loin avec une erreur
# moins claire.
AWS_ACCESS_KEY_ID = os.environ["AWS_ACCESS_KEY_ID"]
AWS_SECRET_ACCESS_KEY = os.environ["AWS_SECRET_ACCESS_KEY"]
S3_BUCKET = os.environ.get("S3_BUCKET", "maisonchazal")

# Racine de la BDD Photos (PAS le partage GED Infologic -- confirme explicitement
# par Salim : les HD ne doivent pas atterrir sur \\10.1.2.63\ged_infologic).
# Les DEUX variantes (hd, web) atterrissent ici.
DEST_ROOT = os.environ.get("DEST_ROOT", r"U:\BDD Photos\PHOTOS_V")

# Une entree par variante geree par s3-upload-service (meme prefixes que cote
# Node -- voir S3_PREFIX_HD / S3_PREFIX_WEB dans s3-upload-service/server.js).
# "suffix" = ce qui est ajoute au nom de fichier local ({code}-hd.ext, etc.) --
# a ajuster ici si le nommage final valide avec le MA est different.
VARIANTS = {
    "hd":  {
        "prefix": os.environ.get("S3_PREFIX_HD", "image/products-hd/"),
        "suffix": "hd",
    },
    "web": {
        "prefix": os.environ.get("S3_PREFIX_WEB", "image/products-web/"),
        "suffix": "web",
    },
}

# Petit fichier JSON a cote du script : la liste des cles S3 deja copiees
# (toutes variantes confondues, les cles ne se chevauchent jamais puisqu'elles
# vivent sous des prefixes differents). C'est ce fichier qui permet au script
# de "se souvenir" d'une execution a l'autre, meme si le PC a redemarre ou si
# le script a ete ferme entre-temps.
STATE_FILE = Path(__file__).parent / "synced_state.json"


def load_state():
    """Relit la liste des cles S3 deja synchronisees (vide si premier lancement)."""
    if STATE_FILE.exists():
        return set(json.loads(STATE_FILE.read_text(encoding="utf-8")))
    return set()


def save_state(keys):
    """Reecrit l'etat sur disque. Appele apres CHAQUE fichier traite (pas juste
    a la fin) pour qu'un crash en cours de route ne fasse perdre que l'element
    en cours, pas tout le travail deja fait pendant cette execution."""
    STATE_FILE.write_text(
        json.dumps(sorted(keys), ensure_ascii=False, indent=2), encoding="utf-8"
    )


def extract_product_code(key):
    """Extrait le code produit depuis la cle S3.
    Format attendu : image/products-<variante>/{code}/{code}-xxxx.ext
    -> parts[0]=image, parts[1]=products-<variante>, parts[2]=code
    """
    parts = key.split("/")
    if len(parts) < 3:
        return None
    return parts[2]


def list_new_keys(s3, prefix, already_synced):
    """Liste TOUT ce qui existe actuellement sous ce prefixe (pas de notion de
    "depuis quand" cote S3 : on prend l'etat complet a l'instant T) puis ne
    garde que ce qui est absent de l'etat local -- le coeur de la logique
    "identifier les nouveaux arrivages", peu importe qui a uploade ou quand.
    Pagine automatiquement si + de 1000 objets."""
    paginator = s3.get_paginator("list_objects_v2")
    all_keys = [
        obj["Key"]
        for page in paginator.paginate(Bucket=S3_BUCKET, Prefix=prefix)
        for obj in page.get("Contents", [])
        if not obj["Key"].endswith("/")  # ignore les "dossiers" virtuels S3
    ]
    return [k for k in all_keys if k not in already_synced]


def main():
    # Meme mecanisme de credentials que s3-upload-service (cote Node) : simple
    # couple access key / secret key, scope au meme bucket/prefixes.
    s3 = boto3.client(
        "s3",
        region_name=AWS_REGION,
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
    )

    already_synced = load_state()

    # (cle, suffixe de nom de fichier) pour chaque nouveaute, toutes variantes
    # confondues -- on traite tout dans la meme boucle plus bas.
    to_process = []
    for variant_name, variant in VARIANTS.items():
        try:
            new_keys = list_new_keys(s3, variant["prefix"], already_synced)
        except ClientError as e:
            print(f"Erreur lors du listage S3 ({variant_name}) : {e}", file=sys.stderr)
            continue
        to_process.extend((key, variant["suffix"]) for key in new_keys)

    if not to_process:
        print("Rien de nouveau.")
        return

    print(f"{len(to_process)} nouvelle(s) photo(s) a synchroniser...")

    ok, errors = 0, 0
    for key, suffix in to_process:
        code = extract_product_code(key)
        if not code:
            # cle qui ne suit pas le format attendu -> on ne sait pas dans quel
            # dossier produit la ranger, on la signale et on passe a la suite
            print(f"  ! cle ignoree (format inattendu) : {key}")
            continue

        ext = key.rsplit(".", 1)[-1].lower() if "." in key else "jpg"
        dest_dir = Path(DEST_ROOT) / code
        # Toujours le meme nom de fichier par produit et par variante
        # ({code}-hd.ext, {code}-web.ext) : une nouvelle photo ecrase la
        # precedente au lieu d'en empiler indefiniment.
        # NB : structure (sous-dossier par code) et nommage exact a confirmer
        # avec le MA -- a ajuster ici si besoin.
        dest_file = dest_dir / f"{code}-{suffix}.{ext}"

        try:
            dest_dir.mkdir(parents=True, exist_ok=True)
            s3.download_file(S3_BUCKET, key, str(dest_file))
            print(f"  OK    {key} -> {dest_file}")
            already_synced.add(key)
            save_state(already_synced)
            ok += 1
        except Exception as e:
            # Une erreur sur un fichier (reseau coupe, droits, etc.) ne doit
            # pas interrompre le lot : on la signale et on continue les autres.
            # La cle reste absente de l'etat -> elle sera retentee au prochain
            # lancement.
            print(f"  ERREUR {key} : {e}")
            errors += 1

    print(f"\nTermine : {ok} copiee(s), {errors} erreur(s).")


if __name__ == "__main__":
    main()
