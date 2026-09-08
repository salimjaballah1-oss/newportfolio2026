<?php

function ensureUtilisateurTable(PDO $connexion): void
{
    static $alreadyEnsured = false;
    if ($alreadyEnsured) {
        return;
    }
    $alreadyEnsured = true;

    $connexion->exec(
        "CREATE TABLE IF NOT EXISTS bk_utilisateur (
            id SERIAL PRIMARY KEY,
            email TEXT NOT NULL UNIQUE,
            pseudo TEXT NOT NULL UNIQUE,
            mot_de_passe TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )"
    );
}

function findUtilisateurByEmail(string $email): array|false
{
    require_once __DIR__ . '/../database/connection.php';
    $connexion = connectDatabase();
    ensureUtilisateurTable($connexion);

    $requeteSql = "SELECT id, email, pseudo, mot_de_passe FROM bk_utilisateur WHERE email = :email";
    $requete = $connexion->prepare($requeteSql);
    $requete->bindParam(':email', $email, PDO::PARAM_STR);
    $requete->execute();

    return $requete->fetch(PDO::FETCH_ASSOC);
}

function findUtilisateurByPseudo(string $pseudo): array|false
{
    require_once __DIR__ . '/../database/connection.php';
    $connexion = connectDatabase();
    ensureUtilisateurTable($connexion);

    $requeteSql = "SELECT id, email, pseudo, mot_de_passe FROM bk_utilisateur WHERE pseudo = :pseudo";
    $requete = $connexion->prepare($requeteSql);
    $requete->bindParam(':pseudo', $pseudo, PDO::PARAM_STR);
    $requete->execute();

    return $requete->fetch(PDO::FETCH_ASSOC);
}

function createUtilisateur(array $data): bool
{
    require_once __DIR__ . '/../database/connection.php';
    $connexion = connectDatabase();
    ensureUtilisateurTable($connexion);

    $requeteSql = "INSERT INTO bk_utilisateur (email, pseudo, mot_de_passe)
        VALUES (:email, :pseudo, :mot_de_passe)";
    $requete = $connexion->prepare($requeteSql);

    return $requete->execute([
        ':email' => $data['email'],
        ':pseudo' => $data['pseudo'],
        ':mot_de_passe' => password_hash($data['mot_de_passe'], PASSWORD_DEFAULT),
    ]);
}
?>
