<?php
session_start();
require_once __DIR__ . '/../src/lib/functions.php';
require_once __DIR__ . '/../src/repositories/favoriRepository.php';

requireConnexion();

$favoris = findFavorisByUtilisateurId(getUtilisateurConnecteId());

include __DIR__ . '/../src/includes/header.php';
?>

<section class="page-title">
    <h1>Mes favoris</h1>
    <p>Produits sauvegardes avec votre compte.</p>
</section>

<?php if (empty($favoris)): ?>
    <p class="empty-text">Vous n'avez pas encore de favori.</p>
<?php else: ?>
    <section class="collection-grid">
        <?php foreach ($favoris as $produit): ?>
            <article class="collection-card">
                <img src="<?= htmlspecialchars($produit['image']) ?>" alt="<?= htmlspecialchars($produit['nom']) ?>">
                <h3><?= htmlspecialchars($produit['nom']) ?></h3>
                <p class="price"><?= prixEuros($produit['prix']) ?></p>
                <div class="card-actions">
                    <a class="btn secondary" href="produit.php?slug=<?= urlencode($produit['slug']) ?>">Voir</a>
                    <form action="supprimer-favori.php" method="post">
                        <input type="hidden" name="produit_id" value="<?= (int) $produit['id'] ?>">
                        <button type="submit" class="danger">Supprimer</button>
                    </form>
                </div>
            </article>
        <?php endforeach; ?>
    </section>
<?php endif; ?>

<?php include __DIR__ . '/../src/includes/footer.php'; ?>
