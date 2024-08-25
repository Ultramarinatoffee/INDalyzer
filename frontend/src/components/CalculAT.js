import React, { useState, useEffect } from 'react';
import RechercheAffilie from './RechercheAffilie';
import EncodageManuel from './EncodageManuel';
import DetailsAccident from './DetailsAccident';
import RecapitulatifEtPeriode from './RecapitulatifEtPeriode';
import ChoixTypeReclamation from './ChoixTypeReclamation';
import axios from 'axios';

function CalculAT() {
  const [etape, setEtape] = useState('recherche');
  const [affilie, setAffilie] = useState(null);
  const [accident, setAccident] = useState(null);
  const [dateAccident, setDateAccident] = useState(null); 
  const [periodeCalcul, setPeriodeCalcul] = useState(null);
  const [typeReclamation, setTypeReclamation] = useState('');

  // deboggage, à supprimer
  useEffect(() => {
    console.log("Étape actuelle:", etape);
    console.log("Affilie:", affilie);
    console.log("Accident:", accident);
  }, [etape, affilie, accident]);

  const renderEtape = () => {
    switch(etape) {
      case 'recherche':
        return <RechercheAffilie setEtape={setEtape} setAffilie={setAffilie} />;
      case 'detailsAccident':
        return <DetailsAccident 
        setEtape={setEtape} 
        setDateAccident={setDateAccident}
        setAccident={setAccident}
        affilie={affilie} 
        />;
      case 'recapitulatif':
        console.log("Rendu du récapitulatif avec:", { affilie, accident, dateAccident });
        return <RecapitulatifEtPeriode 
          affilie={affilie}
          accident={accident}
          dateAccident={dateAccident}  
          setEtape={setEtape}
          setPeriodeCalcul={setPeriodeCalcul}
        />;
      case 'choixReclamation':
        return <ChoixTypeReclamation setEtape={setEtape} />;
      default:
        return <div>Étape inconnue</div>;
    }
  };

  
  const soumettreCalcul = async () => {
    try {
      const response = await axios.post('/api/calculs/', {
        affilie: affilie.id,
        accident: accident.id,
        date_debut: periodeCalcul.dateDebut,
        date_fin: periodeCalcul.dateFin,
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