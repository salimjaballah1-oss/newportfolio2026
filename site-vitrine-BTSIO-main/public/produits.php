<?php
require_once __DIR__ . '/../src/repositories/produitRepository.php';

$produits = findAllProduits();

include __DIR__ . '/../src/includes/header.php';
?>

<section class="page-title">
    <h1>Catalogue produits</h1>
    <p>Selection Bad Kings.</p>
</section>

<section class="catalog-grid">
    <?php foreach ($produits as $produit): ?>
        <article class="catalog-card">
            <div class="catalog-media">
                <img src="<?= htmlspecialchars($produit['image']) ?>" alt="<?= htmlspecialchars($produit['nom']) ?>">
            </div>
            <h3><?= htmlspecialchars($produit['nom']) ?></h3>
            <p class="card-description"><?= htmlspecialchars($produit['description']) ?></p>
            <p class="price"><?= prixEuros($produit['prix']) ?></p>
            <a class="btn secondary" href="produit.php?slug=<?= urlencode($produit['slug']) ?>">Voir la fiche</a>
            <div class="actions-row">
                <form class="inline-form" action="ajouter-panier.php" method="post">
                    <input type="hidden" name="produit_id" value="<?= (int) $produit['id'] ?>">
                    <button type="submit">Ajouter au panier</button>
                </form>
                <form class="inline-form" action="toggle-favori.php" method="post">
                    <input type="hidden" name="produit_id" value="<?= (int) $produit['id'] ?>">
                    <button type="submit" class="secondary">Favori</button>
                </form>
            </div>
        </article>
    <?php endforeach; ?>
</section>

<?php include __DIR__ . '/../src/includes/footer.php'; ?>
