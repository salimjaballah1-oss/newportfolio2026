from datetime import datetime
from catalogue_service import create_catalogue

catalogue_id = create_catalogue(
    titre="Été 2026",
    date_debut=datetime(2026, 6, 1),
    date_fin=datetime(2026, 9, 30)
)

print("Catalogue ID :", catalogue_id)
