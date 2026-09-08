"""
Service de gestion des catalogues Firestore.

Ce module est responsable de :
- Générer un identifiant unique de catalogue
- Créer un document catalogue dans Firestore
- Initialiser la structure de base (sans pages ni produits)

Le titre ainsi que les dates saisonnières sont définis manuellement.
"""

from datetime import datetime
from config import db


def generate_catalogue_id() -> str:
    """
    Génère un identifiant unique pour un catalogue.

    Format :
    catalogue_YYYY_MM_DD_HHMMSS

    Exemple :
    catalogue_2026_01_02_161723

    Returns:
        str: Identifiant unique du catalogue
    """
    now = datetime.now()
    return f"catalogue_{now.strftime('%Y_%m_%d_%H%M%S')}"


def create_catalogue(
    titre: str,
    date_debut: datetime,
    date_fin: datetime
) -> str:
    """
    Crée un nouveau document catalogue dans Firestore.

    Cette fonction :
    - Génère un ID unique
    - Initialise les champs principaux
    - Prépare la structure pour accueillir pages et produits

    Args:
        titre (str): Titre du catalogue (défini manuellement)
        date_debut (datetime): Date de début de saison
        date_fin (datetime): Date de fin de saison

    Returns:
        str: L'identifiant du catalogue créé
    """

    # Génération de l'identifiant unique
    catalogue_id = generate_catalogue_id()

    # Date actuelle (date de création technique)
    now = datetime.now()

    # Référence du document Firestore
    doc_ref = db.collection("catalogues").document(catalogue_id)

    # Création du document avec les champs initiaux
    doc_ref.set({
        # Année logique basée sur la saison
        "annee": date_debut.year,

        # Identifiant unique du catalogue
        "catalogueId": catalogue_id,

        # Date de création technique du document
        "date": now,

        # Dates saisonnières définies manuellement
        "date_Debut": date_debut,
        "date_Fin": date_fin,

        # Statut du catalogue
        "status": "actif",

        # Titre défini par l'utilisateur
        "titre": titre,

        # Type de document (utile si évolution future)
        "type": "catalogue",

        # Liste des images de pages (sera remplie après traitement PDF)
        "images": [],

        # Image de couverture (sera la première page après traitement)
        "cover": ""
    })

    print(f"✓ Catalogue créé avec succès : {catalogue_id}")

    return catalogue_id
