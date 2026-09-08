# Pipeline d'Automatisation de Catalogues

## Installation

1. **Installer les dépendances** :
```bash
pip install -r requirements.txt
```

2. **Configurer les variables d'environnement** :

Créez un fichier `.env` à la racine du projet (utilisez `.env.example` comme modèle) :

```bash
cp .env.example .env
```

Puis éditez `.env` avec vos vraies valeurs.

3. **Charger les variables d'environnement** :

Pour charger automatiquement le fichier `.env`, ajoutez ceci au début de votre script :

```python
from dotenv import load_dotenv
load_dotenv()  # Charge le fichier .env
```

## Utilisation

### Méthode 1 : Initialisation complète

```python
from dotenv import load_dotenv
from config import initialize_all

# Charger les variables d'environnement
load_dotenv()

# Initialiser tous les services
s3_client, firestore_client, api_headers = initialize_all()

# Utiliser les clients
response = s3_client.list_objects_v2(Bucket='mon-bucket')
doc_ref = firestore_client.collection('catalogues').document('test')
```

### Méthode 2 : Initialisation sélective

```python
from dotenv import load_dotenv
from config import get_config

load_dotenv()

config = get_config()

# Initialiser uniquement ce dont vous avez besoin
s3 = config.get_s3_client()
db = config.get_firestore_client()
headers = config.get_api_headers()
api_url = config.get_api_url('/endpoint')
```

### Méthode 3 : Tester la configuration

```bash
python config.py
```

## Variables d'environnement requises

| Variable | Description |
|----------|-------------|
| `AWS_ACCESS_KEY_ID` | Clé d'accès AWS |
| `AWS_SECRET_ACCESS_KEY` | Clé secrète AWS |
| `AWS_REGION` | Région AWS (ex: eu-west-3) |
| `S3_BUCKET_NAME` | Nom du bucket S3 |
| `FIREBASE_KEY_PATH` | Chemin vers le fichier JSON de clés Firebase |
| `API_BASE_URL` | URL de base de l'API REST |
| `API_TOKEN` | Token Bearer pour l'API |

## Sécurité

⚠️ **IMPORTANT** :
- Ne jamais commiter le fichier `.env` dans Git
- Ajouter `.env` dans `.gitignore`
- Ne jamais hardcoder les clés dans le code

## Gestion des erreurs

Le module lève une `ConfigurationError` si :
- Une variable d'environnement requise est manquante
- Le fichier de clés Firebase est introuvable
- La connexion à S3 échoue
- L'initialisation de Firebase échoue

## Logs

Le module utilise le module `logging` de Python. Les logs incluent :
- ✓ Succès de chargement des variables
- ✓ Succès d'initialisation des services
- ✗ Erreurs de configuration
- ⚠ Avertissements

Exemple de sortie :
```
2026-02-11 16:40:00 - config - INFO - Chargement des variables d'environnement...
2026-02-11 16:40:00 - config - INFO - ✓ AWS_ACCESS_KEY_ID chargée
2026-02-11 16:40:00 - config - INFO - ✓ AWS_SECRET_ACCESS_KEY chargée
...
2026-02-11 16:40:01 - config - INFO - ✓ Client S3 initialisé avec succès (bucket: catalogues-chz)
2026-02-11 16:40:01 - config - INFO - ✓ Client Firestore initialisé avec succès
```
