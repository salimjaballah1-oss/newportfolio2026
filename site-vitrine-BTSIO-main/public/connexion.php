<?php
session_start();
require_once __DIR__ . '/../src/lib/functions.php';
require_once __DIR__ . '/../src/repositories/utilisateurRepository.php';

$erreurs = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $motDePasse = $_POST['mot_de_passe'] ?? '';
    $utilisateur = findUtilisateurByEmail($email);

    if (!$utilisateur || !password_verify($motDePasse, $utilisateur['mot_de_passe'])) {
        $erreurs[] = "Email ou mot de passe incorrect.";
    }

    if (empty($erreurs)) {
        $_SESSION['utilisateur'] = [
            'id' => $utilisateur['id'],
            'email' => $utilisateur['email'],
            'pseudo' => $utilisateur['pseudo'],
        ];
        setFlashMessage("Connexion reussie.");
        redirectTo("index.php");
    }
}

include __DIR__ . '/../src/includes/header.php';
?>

<section class="auth-layout">
    <article class="card">
        <h1>Connexion</h1>
        <?php foreach ($erreurs as $erreur): ?>
            <p class="flash flash-error"><?= htmlspecialchars($erreur) ?></p>
        <?php endforeach; ?>
        <form method="post">
            <div>
                <label for="email">Email</label>
                <input id="email" type="email" name="email" value="<?= ancienneValeur('email') ?>" required>
            </div>
            <div>
                <label for="mot_de_passe">Mot de passe</label>
                <input id="mot_de_passe" type="password" name="mot_de_passe" required>
            </div>
            <button type="submit">Se connecter</button>
        </form>
    </article>
    <article class="card">
        <h2>Nouveau client ?</h2>
        <p>Creer un compte permet d'enregistrer votre panier et vos favoris dans la base de donnees.</p>
        <a href="inscription.php" class="btn secondary">Creer un compte</a>
    </article>
</section>

<?php include __DIR__ . '/../src/includes/footer.php'; ?>
