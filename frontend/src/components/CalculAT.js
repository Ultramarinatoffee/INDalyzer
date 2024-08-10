import React, { useState } from 'react';
import RechercheAffilie from './RechercheAffilie';
import EncodageManuel from './EncodageManuel';
import DetailsAccident from './DetailsAccident';
import ChoixTypeReclamation from './ChoixTypeReclamation';

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
        return <DetailsAccident setEtape={setEtape} setDateAccident={setDateAccident} />;
      case 'choixReclamation':
        return <ChoixTypeReclamation setEtape={setEtape} setTypeReclamation={setTypeReclamation} />;
      default:
        return <div>Étape inconnue</div>;
    }
  };

  return (
    <div>
      <h2>Calcul Accident de Travail</h2>
      {renderEtape()}
    </div>
  );
}

export default CalculAT;