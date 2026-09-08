"""
Service de traitement des fichiers PDF catalogue.

Ce module est responsable de :
- Ouvrir le PDF avec PyMuPDF
- Extraire les codes produits par page
- Exporter chaque page en image
- Retourner une structure exploitable pour la suite du pipeline
"""

import fitz  # PyMuPDF
import re
import os
from typing import List, Dict


def extract_product_codes(text: str) -> List[str]:
    """
    Extrait les codes produits à 5 chiffres depuis le texte d'une page
    et les convertit au format 8 chiffres avec padding zéro.

    Exemple :
    41701 -> 00041701

    Args:
        text (str): Texte brut extrait du PDF

    Returns:
        List[str]: Liste des codes produits formatés
    """

    # Recherche des nombres à 5 chiffres
    raw_codes = re.findall(r"\b\d{5}\b", text)

    # Suppression doublons + conversion format 8 chiffres
    formatted_codes = list(set(code.zfill(8) for code in raw_codes))

    return formatted_codes


def process_pdf(pdf_path: str, output_folder: str = "temp_pages") -> List[Dict]:
    """
    Traite un PDF catalogue.

    Pour chaque page :
    - Extrait les codes produits
    - Exporte la page en image JPG
    - Retourne les métadonnées nécessaires

    Args:
        pdf_path (str): Chemin du fichier PDF
        output_folder (str): Dossier temporaire pour stocker les images

    Returns:
        List[Dict]: Liste des données par page
    """

    if not os.path.exists(pdf_path):
        raise FileNotFoundError(f"PDF introuvable : {pdf_path}")

    # Création du dossier temporaire si nécessaire
    os.makedirs(output_folder, exist_ok=True)

    doc = fitz.open(pdf_path)

    pages_data = []

    for page_number, page in enumerate(doc, start=1):

        # --- ID de page formaté ---
        page_id = f"page_{page_number:03d}"

        # --- Extraction texte ---
        text = page.get_text()

        # --- Extraction codes produits ---
        product_codes = extract_product_codes(text)

        # --- Export image ---
        pix = page.get_pixmap(dpi=200)
        image_path = os.path.join(output_folder, f"{page_id}.jpg")
        pix.save(image_path)

        # --- Stockage des données ---
        pages_data.append({
            "pageId": page_id,
            "pageNumber": page_number,
            "imagePath": image_path,
            "productCodes": product_codes,
            "productCount": len(product_codes)
        })

    doc.close()

    return pages_data
