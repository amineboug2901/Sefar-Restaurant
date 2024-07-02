import connectionPromise from '../connexion.js';

export async function insertProduit(nomProduit, nomUtilisateur) {
    let connection = await connectionPromise;
    
    // Récupérer l'ID du produit
    let idProduit = await connection.get(
        `SELECT id_produit FROM produit WHERE nom = ?`,
        [nomProduit]
    );
    idProduit = idProduit.id_produit;
    console.log(idProduit);

    // Récupérer l'ID de l'utilisateur
    let idUtilisateur = await connection.get(
        `SELECT id_utilisateur FROM utilisateur WHERE nom = ?`,
        [nomUtilisateur]
    );
    idUtilisateur = idUtilisateur.id_utilisateur;
    console.log(idUtilisateur);

    // Récupérer l'ID de l'état de commande 'panier'
    let idEtatCommande = await connection.get(
        `SELECT id_etat_commande FROM etat_commande WHERE nom = 'panier'`
    );
    idEtatCommande = idEtatCommande.id_etat_commande;
    console.log(idEtatCommande);

    // Récupérer l'ID de la commande 'panier' de l'utilisateur
    let idCommande = await connection.get(
        `SELECT id_commande FROM commande 
        WHERE id_utilisateur = ? AND id_etat_commande = ?`,
        [idUtilisateur, idEtatCommande]
    );
    if (idCommande != null) idCommande = idCommande.id_commande;

    console.log(idCommande);

    // Si un panier existe deja
    if (idCommande) {
        let produitExiste = await connection.get(
            `SELECT id_produit FROM commande_produit
            WHERE id_commande = ? AND id_produit = ?`,
            [idCommande, idProduit]
        );
    
        if (produitExiste) {
            // Si le produit existe, incrémenter la quantité
            await connection.run(
                `UPDATE commande_produit SET quantite = quantite + 1
                WHERE id_commande = ? AND id_produit = ?`,
                [idCommande, idProduit]
            );
    
            console.log(`La quantité du produit '${nomProduit}' a été incrémentée dans la commande panier existante.`);
        } else {
            // Si le produit n'existe pas, ajouter le produit à la commande
            await connection.run(
                `INSERT INTO commande_produit (id_commande, id_produit, quantite)
                VALUES (?, ?, ?)`,
                [idCommande, idProduit, 1]
            );
    
            console.log(`Le produit '${nomProduit}' a été ajouté à la commande panier existante.`);
        }
        

        console.log(`Le produit '${nomProduit}' a été ajouté à la commande panier existante.`);
    } else {
        // Si aucune commande 'panier' existe, créer une nouvelle commande 'panier' et y ajouter le produit
        let result = await connection.run(
            `INSERT INTO commande (id_utilisateur, id_etat_commande, date)
            VALUES (?, ?, ?)`,
            [idUtilisateur, idEtatCommande, Date.now()]
        );

        let nouvelleCommandeID = result.lastID;

        await connection.run(
            `INSERT INTO commande_produit (id_commande, id_produit, quantite)
            VALUES (?, ?, ?)`,
            [nouvelleCommandeID, idProduit, 1]
        );

        console.log(`Le produit '${nomProduit}' a été ajouté à une nouvelle commande panier.`);
    }    
}

// Reccuperer le panier
export async function getPanier() {
    let connection = await connectionPromise;

    // Récupérer l'ID de l'état de commande 'panier'
    let idEtatCommande = await connection.get(
        `SELECT id_etat_commande FROM etat_commande WHERE nom = 'panier'`
    );
    idEtatCommande=idEtatCommande.id_etat_commande
    // Récupérer les informations des produits dans le panier
    let result = await connection.all(
        `SELECT p.nom AS nom_produit, p.chemin_image, p.prix, cp.quantite
        FROM commande_produit cp
        INNER JOIN produit p ON cp.id_produit = p.id_produit
        INNER JOIN commande c ON cp.id_commande = c.id_commande
        WHERE c.id_etat_commande = ?`,
        [idEtatCommande]
    );
    
    return result;
}

// Supprimer tout le panier

export async function supprimerPanier() {
    let connection = await connectionPromise;
    
    // Récupérer l'ID de l'état de commande 'panier'
    let idEtatCommande = await connection.get(
        `SELECT id_etat_commande FROM etat_commande WHERE nom = 'panier'`
    );
    idEtatCommande=idEtatCommande.id_etat_commande;

    // Récupérer l'ID de la commande avec l'id_etat_commande correspondant à 'panier'
    let idCommande = await connection.get(
        `SELECT id_commande FROM commande 
        WHERE  id_etat_commande = ?`,
        [idEtatCommande]
    );
    idCommande=idCommande.id_commande;

    if (idCommande) {
        // Début de la transaction
        await connection.run('BEGIN TRANSACTION');

        try {
            // Supprimer la commande de la table commande
            await connection.run(
                `DELETE FROM commande WHERE id_commande = ?`,
                [idCommande]
            );

            // Supprimer les lignes correspondantes de la table commande_produit
            await connection.run(
                `DELETE FROM commande_produit WHERE id_commande = ?`,
                [idCommande]
            );

            // Valider la transaction
            await connection.run('COMMIT');

            console.log('Le panier a été supprimé avec succès.');
        } catch (error) {
            // En cas d'erreur, annuler la transaction
            await connection.run('ROLLBACK');
            console.error('Une erreur s\'est produite lors de la suppression du panier:', error);
        }
    } else {
        console.log('Aucun panier trouvé pour cet utilisateur.');
    }
}

// Modifier quantite produit dans le panier

export async function modifierQuantite(nomProduit, quantite) {
    let connection = await connectionPromise;
    console.log("NomProduit "+nomProduit)
    // Récupérer l'ID du produit
    let idProduit = await connection.get(
        `SELECT id_produit FROM produit WHERE nom = ?`,
        [nomProduit]
    );

    idProduit = idProduit.id_produit;
    console.log(idProduit)

    // Récupérer l'ID de l'état de commande 'panier'
    let idEtatCommande = await connection.get(
        `SELECT id_etat_commande FROM etat_commande WHERE nom = 'panier'`
    );
    idEtatCommande= idEtatCommande.id_etat_commande;

    // Vérifier que la quantité est valide (>= 1)
    if (quantite >= 1) {
        // Insérer ou mettre à jour la quantité dans la table commande_produit
        await connection.run(
            `INSERT OR REPLACE INTO commande_produit (id_commande, id_produit, quantite)
            VALUES ((SELECT id_commande FROM commande WHERE id_etat_commande = ?), ?, ?)`,
            [idEtatCommande, idProduit, quantite]
        );

        console.log(`La quantité du produit '${nomProduit}' a été modifiée avec succès dans la commande panier.`);
    } else {
        console.error('La quantité doit être supérieure ou égale à 1.');
    }
}


// Supprimer un produit du panier

export async function supprimerProduit(nomProduit) {
    let connection = await connectionPromise;

    // Récupérer l'ID du produit
    let idProduit = await connection.get(
        `SELECT id_produit FROM produit WHERE nom = ?`,
        [nomProduit]
    );
    idProduit=idProduit.id_produit;

    // Récupérer l'ID de l'état de commande 'panier'
    let idEtatCommande = await connection.get(
        `SELECT id_etat_commande FROM etat_commande WHERE nom = 'panier'`
    );
    idEtatCommande=idEtatCommande.id_etat_commande;

    // Supprimer la ligne correspondante de la table commande_produit
    await connection.run(
        `DELETE FROM commande_produit 
        WHERE id_produit = ? 
        AND id_commande IN (SELECT id_commande FROM commande WHERE id_etat_commande = ?)`,
        [idProduit, idEtatCommande]
    );

    console.log(`Le produit '${nomProduit}' a été supprimé du panier avec succès.`);
}

// Afficher toutes les commandes et tous les etas
 
export async function getCommandes() {
    let connection = await connectionPromise;
 
    // Récupérer toutes les informations de toutes les tables
    let commandesData = await connection.all(
        `SELECT
            c.id_commande,
            c.date,
            ec.nom AS etat_commande,
            u.id_utilisateur,
            u.id_type_utilisateur,
            u.courriel,
            u.mot_de_passe,
            u.prenom,
            u.nom,
            tu.nom AS type_utilisateur,
            cp.quantite,
            p.id_produit,
            p.nom AS nom_produit,
            p.chemin_image,
            p.prix
        FROM commande c
        INNER JOIN etat_commande ec ON c.id_etat_commande = ec.id_etat_commande
        INNER JOIN utilisateur u ON c.id_utilisateur = u.id_utilisateur
        INNER JOIN type_utilisateur tu ON u.id_type_utilisateur = tu.id_type_utilisateur
        INNER JOIN commande_produit cp ON c.id_commande = cp.id_commande
        INNER JOIN produit p ON cp.id_produit = p.id_produit`
    );
 
    // Organiser les données sous forme de structure hiérarchique
    let commandes = {};
    commandesData.forEach((row) => {
        if (!commandes[row.id_commande]) {
            commandes[row.id_commande] = {
                id_commande: row.id_commande,
                date: row.date,
                etat_commande: row.etat_commande,
                id_utilisateur: row.id_utilisateur,
                id_type_utilisateur: row.id_type_utilisateur,
                courriel: row.courriel,
                mot_de_passe: row.mot_de_passe,
                prenom: row.prenom,
                nom: row.nom,
                type_utilisateur: row.type_utilisateur,
                produits: []
            };
        }
        commandes[row.id_commande].produits.push({
            quantite: row.quantite,
            id_produit: row.id_produit,
            nom_produit: row.nom_produit,
            chemin_image: row.chemin_image,
            prix: row.prix
        });
    });
 
    // Récupérer tous les éléments de la table etat_commande
    let etatCommandeElements = await connection.all('SELECT * FROM etat_commande');
 
    return { commandes: Object.values(commandes), etatCommandeElements };
}
// Modifier l'etat d'une commande

export async function modifierEtatCommande(idCommande, nouvelEtat) {
    let connection = await connectionPromise;

    // Vérifier que la nouvelle valeur d'état est valide
    let etatExiste = await connection.get(
        `SELECT 1 FROM etat_commande WHERE nom = ?`,
        [nouvelEtat]
    );

    if (!etatExiste) {
        console.error('La nouvelle valeur d\'état n\'est pas valide.');
        return;
    }

    // Modifier l'état de la commande
    await connection.run(
        `UPDATE commande
        SET id_etat_commande = (SELECT id_etat_commande FROM etat_commande WHERE nom = ?)
        WHERE id_commande = ?`,
        [nouvelEtat, idCommande]
    );

    console.log(`L'état de la commande avec l'id ${idCommande} a été modifié avec succès.`);
}

// valider le panier
export async function validerPanier() {
    let connexion = await connectionPromise;      

    // Vérifier que l'état 'cuisine' existe
    let etatCuisineExiste = await connexion.get(
        `SELECT 1 FROM etat_commande WHERE nom = ?`,
        ['cuisine']
    );

    if (!etatCuisineExiste) {
        console.error("L'état 'cuisine' n'existe pas.");
        return;
    }

    // Mettre à jour l'état des produits du panier à 'cuisine'
    await connexion.run(
        `UPDATE commande
        SET id_etat_commande = (SELECT id_etat_commande FROM etat_commande WHERE nom = 'cuisine')
        WHERE id_etat_commande = (SELECT id_etat_commande FROM etat_commande WHERE nom = 'panier')`
    );
    console.log('Le panier a été validé avec succès!');
    
}

