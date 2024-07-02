import connectionPromise from '../connexion.js';

// Selectionner tous les produits
export async function getProduits() {
    // Attendre que la connexion à la base de données
    // soit établie
    let connection = await connectionPromise;

    // Envoyer une requête à la base de données
    let produits = await connection.all(
        'SELECT * FROM produit'
    );

    // Retourner les résultats
    return produits;
}

