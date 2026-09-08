<?php
require_once __DIR__ . '/produitRepository.php';

function ensureFavoriTable(PDO $connexion): void
{
    static $alreadyEnsured = false;
    if ($alreadyEnsured) {
        return;
    }
    $alreadyEnsured = true;

    ensureProduitTable($connexion);

    $connexion->exec(
        "CREATE TABLE IF NOT EXISTS bk_favori (
            utilisateur_id INTEGER NOT NULL,
            produit_id INTEGER NOT NULL REFERENCES bk_produit(id) ON DELETE CASCADE,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
            PRIMARY KEY (utilisateur_id, produit_id)
        )"
    );
}

function isProduitFavori(int $utilisateurId, int $produitId): bool
{
    require_once __DIR__ . '/../database/connection.php';
    $connexion = connectDatabase();
    ensureFavoriTable($connexion);

    $requeteSql = "SELECT 1 FROM bk_favori
        WHERE utilisateur_id = :utilisateur_id
        AND produit_id = :produit_id";
    $requete = $connexion->prepare($requeteSql);
    $requete->execute([
        ':utilisateur_id' => $utilisateurId,
        ':produit_id' => $produitId,
    ]);

    return (bool) $requete->fetchColumn();
}

function addFavori(int $utilisateurId, int $produitId): bool
{
    require_once __DIR__ . '/../database/connection.php';
    $connexion = connectDatabase();
    ensureFavoriTable($connexion);

    $requeteSql = "INSERT INTO bk_favori (utilisateur_id, produit_id)
        VALUES (:utilisateur_id, :produit_id)
        ON CONFLICT (utilisateur_id, produit_id) DO NOTHING";
    $requete = $connexion->prepare($requeteSql);

    return $requete->execute([
        ':utilisateur_id' => $utilisateurId,
        ':produit_id' => $produitId,
    ]);
}

function removeFavori(int $utilisateurId, int $produitId): bool
{
    require_once __DIR__ . '/../database/connection.php';
    $connexion = connectDatabase();
    ensureFavoriTable($connexion);

    $requeteSql = "DELETE FROM bk_favori
        WHERE utilisateur_id = :utilisateur_id
        AND produit_id = :produit_id";
    $requete = $connexion->prepare($requeteSql);

    return $requete->execute([
        ':utilisateur_id' => $utilisateurId,
        ':produit_id' => $produitId,
    ]);
}

function findFavorisByUtilisateurId(int $utilisateurId): array
{
    require_once __DIR__ . '/../database/connection.php';
    $connexion = connectDatabase();
    ensureFavoriTable($connexion);

    $requeteSql = "SELECT p.id, p.slug, p.nom, p.prix, p.description, p.image, p.categorie
        FROM bk_favori favori
        JOIN bk_produit p ON p.id = favori.produit_id
        WHERE favori.utilisateur_id = :utilisateur_id
        ORDER BY favori.created_at DESC";
    $requete = $connexion->prepare($requeteSql);
    $requete->execute([':utilisateur_id' => $utilisateurId]);

    return $requete->fetchAll(PDO::FETCH_ASSOC);
}
?>
