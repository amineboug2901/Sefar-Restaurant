import bcrypt from 'bcrypt';
import passport from "passport";
import { Strategy } from "passport-local";
import { getUtilisateurParID,getUtilisateurParCourriel } from "./model/utilisateur.js";



// Configuration générale de la stratégie.
// On indique ici qu'on s'attends à ce que le client
// envoit un variable "courriel" et "motDePasse" au
// serveur pour l'authentification.
const config = {
    usernameField: "courriel",
    passwordField: "motPasse"
};


// Configuration de quoi faire avec l'identifiant
// et le mot de passe pour les valider
passport.use(new Strategy(config, async (courriel, motPasse, done) => {
    try {
        console.log('Tentative d\'authentification pour l\'utilisateur avec le courriel :', courriel);
        
        const utilisateur = await getUtilisateurParCourriel(courriel);

        if (!utilisateur) {
            console.log('Utilisateur non trouvé.');
            return done(null, false, { error: 'mauvais_utilisateur' });
        }

        console.log('Mot de passe envoyé par l\'utilisateur :', motPasse);
        console.log('Mot de passe récupéré de la base de données :', utilisateur.mot_de_passe);

        // Vérifier si l'utilisateur est un administrateur (id_type_utilisateur égal à 2)
        if (utilisateur.id_type_utilisateur === 2) {
            // Si c'est un administrateur, comparer le mot de passe sans utiliser bcrypt
            if (motPasse !== utilisateur.mot_de_passe) {
                console.log('Mot de passe incorrect pour l\'administrateur.');
                return done(null, false, { error: 'mauvais_mot_de_passe' });
            }
        } else {
            // Si ce n'est pas un administrateur, utiliser bcrypt pour comparer les mots de passe
            const valide = await bcrypt.compare(motPasse, utilisateur.mot_de_passe);

            if (!valide) {
                console.log('Mot de passe incorrect.');
                // Retourne un message spécifique pour le mot de passe incorrect
                return done(null, false, { error: 'mauvais_mot_de_passe' });
            }
        }

        console.log('Authentification réussie pour l\'utilisateur :', utilisateur.courriel);
        return done(null, utilisateur);
    }
    catch (error) {
        console.error('Erreur pendant l\'authentification :', error);
        return done(error);
    }
}));



passport.serializeUser((user, done) => {
    done(null, { id: user.id_utilisateur, type: user.id_type_utilisateur });
});

passport.deserializeUser(async (serializedUser, done) => {
    try {
        const userFromDB = await getUtilisateurParID(serializedUser.id);
        done(null, { ...userFromDB, type: serializedUser.type });
    } catch (error) {
        done(error);
    }
});

