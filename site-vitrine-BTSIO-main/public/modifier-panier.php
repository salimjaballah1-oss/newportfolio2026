<?php
session_start();
require_once __DIR__ . '/../src/lib/functions.php';
require_once __DIR__ . '/../src/repositories/panierRepository.php';

requireConnexion();

$produitId = (int) ($_POST['produit_id'] ?? 0);
$quantite = (int) ($_POST['quantite'] ?? 1);

if ($produitId > 0 && updateQuantitePanier(getUtilisateurConnecteId(), $produitId, $quantite)) {
    setFlashMessage("Panier mis a jour.");
} else {
    setFlashMessage("Impossible de modifier le panier.", "error");
}

redirectTo("panier.php");
?>
