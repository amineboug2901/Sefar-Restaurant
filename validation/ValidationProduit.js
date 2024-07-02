const isIdProduitValide = (idProduit) =>
    typeof idProduit === 'number'&&
    idProduit > 0;

const isnomValide = (nom) =>
    nom &&
    typeof nom === 'string' &&
    nom.length <= 65;

const isImageValide = (image) => {
    if(image){
        return typeof image === 'string' &&
            image.match(/\.(jpg|jpeg|png|gif)$/)
    }
    return true;
}

const isPrixValide = (Prix) =>{
    if(Prix){
        return typeof Prix !== 'number' &&
            Prix.match(/^\$?\d{1,3}(?:,?\d{3})*\.\d{2}$/)
    }
    return true;
}

export default function isProductValide(produit){
    return isIdProduitValide(produit.idProduit)&&
        isnomValide(produit.nom)&&
        isImageValide(produit.image)&&
        isPrixValide(produit.Prix);
}
    