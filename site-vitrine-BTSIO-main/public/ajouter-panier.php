<?php
session_start();
require_once __DIR__ . '/../src/lib/functions.php';
require_once __DIR__ . '/../src/repositories/panierRepository.php';

requireConnexion();

$produitId = (int) ($_POST['produit_id'] ?? 0);

if ($produitId > 0 && addProduitPanier(getUtilisateurConnecteId(), $produitId)) {
    setFlashMessage("Produit ajoute au panier.");
} else {
    setFlashMessage("Impossible d'ajouter ce produit.", "error");
}

redirectTo($_SERVER['HTTP_REFERER'] ?? 'produits.php');
?>
