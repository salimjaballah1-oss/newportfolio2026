<?php

function redirectTo(string $page): never
{
    header("Location: " . $page);
    exit;
}

function isUtilisateurConnecte(): bool
{
    return isset($_SESSION['utilisateur']);
}

function getUtilisateurConnecteId(): ?int
{
    return isUtilisateurConnecte() ? (int) $_SESSION['utilisateur']['id'] : null;
}

function requireConnexion(): void
{
    if (!isUtilisateurConnecte()) {
        setFlashMessage("Connectez-vous pour acceder a cette page.", "error");
        redirectTo("connexion.php");
    }
}

function setFlashMessage(string $message, string $type = "success"): void
{
    $_SESSION['flash'] = [
        'message' => $message,
        'type' => $type,
    ];
}

function getFlashMessage(): ?array
{
    if (!isset($_SESSION['flash'])) {
        return null;
    }

    $flash = $_SESSION['flash'];
    unset($_SESSION['flash']);
    return $flash;
}

function prixEuros(float|int|string $prix): string
{
    return number_format((float) $prix, 2, ',', ' ') . " EUR";
}

function ancienneValeur(string $champ): string
{
    return htmlspecialchars($_POST[$champ] ?? '');
}
?>
