<?php
if (session_status() === PHP_SESSION_NONE) {
    session_start();
}

require_once __DIR__ . '/../lib/functions.php';

$pageCourante = basename($_SERVER['PHP_SELF']);
$flash = getFlashMessage();
?>
<!DOCTYPE html>
<html lang="fr">

<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Bad Kings</title>
    <link rel="stylesheet" href="assets/css/style.css">
</head>

<body>
    <nav class="barre-navigation">
        <div class="nav-categories">
            <a href="index.php" class="lien-nav <?= $pageCourante === 'index.php' ? 'actif' : '' ?>">Accueil</a>
            <a href="produits.php" class="lien-nav <?= in_array($pageCourante, ['produits.php', 'produit.php'], true) ? 'actif' : '' ?>">Produits</a>
            <a href="histoire.php" class="lien-nav <?= $pageCourante === 'histoire.php' ? 'actif' : '' ?>">Histoire</a>
            <a href="poste.php" class="lien-nav <?= $pageCourante === 'poste.php' ? 'actif' : '' ?>">Equipe</a>
            <a href="contact.php" class="lien-nav <?= $pageCourante === 'contact.php' ? 'actif' : '' ?>">Contact</a>
        </div>

        <div class="nav-logo">
            <a href="index.php">
                <img src="assets/icon/BD.png" alt="Logo Bad Kings" class="image-logo">
            </a>
        </div>

        <div class="nav-actions">
            <a href="panier.php" class="lien-action <?= $pageCourante === 'panier.php' ? 'actif' : '' ?>">
                <img src="assets/icon/shopping-bag.png" alt="Panier" class="icone-panier">
            </a>
            <a href="favoris.php" class="lien-action <?= $pageCourante === 'favoris.php' ? 'actif' : '' ?>">
                <img src="assets/icon/love.png" alt="Favoris" class="icone-favoris">
            </a>
            <?php if (isUtilisateurConnecte()): ?>
                <span class="user-pill"><?= htmlspecialchars($_SESSION['utilisateur']['pseudo']) ?></span>
                <a href="deconnexion.php" class="auth-link">Deconnexion</a>
            <?php else: ?>
                <a href="connexion.php" class="auth-link <?= $pageCourante === 'connexion.php' ? 'actif' : '' ?>">Connexion</a>
                <a href="inscription.php" class="auth-link auth-strong <?= $pageCourante === 'inscription.php' ? 'actif' : '' ?>">Inscription</a>
            <?php endif; ?>
        </div>
    </nav>

    <?php if ($flash): ?>
        <div class="flash flash-<?= htmlspecialchars($flash['type']) ?>">
            <?= htmlspecialchars($flash['message']) ?>
        </div>
    <?php endif; ?>

    <main>
