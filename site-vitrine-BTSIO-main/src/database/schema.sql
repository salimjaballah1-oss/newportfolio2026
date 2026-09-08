CREATE TABLE IF NOT EXISTS bk_utilisateur (
    id SERIAL PRIMARY KEY,
    email TEXT NOT NULL UNIQUE,
    pseudo TEXT NOT NULL UNIQUE,
    mot_de_passe TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bk_produit (
    id SERIAL PRIMARY KEY,
    slug TEXT NOT NULL UNIQUE,
    nom TEXT NOT NULL,
    prix NUMERIC(10, 2) NOT NULL,
    description TEXT NOT NULL,
    image TEXT NOT NULL,
    categorie TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS bk_panier (
    utilisateur_id INTEGER NOT NULL,
    produit_id INTEGER NOT NULL REFERENCES bk_produit(id) ON DELETE CASCADE,
    quantite INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (utilisateur_id, produit_id)
);

CREATE TABLE IF NOT EXISTS bk_favori (
    utilisateur_id INTEGER NOT NULL,
    produit_id INTEGER NOT NULL REFERENCES bk_produit(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    PRIMARY KEY (utilisateur_id, produit_id)
);

CREATE TABLE IF NOT EXISTS bk_contact (
    id SERIAL PRIMARY KEY,
    nom TEXT NOT NULL,
    email TEXT NOT NULL,
    message TEXT NOT NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);
