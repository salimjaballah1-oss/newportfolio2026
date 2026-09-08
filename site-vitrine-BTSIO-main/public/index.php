<?php
require_once __DIR__ . '/../src/repositories/produitRepository.php';

$produits = array_slice(findAllProduits(), 0, 4);

include __DIR__ . '/../src/includes/header.php';
?>

<section class="hero">
    <div>
        <h1>Bad Kings<br>By SAL.</h1>
        <p>Streetwear premium, pieces fortes et accessoires pour une identite visuelle assumee.</p>
        <div class="actions-row">
            <a href="produits.php" class="btn">Voir les produits</a>
            <a href="histoire.php" class="btn secondary">Notre histoire</a>
        </div>
    </div>
</section>

<section class="page-title">
    <h1>Selection Bad Kings</h1>
    <p>Les produits sont maintenant charges depuis la base de donnees.</p>
</section>

<section class="catalog-grid">
    <?php foreach ($produits as $produit): ?>
        <article class="catalog-card">
            <div class="catalog-media">
                <img src="<?= htmlspecialchars($produit['image']) ?>" alt="<?= htmlspecialchars($produit['nom']) ?>">
            </div>
            <h3><?= htmlspecialchars($produit['nom']) ?></h3>
            <p><?= htmlspecialchars($produit['description']) ?></p>
            <p class="price"><?= prixEuros($produit['prix']) ?></p>
            <a class="btn secondary" href="produit.php?slug=<?= urlencode($produit['slug']) ?>">Voir la fiche</a>
        </article>
    <?php endforeach; ?>
</section>

<?php include __DIR__ . '/../src/includes/footer.php'; ?>
