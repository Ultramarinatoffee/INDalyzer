import React, { useState } from 'react';
import RechercheAffilie from './RechercheAffilie';
import EncodageManuel from './EncodageManuel';
import DetailsAccident from './DetailsAccident';
import ChoixTypeReclamation from './ChoixTypeReclamation';
import axios from 'axios';

function CalculAT() {
  const [etape, setEtape] = useState('recherche');
  const [affilie, setAffilie] = useState(null);
  const [dateAccident, setDateAccident] = useState('');
  const [typeReclamation, setTypeReclamation] = useState('');

  const renderEtape = () => {
    switch(etape) {
      case 'recherche':
        return <RechercheAffilie setEtape={setEtape} setAffilie={setAffilie} />;
      case 'encodageManuel':
        return <EncodageManuel setEtape={setEtape} setAffilie={setAffilie} />;
      case 'detailsAccident':
        return <DetailsAccident setEtape={setEtape} setDateAccident={setDateAccident} affilie={affilie} />;
      case 'choixReclamation':
        return <ChoixTypeReclamation setEtape={setEtape} setTypeReclamation={setTypeReclamation} />;
      default:
        return <div>Étape inconnue</div>;
    }
  };


  

  const soumettreCalcul = async () => {
    try {
      const response = await axios.post('/api/calculs/', {
        affilie: affilie.id,
        date_accident: dateAccident,
        type_reclamation: typeReclamation,
        // Ajoutez d'autres données nécessaires
      });
      console.log('Calcul soumis avec succès:', response.data);
      // Gérez la réponse (par exemple, afficher un message de succès, rediriger, etc.)
    } catch (error) {
      console.error('Erreur lors de la soumission du calcul:', error);
      // Gérez l'erreur (par exemple, afficher un message d'erreur)
    }
  };

  return (
    <div>
      <h2>Calcul Accident de Travail</h2>
      {renderEtape()}
      {etape === 'choixReclamation' && (
        <button onClick={soumettreCalcul}>Soumettre le calcul</button>
      )}
    </div>
  );
}



export default CalculAT;