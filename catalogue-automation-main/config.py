"""
Configuration centrale du pipeline d'automatisation catalogue.
"""

import os
import logging
from dotenv import load_dotenv

import boto3
import firebase_admin
from firebase_admin import credentials, firestore
from botocore.exceptions import ClientError


# --------------------------------------------------
# Logging
# --------------------------------------------------

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(levelname)s - %(message)s"
)

logger = logging.getLogger(__name__)


# --------------------------------------------------
# Chargement des variables d'environnement
# --------------------------------------------------

load_dotenv()

REQUIRED_ENV_VARS = [
    "AWS_ACCESS_KEY_ID",
    "AWS_SECRET_ACCESS_KEY",
    "AWS_REGION",
    "S3_BUCKET_NAME",
    "FIREBASE_KEY_PATH",
    "API_BASE_URL",
    "API_TOKEN",
]

for var in REQUIRED_ENV_VARS:
    if not os.getenv(var):
        raise ValueError(f"Variable d'environnement manquante : {var}")


AWS_ACCESS_KEY_ID = os.getenv("AWS_ACCESS_KEY_ID")
AWS_SECRET_ACCESS_KEY = os.getenv("AWS_SECRET_ACCESS_KEY")
AWS_REGION = os.getenv("AWS_REGION")
S3_BUCKET_NAME = os.getenv("S3_BUCKET_NAME")

FIREBASE_KEY_PATH = os.getenv("FIREBASE_KEY_PATH")

API_BASE_URL = os.getenv("API_BASE_URL")
API_TOKEN = os.getenv("API_TOKEN")


# --------------------------------------------------
# Initialisation AWS S3
# --------------------------------------------------

try:
    s3 = boto3.client(
        "s3",
        aws_access_key_id=AWS_ACCESS_KEY_ID,
        aws_secret_access_key=AWS_SECRET_ACCESS_KEY,
        region_name=AWS_REGION
    )

    # Test rapide bucket
    s3.head_bucket(Bucket=S3_BUCKET_NAME)
    logger.info(f"S3 connecté (bucket: {S3_BUCKET_NAME})")

except ClientError as e:
    raise RuntimeError(f"Erreur connexion S3 : {e}")


# --------------------------------------------------
# Initialisation Firebase / Firestore
# --------------------------------------------------

if not os.path.exists(FIREBASE_KEY_PATH):
    raise FileNotFoundError(f"Fichier Firebase introuvable : {FIREBASE_KEY_PATH}")

if not firebase_admin._apps:
    cred = credentials.Certificate(FIREBASE_KEY_PATH)
    firebase_admin.initialize_app(cred)

db = firestore.client()
logger.info("Firestore connecté")


# --------------------------------------------------
# Headers API
# --------------------------------------------------

api_headers = {
    "Authorization": f"Bearer {API_TOKEN}",
    "Content-Type": "application/json"
}


# --------------------------------------------------
# Helper pour construire URL API
# --------------------------------------------------

def build_api_url(endpoint: str = "") -> str:
    base = API_BASE_URL.rstrip("/")
    endpoint = endpoint.lstrip("/")
    return f"{base}/{endpoint}" if endpoint else base


# --------------------------------------------------
# Test direct
# --------------------------------------------------

if __name__ == "__main__":
    print("Configuration OK")
    print(f"Bucket S3 : {S3_BUCKET_NAME}")
    print(f"API Base : {API_BASE_URL}")
