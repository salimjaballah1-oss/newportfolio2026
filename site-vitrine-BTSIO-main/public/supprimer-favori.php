<?php
session_start();
require_once __DIR__ . '/../src/lib/functions.php';
require_once __DIR__ . '/../src/repositories/favoriRepository.php';

requireConnexion();

$produitId = (int) ($_POST['produit_id'] ?? 0);

if ($produitId > 0 && removeFavori(getUtilisateurConnecteId(), $produitId)) {
    setFlashMessage("Produit supprime des favoris.");
} else {
    setFlashMessage("Impossible de supprimer ce favori.", "error");
}

redirectTo("favoris.php");
?>
