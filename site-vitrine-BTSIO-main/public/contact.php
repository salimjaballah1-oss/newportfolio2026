<?php
session_start();
require_once __DIR__ . '/../src/lib/functions.php';
require_once __DIR__ . '/../src/repositories/contactRepository.php';

$erreurs = [];

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $nom = trim($_POST['nom'] ?? '');
    $email = trim($_POST['email'] ?? '');
    $message = trim($_POST['message'] ?? '');

    if ($nom === '') {
        $erreurs[] = "Le nom est obligatoire.";
    }
    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        $erreurs[] = "L'email n'est pas valide.";
    }
    if (strlen($message) < 10) {
        $erreurs[] = "Le message doit contenir au moins 10 caracteres.";
    }

    if (empty($erreurs) && createMessageContact([
        'nom' => $nom,
        'email' => $email,
        'message' => $message,
    ])) {
        setFlashMessage("Message envoye.");
        redirectTo("contact.php");
    }
}

include __DIR__ . '/../src/includes/header.php';
?>

<section class="page-title">
    <h1>Contact</h1>
    <p>Une question sur un produit, un partenariat ou un recrutement ? Contactez-nous.</p>
</section>

<section class="contact-layout">
    <article class="card">
        <h2>Coordonnees</h2>
        <p><strong>Email :</strong> contact@badkings.fr</p>
        <p><strong>Telephone :</strong> +33 1 84 27 62 10</p>
        <p><strong>Adresse :</strong> 28 rue du Commerce, 75015 Paris</p>
        <p><strong>Horaires :</strong> Lundi au vendredi, 9h00 - 18h00</p>
    </article>

    <article class="card">
        <h2>Formulaire</h2>
        <?php foreach ($erreurs as $erreur): ?>
            <p class="flash flash-error"><?= htmlspecialchars($erreur) ?></p>
        <?php endforeach; ?>
        <form method="post">
            <div>
                <label for="nom">Nom</label>
                <input id="nom" name="nom" type="text" value="<?= ancienneValeur('nom') ?>" required>
            </div>
            <div>
                <label for="email">Email</label>
                <input id="email" name="email" type="email" value="<?= ancienneValeur('email') ?>" required>
            </div>
            <div>
                <label for="message">Message</label>
                <textarea id="message" name="message" rows="5" required><?= ancienneValeur('message') ?></textarea>
            </div>
            <button type="submit">Envoyer</button>
        </form>
    </article>
</section>

<?php include __DIR__ . '/../src/includes/footer.php'; ?>
