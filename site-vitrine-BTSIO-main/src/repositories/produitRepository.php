<?php

function ensureProduitTable(PDO $connexion): void
{
    static $alreadyEnsured = false;
    if ($alreadyEnsured) {
        return;
    }
    $alreadyEnsured = true;

    $connexion->exec(
        "CREATE TABLE IF NOT EXISTS bk_produit (
            id SERIAL PRIMARY KEY,
            slug TEXT NOT NULL UNIQUE,
            nom TEXT NOT NULL,
            prix NUMERIC(10, 2) NOT NULL,
            description TEXT NOT NULL,
            image TEXT NOT NULL,
            categorie TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )"
    );

    $produits = [
        ['maillot', 'Maillot Legacy', 79, 'Tissu respirant et coupe sportive.', 'assets/vetement/maillot.png', 'vetements'],
        ['tshirt', 'T-Shirt Crown', 39, 'Essentiel streetwear avec logo poitrine.', 'assets/vetement/tshirt.png', 'vetements'],
        ['jacket', 'Jacket Night', 119, 'Veste technique premium.', 'assets/vetement/jacket.png', 'vetements'],
        ['pant', 'Pant Urban', 69, 'Confort quotidien et style urbain.', 'assets/vetement/pant.png', 'vetements'],
        ['jewels', 'Bijou Signature', 49, 'Accessoire iconique Bad Kings.', 'assets/vetement/jewels.png', 'accessoires'],
        ['maillotsal', 'Maillot Sal', 89, 'Edition signature Bad Kings by SAL.', 'assets/vetement/maillotSal.png', 'vetements'],
        ['bonnet', 'Bonnet Crown', 29, 'Maille douce avec logo brode.', 'assets/vetement/bonnet.png', 'accessoires'],
    ];

    $requete = $connexion->prepare(
        "INSERT INTO bk_produit (slug, nom, prix, description, image, categorie)
        VALUES (:slug, :nom, :prix, :description, :image, :categorie)
        ON CONFLICT (slug) DO NOTHING"
    );

    foreach ($produits as $produit) {
        $requete->execute([
            ':slug' => $produit[0],
            ':nom' => $produit[1],
            ':prix' => $produit[2],
            ':description' => $produit[3],
            ':image' => $produit[4],
            ':categorie' => $produit[5],
        ]);
    }
}

function findAllProduits(): array
{
    require_once __DIR__ . '/../database/connection.php';
    $connexion = connectDatabase();
    ensureProduitTable($connexion);

    $requeteSql = "SELECT id, slug, nom, prix, description, image, categorie
        FROM bk_produit
        ORDER BY id";
    $requete = $connexion->prepare($requeteSql);
    $requete->execute();

    return $requete->fetchAll(PDO::FETCH_ASSOC);
}

function findProduitBySlug(string $slug): array|false
{
    require_once __DIR__ . '/../database/connection.php';
    $connexion = connectDatabase();
    ensureProduitTable($connexion);

    $requeteSql = "SELECT id, slug, nom, prix, description, image, categorie
        FROM bk_produit
        WHERE slug = :slug";
    $requete = $connexion->prepare($requeteSql);
    $requete->bindParam(':slug', $slug, PDO::PARAM_STR);
    $requete->execute();

    return $requete->fetch(PDO::FETCH_ASSOC);
}

function findProduitById(int $id): array|false
{
    require_once __DIR__ . '/../database/connection.php';
    $connexion = connectDatabase();
    ensureProduitTable($connexion);

    $requeteSql = "SELECT id, slug, nom, prix, description, image, categorie
        FROM bk_produit
        WHERE id = :id";
    $requete = $connexion->prepare($requeteSql);
    $requete->bindParam(':id', $id, PDO::PARAM_INT);
    $requete->execute();

    return $requete->fetch(PDO::FETCH_ASSOC);
}
?>
