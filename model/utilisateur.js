import connectionPromise from '../connexion.js';
import bcrypt from 'bcrypt'








export async function addUtilisateur(nom, prenom, courriel, motPasse) {
    const connection = await connectionPromise;
    const hash = await bcrypt.hash(motPasse, 10);
  
    // Utilize placeholders for values in the SQL query
    await connection.run(
      `INSERT INTO utilisateur(nom, prenom, courriel, mot_de_passe)
      VALUES(?, ?, ?, ?)`,
      [nom, prenom, courriel, hash]
    );
  }
  
export async function getUtilisateurParID(id){
const connection=await connectionPromise;

let utilisateur= await connection.get(
`SELECT * FROM utilisateur
WHERE id_utilisateur=?`,
(id)
);
return utilisateur

}

export async function getUtilisateurParCourriel(courriel) {
  const connection = await connectionPromise;

  const utilisateur = await connection.get(
    `SELECT * FROM utilisateur
    WHERE courriel = ?`,
    [courriel]
  );

  return utilisateur;
}




