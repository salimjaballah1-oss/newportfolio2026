<?php
session_start();
require_once __DIR__ . '/../src/lib/functions.php';
require_once __DIR__ . '/../src/repositories/panierRepository.php';

requireConnexion();

$lignes = findPanierByUtilisateurId(getUtilisateurConnecteId());
$total = calculTotalPanier($lignes);

include __DIR__ . '/../src/includes/header.php';
?>

<section class="page-title">
    <h1>Mon panier</h1>
    <p>Panier dynamique enregistre en base de donnees.</p>
</section>

<?php if (empty($lignes)): ?>
    <p class="empty-text">Votre panier est vide.</p>
<?php else: ?>
    <?php foreach ($lignes as $ligne): ?>
        <article class="card cart-row">
            <img src="<?= htmlspecialchars($ligne['image']) ?>" alt="<?= htmlspecialchars($ligne['nom']) ?>">
            <div>
                <h2><?= htmlspecialchars($ligne['nom']) ?></h2>
                <p><?= htmlspecialchars($ligne['description']) ?></p>
                <p class="price"><?= prixEuros($ligne['prix']) ?></p>
            </div>
            <div>
                <form class="quantity-form" action="modifier-panier.php" method="post">
                    <input type="hidden" name="produit_id" value="<?= (int) $ligne['id'] ?>">
                    <label for="qte-<?= (int) $ligne['id'] ?>">Quantite</label>
                    <input id="qte-<?= (int) $ligne['id'] ?>" type="number" name="quantite" min="0" value="<?= (int) $ligne['quantite'] ?>">
                    <button type="submit">Mettre a jour</button>
                </form>
                <form class="remove-form" action="supprimer-panier.php" method="post">
                    <input type="hidden" name="produit_id" value="<?= (int) $ligne['id'] ?>">
                    <button type="submit" class="danger">Supprimer</button>
                </form>
            </div>
        </article>
    <?php endforeach; ?>
    <p class="cart-total">Total : <?= prixEuros($total) ?></p>
<?php endif; ?>

<?php include __DIR__ . '/../src/includes/footer.php'; ?>
