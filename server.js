// Aller chercher les configurations de l'application
import 'dotenv/config';

// Importer les fichiers et librairies
import https from 'https'
import {readFile} from 'fs/promises'
import express, { json, request, response } from 'express';
import helmet from 'helmet';
import compression from 'compression';
import cors from 'cors';
import cspOption from './csp-options.js'
import { engine  } from 'express-handlebars';
import Handlebars from 'handlebars';
import session from 'express-session';
import memorystore from 'memorystore';
import passport from 'passport';
import { getProduits } from './model/produit.js'
import './model/utilisateur.js'
import './authentification.js'
import { getPanier, insertProduit, modifierQuantite, supprimerPanier, supprimerProduit,getCommandes, modifierEtatCommande, validerPanier } from './model/commande.js';
import { addUtilisateur,getUtilisateurParCourriel } from './model/utilisateur.js';
import { isCourielvalide,isMotPasseValide,isNomValide,isPrenomValide } from './validation/ValidationUtilisateur.js';
import middlewareSse from './middleware-sse.js';


// Création du serveur
const app = express();

//creaton de base de donnee de session
const MemoryStore = memorystore(session);

app.engine('handlebars', engine());
app.set('view engine', 'handlebars');
app.set('views', './views');



//handlebars helper
Handlebars.registerHelper('isEqual', function(value1, value2) {
    return value1 === value2;
  });
  Handlebars.registerHelper('notEqual', function (a, b, options) {
    return a !== b ? options.fn(this) : options.inverse(this);
  });
 
  
  
  
// Ajout de middlewares
app.use(helmet(cspOption));
app.use(compression());
app.use(cors());
app.use(json());
app.use(session({
    cookie: { maxAge: 3600000 },
    name: process.env.npm_package_name,
    store: new MemoryStore({ checkPeriod: 3600000 }),
    resave: false,
    saveUninitialized: false,
    secret: process.env.SESSION_SECRET
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static('public'));
app.use(middlewareSse());


// Ajouter les routes ici ...

app.route('/menu')
    .get(async(request,response)=>{
        let produits = await getProduits();
        response.render('menu',{
            title:'Bienvenu',
            produits:produits,
            styles: ['./css/style.css', './css/normalize.css'],
            scripts: ['./js/menu.js'],
            user:request.user,
            admin: request.user && request.user.acces === 2


        })
        
    })
    .post(async(request,response)=>{
        
        if(!request.user){

           return response.status(401).end();
           

        }
        await insertProduit(request.body.nomProduit,request.body.id_utilisateur);
        
        response.status(201).json();

        
    });

    app.route('/panier')
    .get(async (request, response) => {
        try {
            let produits = await getPanier();
            let total = 0;
            for (const p of produits) {
                total += p.quantite * p.prix;
            }
            response.render('panier', {
                title: 'Panier',
                total: total,
                produits: produits,
                styles: ['./css/panier.css', './css/style.css', './css/normalize.css'],
                scripts: ['./js/panier.js'],
                user: request.user,
            admin: request.user && request.user.acces === 2

            });
        } catch (error) {
            console.error('Erreur lors de la récupération du panier :', error);
            response.status(500).send('Erreur lors de la récupération du panier');
        }
    })
    .delete(async (request, response) => {
        try {
            await supprimerPanier();
           response.pushJson({
            
           })
            response.status(200).end();
        } catch (error) {
            console.error('Erreur lors de la suppression du panier :', error);
            response.status(500).send('Erreur lors de la suppression du panier');
        }
    })
    .patch(async (request, response) => {
        try {
            await modifierQuantite(request.body.nomProduit, request.body.quantite);
            response.status(200).end();
        } catch (error) {
            console.error('Erreur lors de la modification de la quantité du produit dans le panier :', error);
            response.status(500).send('Erreur lors de la modification de la quantité du produit dans le panier');
        }
    });

app.delete('/panier/produit', async (request, response) => {
    try {
        await supprimerProduit(request.body.nomProduit);
        response.status(200).end();
    } catch (error) {
        console.error('Erreur lors de la suppression du produit dans le panier :', error);
        response.status(500).send('Erreur lors de la suppression du produit dans le panier');
    }
});

app.patch('/panier/produit', async (request, response) => {
    try {
        await validerPanier();
        response.status(200).end();
    } catch (error) {
        console.error('Erreur lors de la validation du panier :', error);
        response.status(500).send('Erreur lors de la validation du panier');
    }
});

    
app.get('/consultation', async (req, res) => {
    try {
        // Vérifiez si l'utilisateur est authentifié
        if (!req.user) {
            // Vérifiez le type de l'utilisateur
            if (req.user && req.user.id_type_utilisateur === 2) {
                // Logique pour l'administrateur
                const { commandes, etatCommandeElements } = await getCommandes();
                let total = 0;
                for (const c of commandes) {
                    for (const p of c.produits) {
                        total += p.quantite * p.prix;
                    }
                }

                res.render('consultation', {
                    title: 'Etat',
                    commandes: commandes,
                    total: total,
                    etatCommandeElements: etatCommandeElements,
                    styles: ['./css/style.css', './css/normalize.css'],
                    scripts: ['./js/panier.js'],
                    user: req.user
                });

            } else {
                // Rediriger les autres utilisateurs vers une autre page, ou afficher une erreur, etc.
                res.redirect('/');
            }
        } else {
            // Si l'utilisateur n'est pas authentifié, redirigez-le vers la page de connexion
            res.redirect('/connexion');
        }
    } catch (error) {
        console.error('Erreur lors de la récupération des commandes :', error);
        res.status(500).send('Erreur lors de la récupération des commandes');
    }
});
app.patch('/consultation', async (request, response) => {
    try {
        // Vérifie si l'utilisateur est authentifié
        if (!request.user) {
            response.sendStatus(401);
        } else if (request.user.id_type_utilisateur !== 2) {
            response.sendStatus(403);
        } else {
            await modifierEtatCommande(request.body.idCommande, request.body.nouvelEtat);

            // Utilisation de sendSSE pour envoyer des événements Server-Sent Events (SSE)
            response.sendSSE({ id: request.body.idCommande }, 'modifier-etat');

            // Envoyer une réponse 200 après l'envoi SSE
            response.sendStatus(200);
        }
    } catch (error) {
        console.error('Erreur lors de la modification de l\'état de la commande :', error);
        response.sendStatus(500);
    }
});





    
    

 



app.get('/',(request, response) => {
    response.render('home', {
        title: "Home",
        user:request.user,
        admin: request.user && request.user.acces === 2


    });
    });










    //route dauthentification

    app.post('/api/inscription', async (request, response, next) => {
        // On vérifie le le courriel et le mot de passe
        // envoyé sont valides
        if (isNomValide(request.body.nom) && isPrenomValide(request.body.prenom) && isCourielvalide(request.body.courriel) &&
        isMotPasseValide(request.body.motPasse)) {
            try {
                // Si la validation passe, on crée l'utilisateur
                await addUtilisateur(request.body.nom,request.body.prenom,request.body.courriel, request.body.motPasse);
                response.sendStatus(201);
            }
            catch (error) {
                // S'il y a une erreur de SQL, on regarde
                // si c'est parce qu'il y a conflit
                // d'identifiant si exist deja
                if(error.code === 'SQLITE_CONSTRAINT') {
                    response.sendStatus(409);
                }
                else
                {
                    next(error);
                }
            }
        }
        else {
            response.sendStatus(400);
        }
    });







    app.post('/api/connexion', async (request, response, next) => {
        try {
            if (isCourielvalide(request.body.courriel) && isMotPasseValide(request.body.motPasse)) {
                console.log('Courriel et mot de passe valides');
                const utilisateur = await getUtilisateurParCourriel(request.body.courriel);
    
                passport.authenticate('local', (error, user, info) => {
                    if (error) {
                        console.error('Erreur pendant l\'authentification :', error);
                        next(error);
                    } else if (!user) {
                        console.log('Authentification échouée :', info);
                        // Retourne un statut 401 (Non autorisé) avec l'information d'erreur
                        return response.status(401).json(info);
                    } else {
                        console.log('Authentification réussie pour :', user.courriel);
                        request.logIn(user, (error) => {
                            if (error) {
                                next(error);
                            }
                            response.sendStatus(200);
                        });
                    }
                })(request, response, next);
            } else {
                console.log('Courriel ou mot de passe invalide');
                // Retourne un statut 400 (Requête incorrecte) pour les erreurs de validation
                response.status(400).json({ error: 'Courriel ou mot de passe invalide' });
            }
        } catch (error) {
            console.error('Erreur lors de la récupération de l\'utilisateur par courriel :', error);
            response.sendStatus(500); // Code 500 pour une erreur interne du serveur
        }
    });
    

// Route de déconnexion
app.post('/api/deconnexion', (req, res) => {
    try {
        // Déconnecter l'utilisateur
        req.logout((err) => {
            if (err) {
                console.error('Erreur lors de la déconnexion :', err);
                res.status(500).send('Erreur lors de la déconnexion.');
            } else {
                // Rediriger l'utilisateur vers une autre page
                res.redirect('/');
            }
        });
    } catch (error) {
        console.error('Erreur inattendue lors de la déconnexion :', error);
        res.status(500).send('Erreur inattendue lors de la déconnexion.');
    }
});


    //render authentifiacation
    app.get('/connexion',(request, response) => {

        response.render('connexion',{
            titre:'Connexion',
            styles:['./css/style.css', './css/normalize.css'],
            script:['/js/connexion.js'],
            bouton:'Connecter',
            //savoir si on est connecter
            user:request.user,
            admin: request.user && request.user.acces === 2

        })
    })

    //render inscription
    app.get('/inscription',(request, response) => {
        response.render('inscription',{
            titre:'Inscription',
            styles:['./css/style.css', './css/normalize.css'],
            script:['/js/inscription.js'],
            bouton:'inscrire',
            user:request.user,
            admin: request.user && request.user.acces === 2


        })
    })

    //render admin
    app.get('/admin',(request, response) => {

        response.render('admin',{
            titre:'Admin',
            styles:['./css/style.css', './css/normalize.css'],
            script:['/js/connexion.js'],

            //savoir si on est connecter
            user:request.user,
            admin: request.user && request.user.acces === 2

        })
    })

// Renvoyer une erreur 404 pour les routes non définies
app.use(function (request, response) {
    // Renvoyer simplement une chaîne de caractère indiquant que la page n'existe pas
    response.status(404).send(request.originalUrl + ' not found.');
});







//route pour puvrir le canal de SSE
app.get('/api/stream',(request,response) => {
response.initStream();
})



// Démarrage du serveur
//configuration https en devlopement
if (process.env.NODE_ENV === 'development'){
let credentials={
    key:await readFile('./security/localhost.key'),
    cert:await readFile('./security/localhost.cert')
};
https.createServer(credentials,app).listen(process.env.PORT)
console.info(`https://localhost:${ process.env.PORT }`);

}else{
    app.listen(process.env.PORT);
    console.info(`Serveurs démarré:`);
    console.info(`http://localhost:${ process.env.PORT }`);
}

