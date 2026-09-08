<?php
session_start();
require_once __DIR__ . '/../src/lib/functions.php';
require_once __DIR__ . '/../src/repositories/produitRepository.php';
require_once __DIR__ . '/../src/repositories/favoriRepository.php';

$slug = $_GET['slug'] ?? '';
$produit = findProduitBySlug($slug);
$estFavori = false;

if (!$produit) {
    http_response_code(404);
}

if ($produit && isUtilisateurConnecte()) {
    $estFavori = isProduitFavori(getUtilisateurConnecteId(), (int) $produit['id']);
}

include __DIR__ . '/../src/includes/header.php';
?>

<?php if (!$produit): ?>
    <section class="page-title">
        <h1>Produit introuvable</h1>
        <p>Cette reference n'existe pas dans le catalogue.</p>
    </section>
    <a href="produits.php" class="btn">Retour au catalogue</a>
<?php else: ?>
    <article class="card product-layout">
        <div class="product-media">
            <img src="<?= htmlspecialchars($produit['image']) ?>" alt="<?= htmlspecialchars($produit['nom']) ?>">
        </div>
        <div class="product-info">
            <p class="product-category"><?= htmlspecialchars($produit['categorie']) ?></p>
            <h1><?= htmlspecialchars($produit['nom']) ?></h1>
            <p class="product-description"><?= htmlspecialchars($produit['description']) ?></p>
            <p class="price"><?= prixEuros($produit['prix']) ?></p>
            <div class="actions-row">
                <form class="inline-form" action="ajouter-panier.php" method="post">
                    <input type="hidden" name="produit_id" value="<?= (int) $produit['id'] ?>">
                    <button type="submit">Ajouter au panier</button>
                </form>
                <form class="inline-form" action="toggle-favori.php" method="post">
                    <input type="hidden" name="produit_id" value="<?= (int) $produit['id'] ?>">
                    <button type="submit" class="secondary">
                        <?= $estFavori ? 'Retirer des favoris' : 'Ajouter aux favoris' ?>
                    </button>
                </form>
                <a href="produits.php" class="btn secondary">Retour</a>
            </div>
        </div>
    </article>
<?php endif; ?>

<?php include __DIR__ . '/../src/includes/footer.php'; ?>
