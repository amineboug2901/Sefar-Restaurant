document.addEventListener('DOMContentLoaded', function () {
    // Sélectionner tous les boutons "Ajouter au panier"
    let boutonsAjouterAuPanier = document.querySelectorAll('.ajouter');
    let produitsAjoutes = [];
    let userLoggedIn = true; // Replace with your actual logic for checking if the user is logged in

    /**
     * Ajoute un produit dans le panier sur le serveur.
     * @param {MouseEvent} event Objet d'information sur l'événement.
     */
    const addToPanier = async (event) => {
        if (!userLoggedIn) {
            event.target.style.cursor = 'not-allowed';
            event.target.disabled = true;
            return; // Prevent further execution for non-logged-in users
        }

        let nomProduit = event.target.getAttribute('data-nom');
        let nomUtilisateur = "Test";

        await fetch('/menu', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                nomProduit: nomProduit,
                nomUtilisateur: nomUtilisateur
            })
        })
        .then(response => response.json())
        .then(data => {
            console.log('Réponse du serveur:', data);
            // Ajouter le produit à la liste des produits ajoutés
            produitsAjoutes.push(nomProduit);
        })
        .catch(error => {
            console.error('Erreur lors de la requête POST:', error);
        });
    };

    // Ajoute l'exécution de la fonction "addToPanier" pour chaque bouton d'ajout
    // au panier lorsque l'on clique dessus.
    boutonsAjouterAuPanier.forEach(function (bouton) {
        bouton.addEventListener('click', addToPanier);
    });

    // Ouverture du canal SSE avec le serveur
    let source = new EventSource('/api/stream');

    source.addEventListener('add-produit', (event) => {
        let data = JSON.parse(event.data);
        // Appeler la fonction addToPanier avec les données de l'événement
        addToPanier(data);
    });
});
