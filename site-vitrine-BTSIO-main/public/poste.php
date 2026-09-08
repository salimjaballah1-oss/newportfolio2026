<?php include __DIR__ . '/../src/includes/header.php'; ?>

<section class="page-title">
    <h1>Equipe Bad Kings</h1>
    <p>Organisation interne et postes de l'entreprise.</p>
</section>

<section class="team-grid">
    <?php
    $postes = [
        ['President / Fondateur', 'Salim Jaballah', 'Definit la strategie globale de Bad Kings, supervise les poles et valide les decisions majeures.', 'Leadership, vision strategique, sens du branding.', '45 000 EUR - 65 000 EUR'],
        ['Responsable financier / ventes', 'Mathieu Heuberger', 'Gere la comptabilite, les budgets et supervise les performances commerciales.', 'Analyse financiere, gestion budgetaire, negociation commerciale.', '32 000 EUR - 42 000 EUR'],
        ['Commercial', 'Louca Sterppione', 'Developpe le portefeuille client et assure le suivi des partenaires.', 'Relation client, prospection, negociation.', '28 000 EUR - 38 000 EUR + primes'],
        ['Responsable Informatique', 'Baptiste Trimaille', 'Supervise le site web et l infrastructure numerique.', 'Developpement web, cybersecurite, gestion serveur.', '35 000 EUR - 48 000 EUR'],
        ['Developpeur Web', 'Nohlan Menucci', 'Developpe et met a jour le site e-commerce.', 'HTML, CSS, PHP, SQL, optimisation SEO.', '28 000 EUR - 35 000 EUR'],
        ['Responsable Marketing', 'Alessio Bernardi', 'Definit la strategie marketing digitale et supervise la communication.', 'Marketing digital, analyse de donnees, gestion de campagnes.', '35 000 EUR - 45 000 EUR'],
        ['Charge de communication', 'Enzo Souza Texeira', 'Met en oeuvre la strategie de communication et anime les reseaux sociaux.', 'Creation de contenu, redaction web, reseaux sociaux.', '24 000 EUR - 30 000 EUR'],
        ['Responsable Ressources Humaines', 'Yann Ledreff', 'Gere les recrutements et la gestion administrative du personnel.', 'Organisation, droit du travail, gestion administrative.', '28 000 EUR - 35 000 EUR'],
        ['Directeur artistique', 'Jyn Moua', 'Definit l identite visuelle de la marque et supervise les creations graphiques.', 'Design graphique, creativite, maitrise Adobe.', '32 000 EUR - 45 000 EUR'],
    ];
    ?>

    <?php foreach ($postes as $poste): ?>
        <article class="card">
            <h2><?= htmlspecialchars($poste[0]) ?></h2>
            <h3><?= htmlspecialchars($poste[1]) ?></h3>
            <p><strong>Descriptif :</strong> <?= htmlspecialchars($poste[2]) ?></p>
            <p><strong>Competences :</strong> <?= htmlspecialchars($poste[3]) ?></p>
            <p><strong>Salaire :</strong> <?= htmlspecialchars($poste[4]) ?></p>
        </article>
    <?php endforeach; ?>
</section>

<?php include __DIR__ . '/../src/includes/footer.php'; ?>
