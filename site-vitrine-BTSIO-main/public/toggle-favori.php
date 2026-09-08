<?php
session_start();
require_once __DIR__ . '/../src/lib/functions.php';
require_once __DIR__ . '/../src/repositories/favoriRepository.php';

requireConnexion();

$produitId = (int) ($_POST['produit_id'] ?? 0);
$utilisateurId = getUtilisateurConnecteId();

if ($produitId <= 0) {
    setFlashMessage("Produit invalide.", "error");
    redirectTo("produits.php");
}

if (isProduitFavori($utilisateurId, $produitId)) {
    removeFavori($utilisateurId, $produitId);
    setFlashMessage("Produit retire des favoris.");
} else {
    addFavori($utilisateurId, $produitId);
    setFlashMessage("Produit ajoute aux favoris.");
}

redirectTo($_SERVER['HTTP_REFERER'] ?? 'produits.php');
?>
