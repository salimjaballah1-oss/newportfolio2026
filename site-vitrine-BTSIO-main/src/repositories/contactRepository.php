<?php

function ensureContactTable(PDO $connexion): void
{
    static $alreadyEnsured = false;
    if ($alreadyEnsured) {
        return;
    }
    $alreadyEnsured = true;

    $connexion->exec(
        "CREATE TABLE IF NOT EXISTS bk_contact (
            id SERIAL PRIMARY KEY,
            nom TEXT NOT NULL,
            email TEXT NOT NULL,
            message TEXT NOT NULL,
            created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
        )"
    );
}

function createMessageContact(array $data): bool
{
    require_once __DIR__ . '/../database/connection.php';
    $connexion = connectDatabase();
    ensureContactTable($connexion);

    $requeteSql = "INSERT INTO bk_contact (nom, email, message)
        VALUES (:nom, :email, :message)";
    $requete = $connexion->prepare($requeteSql);

    return $requete->execute([
        ':nom' => $data['nom'],
        ':email' => $data['email'],
        ':message' => $data['message'],
    ]);
}
?>
