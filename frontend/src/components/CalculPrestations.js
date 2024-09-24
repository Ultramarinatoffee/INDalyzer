import React, { useState, useEffect } from 'react';
import RechercheAffilie from './RechercheAffilie';
import EncodageManuel from './EncodageManuel';
import DetailsAccident from './DetailsAccident';
import RecapitulatifEtPeriode from './RecapitulatifEtPeriode';
import RecapitulatifAuto from './RecapitulatifAuto';
import RecapitulatifManuel from './RecapitulatifManuel';
import ChoixTypeReclamation from './ChoixTypeReclamation';
import axios from 'axios';

function CalculPrestations({ modeCalcul }) {
  // const [etape, setEtape] = useState('recherche');
  const [etape, setEtape] = useState(modeCalcul === 'recherche' ? 'recherche' : 'encodage');
  const [affilie, setAffilie] = useState(null);
  const [accident, setAccident] = useState(null);
  const [dateAccident, setDateAccident] = useState(null); 
  // const [periodeCalcul, setPeriodeCalcul] = useState(null);
  const [isManualEntry, setIsManualEntry] = useState(modeCalcul === 'encodage');
  // const [isManualEntry, setIsManualEntry] = useState(false);
  // const [typeReclamation, setTypeReclamation] = useState('');

  const setEtapeAndMode = (newEtape, isManual = false) => {
    setEtape(newEtape);
    setIsManualEntry(isManual);
  };

  // deboggage, à supprimer
  useEffect(() => {
    console.log("Étape actuelle:", etape);
    console.log("Affilie:", affilie);
    console.log("Accident:", accident);
    console.log('CalculPrestations monté. Mode:', modeCalcul, 'Étape:', etape);
    console.log('isManualEntry:', isManualEntry);
  }, [etape, affilie, accident]);


  const renderEtape = () => {
    console.log('Rendering etape:', etape);
    switch(etape) {
      case 'recherche':
        return <RechercheAffilie
          setEtape={(newEtape) => setEtapeAndMode(newEtape, false)}
          setAffilie={setAffilie}
        />;
      case 'encodage':
        return <EncodageManuel
          setEtape={(newEtape) => setEtapeAndMode(newEtape, true)}
          setAffilie={setAffilie}
          setAccident={setAccident}
          setDateAccident={setDateAccident}
        />;
      case 'detailsAccident':
        return <DetailsAccident
          setEtape={(newEtape) => setEtapeAndMode(newEtape, false)}
          setAccident={setAccident}
          setDateAccident={setDateAccident}
          affilie={affilie}
        />;
      case 'recapitulatif':
        return <RecapitulatifEtPeriode
          affilie={affilie}
          accident={accident}
          dateAccident={dateAccident}
          setEtape={(newEtape) => setEtapeAndMode(newEtape, isManualEntry)}
          isManualEntry={isManualEntry}
        />;
      default:
        return <div>Étape inconnue</div>;
    }
  };

  
  return (
    <div>
      <h2>Calcul de Prestations</h2>
      {renderEtape()}
      {/* Le bouton de soumission n'est plus nécessaire ici */}
    </div>
  );
}



export default CalculPrestations;