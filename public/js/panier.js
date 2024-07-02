document.addEventListener('DOMContentLoaded', function () {
  // Sélectionnez tous les boutons "Retirer du panier"
  var boutonsRetirerDuPanier = document.querySelectorAll('.retirer-du-panier');
  var boutonSupprimerCommande = document.querySelector('.supprimer-commande');
  var boutonConfirmerCommande = document.querySelector('.confirmer-commande');
  var boutonsIncrementerQuantite = document.querySelectorAll('.quantite-plus');
  var boutonsDecrementerQuantite = document.querySelectorAll('.quantite-minus');

  boutonsRetirerDuPanier.forEach(function (bouton) {
    bouton.addEventListener('click', function () {
      
      var nomProduit = bouton.getAttribute('data-nom');
      supprimerProduit(nomProduit);
    });
  });

  boutonSupprimerCommande.addEventListener('click', function () {
    supprimerPanier();
  });

  boutonConfirmerCommande.addEventListener('click', function () {
    confirmerCommande();
  });

  boutonsIncrementerQuantite.forEach(function (bouton) {    
    bouton.addEventListener('click', function () {
      var nomProduit = bouton.getAttribute('data-nom');
      var quantiteElement = bouton.parentElement.querySelector('.quantiteProduit');
      var nouvelleQuantite = parseInt(quantiteElement.textContent) + 1;
      quantiteElement.textContent = nouvelleQuantite;

      modifierQuantite(nomProduit, nouvelleQuantite)
        .then(updatedQuantite => {
          // Use updatedQuantite as needed
          console.log('Updated Quantity:', updatedQuantite);
          quantiteElement.textContent = updatedQuantite;
        });
    });
  });

  boutonsDecrementerQuantite.forEach(function (bouton) {
    console.log('Entree')
    bouton.addEventListener('click', function () {
      var nomProduit = bouton.getAttribute('data-nom');
      var quantiteElement = bouton.parentElement.querySelector('.quantiteProduit');
      var nouvelleQuantite = parseInt(quantiteElement.textContent) - 1;
      if(nouvelleQuantite>0){        
        quantiteElement.textContent = nouvelleQuantite;
        modifierQuantite(nomProduit, nouvelleQuantite)
        .then(updatedQuantite => {
          // Use updatedQuantite as needed
          console.log('Updated Quantity:', updatedQuantite);
          quantiteElement.textContent = updatedQuantite;
        });
      }     
        
    });
  });

  function supprimerProduit(nomProduit) {
    fetch('/panier/produit', {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nomProduit: nomProduit,
      })
    })
      .then(function (response) {
        if (response.ok) {
          window.location.reload();
        } else {
          console.error('Erreur lors de la suppression du produit');
        }
      })
      .catch(function (error) {
        console.error('Erreur lors de la requête DELETE:', error);
      });
  }

  function supprimerPanier() {
    fetch('/panier', {
      method: 'DELETE'
    })
      .then(function (response) {
        if (response.ok) {
          window.location.reload();
        } else {
          console.error('Erreur lors de la suppression de la commande');
        }
      })
      .catch(function (error) {
        console.error('Erreur lors de la requête DELETE:', error);
      });
  }

  function confirmerCommande() {
    fetch('/panier/produit', {
      method: 'PATCH'
      })
    .then(function (response) {
      if (response.ok) {
        window.location.reload();
      } else {
        console.error('Erreur lors de la suppression de la commande');
      }
    })   
      .catch(error => {
        console.error('Erreur lors de la requête PATCH:', error);
        // Handle error, possibly return the existing quantity        
      });
    console.log('Commande confirmée');

  }

  function modifierQuantite(nomProduit, nouvelleQuantite) {
    fetch('/panier', {
      method: 'PATCH',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        nomProduit: nomProduit,
        quantite: nouvelleQuantite,
      }),
    })
      .then(response => {
        if (response.ok) {
          console.log('Quantité modifiée avec succès');
          // Recharger la page après la modification réussie
          window.location.reload();
        } else {
          console.error('Erreur lors de la modification de la quantité');
        }
      })
      .catch(error => {
        console.error('Erreur lors de la requête PATCH:', error);
        // Gérer l'erreur, éventuellement retourner la quantité existante
      });
  }
  
  
});



/* Ouverture du canal SSE avec le serveur
let source = new EventSource('/api/stream');


source.addEventListener('delete-produit', (event) => {
  let data = JSON.parse(event.data);
supprimerProduit(data.id,data.nomProduit);
  
});

source.addEventListener('modify-quantite', (event) => {
  let data = JSON.parse(event.data);
modifierQuantite(data.id,data.nomProduit,data.quantite);
  
});


source.addEventListener('delete-panier', (event) => {
  let data = JSON.parse(event.data);
supprimerPanier(data.id)
  
});

source.addEventListener('validate-panier', (event) => {
  let data = JSON.parse(event.data);
validerPanier(data.id)
  
});

*/

