document.addEventListener("DOMContentLoaded", function () {
    const formAuth = document.getElementById('form-auth');
    const courriel = document.getElementById('input-couriel');
    const password = document.getElementById('input-password');
    const formErreur = document.getElementById('form-erreur');

    function connexion(event) {
        // Empêcher la soumission du formulaire
        event.preventDefault();

        // Données à envoyer au serveur
        let data = {
            courriel: courriel.value,
            motPasse: password.value
        };

        // Envoyer une requête au serveur pour l'authentification
        fetch('/api/connexion', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        })
            .then(response => {
                // Vérifier la réponse du serveur
                if (response.ok) {
                    // Si l'authentification réussit, rediriger vers la page '/menu'
                    window.location.replace('/menu');
                } else if (response.status === 401) {
                    // Si le serveur renvoie une erreur 401 (non autorisé), récupérer le message d'erreur
                    return response.json();
                } else {
                    // Gérer d'autres erreurs de requête
                    throw new Error('Erreur lors de la requête');
                }
            })
            .then(info => {
                // Traiter le message d'erreur du serveur
                console.log(info);
                if (info && info.erreur === 'mauvais_mot_de_passe') {
                    // Afficher un message d'erreur pour un mot de passe incorrect
                    formErreur.innerText = 'Les identifiants sont incorrects. Veuillez réessayer.'; // Message personnalisé
                } else if (info && info.erreur === 'mauvais_courriel') {
                    // Afficher un message d'erreur pour un utilisateur inexistant
                    formErreur.innerText = 'Les identifiants sont incorrects. Veuillez réessayer.'; // Message personnalisé
                }
            })
            .catch(error => {
                // Gérer les erreurs pendant la requête
                console.error(error);
                formErreur.innerText = 'Une erreur est survenue lors de la connexion. Veuillez réessayer.';
            });
    }

    // Ajouter un écouteur d'événements pour le formulaire
    formAuth.addEventListener('submit', connexion);
});
