import React from 'react';

function ChoixTypeReclamation({ setEtape, setTypeReclamation }) {
  const handleChoice = (type) => {
    setTypeReclamation(type);
    setEtape('reclamation'); // Vous devrez créer cette étape suivante
  };

  return (
    <div>
      <button onClick={() => handleChoice('standard')}>Réclamation Standard</button>
      <button onClick={() => handleChoice('personnalisee')}>Réclamation Personnalisée</button>
    </div>
  );
}

export default ChoixTypeReclamation;