export const isNomValide = (nom) =>
    nom &&
    typeof nom === 'string' &&
    nom.length <= 50;

export const isPrenomValide = (prenom) =>
    prenom &&
    typeof prenom === 'string' &&
    prenom.length <= 50;

const isCourrielValide = (courriel) =>{
    if(courriel){
        return typeof courriel === 'string' &&
            courriel.match(/^[a-zA-Z0-9.!#$%&’*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/)
    }
    return true;
}

const isMotdePasseValide =(MDP) =>{
    if(MDP){
        return typeof MDP === 'string'&&
            MDP.match(/^(?=.*[A-Z])(?=.*[a-z])(?=.*\d)(?=.*[-+!*$@%_])([-+!*$@%_\w]{8,24})$/)
    }
    return true;
}

const isIdUtilisateurValide = (id) =>{
    typeof id === 'number' &&
    id > 0;
}

export default function isUtilisateurValide (utilisateur){
    return isNomValide(utilisateur.nom) &&
        isPrenomValide(utilisateur.prenom) &&
        isCourrielValide(utilisateur.courriel) &&
        isMotdePasseValide(utilisateur.motPasse) &&
        isIdUtilisateurValide(utilisateur.id) ;
}



export const isCourielvalide=(courriel)=>
typeof courriel=== 'string' && courriel.length>=8;


export const isMotPasseValide=(motPasse)=>
typeof motPasse==='string' && 
motPasse.length>=8;







