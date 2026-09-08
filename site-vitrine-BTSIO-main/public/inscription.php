<?php
session_start();
require_once __DIR__ . '/../src/lib/functions.php';
require_once __DIR__ . '/../src/repositories/utilisateurRepository.php';

$erreurs = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $email = trim($_POST['email'] ?? '');
    $pseudo = trim($_POST['pseudo'] ?? '');
    $motDePasse = $_POST['mot_de_passe'] ?? '';

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $erreurs[] = "L'email n'est pas valide.";
    }
    if (strlen($pseudo) < 3) {
        $erreurs[] = "Le pseudo doit contenir au moins 3 caracteres.";
    }
    if (strlen($motDePasse) < 6) {
        $erreurs[] = "Le mot de passe doit contenir au moins 6 caracteres.";
    }
    if (findUtilisateurByEmail($email)) {
        $erreurs[] = "Cet email est deja utilise.";
    }
    if (findUtilisateurByPseudo($pseudo)) {
        $erreurs[] = "Ce pseudo est deja utilise.";
    }

    if (empty($erreurs) && createUtilisateur([
        'email' => $email,
        'pseudo' => $pseudo,
        'mot_de_passe' => $motDePasse,
    ])) {
        setFlashMessage("Compte cree, vous pouvez vous connecter.");
        redirectTo("connexion.php");
    }
}

include __DIR__ . '/../src/includes/header.php';
?>

<section class="auth-layout">
    <article class="card">
        <h1>Inscription</h1>
        <?php foreach ($erreurs as $erreur): ?>
            <p class="flash flash-error"><?= htmlspecialchars($erreur) ?></p>
        <?php endforeach; ?>
        <form method="post">
            <div>
                <label for="email">Email</label>
                <input id="email" type="email" name="email" value="<?= ancienneValeur('email') ?>" required>
            </div>
            <div>
                <label for="pseudo">Pseudo</label>
                <input id="pseudo" type="text" name="pseudo" value="<?= ancienneValeur('pseudo') ?>" required>
            </div>
            <div>
                <label for="mot_de_passe">Mot de passe</label>
                <input id="mot_de_passe" type="password" name="mot_de_passe" required>
            </div>
            <button type="submit">Creer le compte</button>
        </form>
    </article>
</section>

<?php include __DIR__ . '/../src/includes/footer.php'; ?>
