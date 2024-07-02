import { modifierEtatCommande } from "../../model/commande";

document.addEventListener('DOMContentLoaded', function () {
  document.querySelector('.etat-commande').addEventListener('click', async function (event) {
    // Si le clic provient du bouton "Changer le statut"
    if (event.target.classList.contains('change-status-btn')) {
      try {
        var button = event.target;
        var form = button.closest('.commande-item-form');
        var select = form.querySelector('.commande-status');
        var idCommande = button.getAttribute('data-commande-id');
        var nouvelEtat = select.value;

        // Faire une requête PATCH pour mettre à jour le statut dans la base de données
        var response = await fetch('/consultation', {
          method: 'PATCH',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            idCommande: idCommande,
            nouvelEtat: nouvelEtat,
          }),
        });

        if (!response.ok) {
          throw new Error('Erreur lors de la mise à jour du statut pour la commande #' + idCommande);
        }

        // Mettre à jour le statut actuel dans l'interface utilisateur
        var currentStatusElement = form.querySelector('.current-status');
        currentStatusElement.textContent = 'Statut actuel : ' + nouvelEtat;

        console.log('Commande #' + idCommande + ' : Statut mis à jour avec succès');
      } catch (error) {
        console.error(error.message);
      }
    }
  });
});

// Ouverture du canal SSE avec le serveur
let source = new EventSource('/api/stream');

source.addEventListener('modifier-etat', (event) => {
    let data = JSON.parse(event.data);
    modifierEtatCommande(data.idCommande, data.nouvelEtat);
});

// Dans etatcommande.js
document.addEventListener('DOMContentLoaded', function () {
  // Select all the buttons with class "arrow-btn"
  const detailButtons = document.querySelectorAll('.arrow-btn');

  // Add click event listener to each button
  detailButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      // Find the parent form element
      const form = button.closest('.commande-item-form');

      // Find the details container within the form
      const detailsContainer = form.querySelector('.products-container');

      // Toggle the 'hidden' class to show/hide details
      detailsContainer.classList.toggle('hidden');
    });
  });
});
