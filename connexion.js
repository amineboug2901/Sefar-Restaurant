import { existsSync } from 'fs';
import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

/**
 * Constante indiquant si la base de données existe au démarrage du serveur 
 * ou non.
 */
const IS_NEW = !existsSync(process.env.DB_FILE);

/**
 * Crée une base de données par défaut pour le serveur. Des données fictives
 * pour tester le serveur y ont été ajoutées.
 */
const createDatabase = async (connectionPromise) => {
    let connection = await connectionPromise;

    await connection.exec(
        `CREATE TABLE type_utilisateur(
            id_type_utilisateur INTEGER PRIMARY KEY,
            nom TEXT NOT NULL
        );
        
        CREATE TABLE etat_commande(
            id_etat_commande INTEGER PRIMARY KEY,
            nom TEXT NOT NULL
        );
        
        CREATE TABLE produit(
            id_produit INTEGER PRIMARY KEY,
            nom TEXT,
            chemin_image TEXT,
            prix REAL
        );
        
        CREATE TABLE utilisateur(
            id_utilisateur INTEGER PRIMARY KEY,
            id_type_utilisateur INTEGER,
            courriel TEXT,
            mot_de_passe TEXT,
            prenom TEXT,
            nom TEXT,
            FOREIGN KEY(id_type_utilisateur)
            REFERENCES type_utilisateur(id_type_utilisateur)
        );
        
        CREATE TABLE commande(
            id_commande INTEGER PRIMARY KEY,
            id_utilisateur INTEGER,
            id_etat_commande INTEGER,
            date INTEGER,
            FOREIGN KEY(id_utilisateur)
            REFERENCES utilisateur(id_utilisateur),
            FOREIGN KEY(id_etat_commande)
            REFERENCES etat_commande(id_etat_commande)
        );
        
        CREATE TABLE commande_produit(
            id_commande INTEGER,
            id_produit INTEGER,
            quantite INTEGER,
            id_utilisateur INTEGER,
            PRIMARY KEY(id_commande, id_produit),
            FOREIGN KEY(id_commande)
            REFERENCES commande(id_commande),
            FOREIGN KEY(id_produit)
            REFERENCES produit(id_produit),
            FOREIGN KEY(id_utilisateur)
            REFERENCES utilisateur(id_utilisateur)
        );
        
        INSERT INTO type_utilisateur(nom) VALUES('client');
        INSERT INTO type_utilisateur(nom) VALUES('administrateur');
        
        INSERT INTO etat_commande(nom) VALUES('panier');
        INSERT INTO etat_commande(nom) VALUES('cuisine');
        INSERT INTO etat_commande(nom) VALUES('livraison');
        INSERT INTO etat_commande(nom) VALUES('terminée');
        
        
        -- Produits de type Repas (FOOD)
        INSERT INTO produit(id_produit, nom, chemin_image, prix) VALUES(1, 'Double Cheeseburger', './image/double_cheeseburger.jpg', 6.99);
		INSERT INTO produit(id_produit, nom, chemin_image, prix) VALUES(2, 'Wrap au poulet grillé', './image/grilled_chicken_wrap.jpg', 5.99);
		INSERT INTO produit(id_produit, nom, chemin_image, prix) VALUES(3, 'Pizza Margherita 1', './image/pizza_margherita.jpg', 12.99);
		INSERT INTO produit(id_produit, nom, chemin_image, prix) VALUES(4, 'Sushi assorti (8 pièces)', './image/sushi.jpg', 8.99);
		INSERT INTO produit(id_produit, nom, chemin_image, prix) VALUES(5, 'Salade César', './image/caesar_salad.jpg', 5.99);
		INSERT INTO produit(id_produit, nom, chemin_image, prix) VALUES(6, 'Pâtes Alfredo', './image/alfredo_pasta.jpg', 7.99);
		INSERT INTO produit(id_produit, nom, chemin_image, prix) VALUES(7, 'Poulet rôti au four', './image/roast_chicken.jpg', 11.99);
		
		-- Produits de type Desserts
		INSERT INTO produit(id_produit, nom, chemin_image, prix) VALUES(8, 'Tiramisu maison', './image/tiramisu.jpg', 8.99);
		INSERT INTO produit(id_produit, nom, chemin_image, prix) VALUES(9, 'Cupcake au chocolat', './image/chocolate_cupcake.jpg', 3.49);
		INSERT INTO produit(id_produit, nom, chemin_image, prix) VALUES(10, 'Muffin aux myrtilles', './image/blueberry_muffin.jpg', 2.79);
		INSERT INTO produit(id_produit, nom, chemin_image, prix) VALUES(11, 'Donut glacé à la fraise', './image/strawberry_donut.jpg', 1.99);
		
		-- Produits de type Boissons et Suppléments
		INSERT INTO produit(id_produit, nom, chemin_image, prix) VALUES(12, 'Coca Cola 500ml', './image/coca.png', 2.5);
		INSERT INTO produit(id_produit, nom, chemin_image, prix) VALUES(13, 'Café latte', './image/latte_coffee.jpg', 4.49);
		INSERT INTO produit(id_produit, nom, chemin_image, prix) VALUES(14, 'Barre chocolatée KitKat', './image/kitkat_bar.jpg', 1.49);
		INSERT INTO produit(id_produit, nom, chemin_image, prix) VALUES(15, 'Chips Lay''s Original', './image/lays_chips.jpg', 3.99);
		INSERT INTO produit(id_produit, nom, chemin_image, prix) VALUES(16, 'Frites croustillantes', './image/crispy_fries.jpg', 2.99);
		INSERT INTO produit(id_produit, nom, chemin_image, prix) VALUES(17, 'Smoothie aux fruits', './image/fruit_smoothie.jpg', 6.49);
		INSERT INTO produit(id_produit, nom, chemin_image, prix) VALUES(18, 'Mojito Au Citron', './image/mokhito.jpg', 3.49);
        
        -- Utilisateur de test avec un panier
        INSERT INTO utilisateur(id_type_utilisateur, courriel, mot_de_passe, prenom, nom)
        VALUES(2, 'test@test.com', 'Test1234', 'Client', 'Test');

        -- Panier initial pour l'utilisateur de test
        INSERT INTO commande(id_utilisateur, id_etat_commande, date)
        VALUES ((SELECT id_utilisateur FROM utilisateur WHERE courriel = 'client@test.com'),
                (SELECT id_etat_commande FROM etat_commande WHERE nom = 'panier'),
                strftime('%s','now'));`
    );

    return connection;
}

// Base de données dans un fichier
let connectionPromise = open({
    filename: process.env.DB_FILE,
    driver: sqlite3.Database
});

// Si le fichier de base de données n'existe pas, on crée la base de données
// et on y insère des données fictives de test.
if (IS_NEW) {
    connectionPromise = createDatabase(connectionPromise);
}

export default connectionPromise;
