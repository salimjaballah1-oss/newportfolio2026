<?php
session_start();
require_once __DIR__ . '/../src/lib/functions.php';
require_once __DIR__ . '/../src/repositories/panierRepository.php';

requireConnexion();

$produitId = (int) ($_POST['produit_id'] ?? 0);

if ($produitId > 0 && removeProduitPanier(getUtilisateurConnecteId(), $produitId)) {
    setFlashMessage("Produit supprime du panier.");
} else {
    setFlashMessage("Impossible de supprimer ce produit du panier.", "error");
}

redirectTo("panier.php");
?>
