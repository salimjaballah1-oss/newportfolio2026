<?php
require_once __DIR__ . '/produitRepository.php';

function ensurePanierTable(PDO $connexion): void
{
    static $alreadyEnsured = false;
    if ($alreadyEnsured) {
        return;
    }
    $alreadyEnsured = true;

    ensureProduitTable($connexion);

    $connexion->exec(
        "CREATE TABLE IF NOT EXISTS bk_panier (
            utilisateur_id INTEGER NOT NULL,
            produit_id INTEGER NOT NULL REFERENCES bk_produit(id) ON DELETE CASCADE,
            quantite INTEGER NOT NULL DEFAULT 1,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            PRIMARY KEY (utilisateur_id, produit_id)
        )"
    );
}

function addProduitPanier(int $utilisateurId, int $produitId): bool
{
    require_once __DIR__ . '/../database/connection.php';
    $connexion = connectDatabase();
    ensurePanierTable($connexion);

    $requeteSql = "INSERT INTO bk_panier (utilisateur_id, produit_id, quantite)
        VALUES (:utilisateur_id, :produit_id, 1)
        ON CONFLICT (utilisateur_id, produit_id)
        DO UPDATE SET quantite = bk_panier.quantite + 1";
    $requete = $connexion->prepare($requeteSql);

    return $requete->execute([
        ':utilisateur_id' => $utilisateurId,
        ':produit_id' => $produitId,
    ]);
}

function updateQuantitePanier(int $utilisateurId, int $produitId, int $quantite): bool
{
    require_once __DIR__ . '/../database/connection.php';
    $connexion = connectDatabase();
    ensurePanierTable($connexion);

    if ($quantite <= 0) {
        return removeProduitPanier($utilisateurId, $produitId);
    }

    $requeteSql = "UPDATE bk_panier
        SET quantite = :quantite
        WHERE utilisateur_id = :utilisateur_id
        AND produit_id = :produit_id";
    $requete = $connexion->prepare($requeteSql);

    return $requete->execute([
        ':quantite' => $quantite,
        ':utilisateur_id' => $utilisateurId,
        ':produit_id' => $produitId,
    ]);
}

function removeProduitPanier(int $utilisateurId, int $produitId): bool
{
    require_once __DIR__ . '/../database/connection.php';
    $connexion = connectDatabase();
    ensurePanierTable($connexion);

    $requeteSql = "DELETE FROM bk_panier
        WHERE utilisateur_id = :utilisateur_id
        AND produit_id = :produit_id";
    $requete = $connexion->prepare($requeteSql);

    return $requete->execute([
        ':utilisateur_id' => $utilisateurId,
        ':produit_id' => $produitId,
    ]);
}

function findPanierByUtilisateurId(int $utilisateurId): array
{
    require_once __DIR__ . '/../database/connection.php';
    $connexion = connectDatabase();
    ensurePanierTable($connexion);

    $requeteSql = "SELECT p.id, p.slug, p.nom, p.prix, p.description, p.image, p.categorie, panier.quantite
        FROM bk_panier panier
        JOIN bk_produit p ON p.id = panier.produit_id
        WHERE panier.utilisateur_id = :utilisateur_id
        ORDER BY panier.created_at DESC";
    $requete = $connexion->prepare($requeteSql);
    $requete->execute([':utilisateur_id' => $utilisateurId]);

    return $requete->fetchAll(PDO::FETCH_ASSOC);
}

function calculTotalPanier(array $lignes): float
{
    $total = 0;
    foreach ($lignes as $ligne) {
        $total += (float) $ligne['prix'] * (int) $ligne['quantite'];
    }
    return $total;
}
?>
