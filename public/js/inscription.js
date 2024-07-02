const formAuth = document.getElementById('form-auth-inscription');
const courriel = document.getElementById('input-courriel');
const password = document.getElementById('input-password');
const nom = document.getElementById('input-nom');
const prenom = document.getElementById('input-prenom');

const formErreur = document.getElementById('form-erreur');

function validateEmail(email) {
    // Utilisez une expression régulière pour valider le format de l'e-mail
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
}

function validateForm() {
    // Réinitialisez les messages d'erreur à chaque validation
    formErreur.innerText = '';

    // Validation du nom
    if (nom.value.length < 3) {
        formErreur.innerText = 'Le nom doit contenir au moins 3 caractères.';
        return false;
    }

    // Validation du prénom
    if (prenom.value.length < 3) {
        formErreur.innerText = 'Le prénom doit contenir au moins 3 caractères.';
        return false;
    }

    // Validation du courriel
    if (!validateEmail(courriel.value)) {
        formErreur.innerText = 'Le courriel doit être au format valide.';
        return false;
    }

    // Validation du mot de passe
    if (password.value.length < 6) {
        formErreur.innerText = 'Le mot de passe doit contenir au moins 6 caractères.';
        return false;
    }

    // Si toutes les validations passent, le formulaire est valide
    return true;
}

async function inscription(event) {
    event.preventDefault();

    // Validation du formulaire
    if (!validateForm()) {
        return;
    }

    let data = {
        nom: nom.value,
        prenom: prenom.value,
        courriel: courriel.value,
        motPasse: password.value
    };

    try {
        let response = await fetch('/api/inscription', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });

        if (response.ok) {
            window.location.replace('/connexion');
        } else if (response.status === 409) {
            formErreur.innerText = 'L\'utilisateur existe déjà';
        } else {
            formErreur.innerText = 'Une erreur est survenue lors de l\'inscription.';
        }
    } catch (error) {
        console.error('Error during fetch:', error);
        formErreur.innerText = 'Une erreur est survenue lors de l\'inscription.';
    }
}

formAuth.addEventListener('submit', inscription);
