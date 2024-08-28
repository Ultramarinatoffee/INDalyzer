import React from 'react';

function Home({ setCurrentPage, setModeCalcul }) {
  return (
    <div>
      <h1>Bienvenue dans le système de calcul de prestations</h1>
      {/* <div>
        <button onClick={() => setCurrentPage('calculAT')}>
          Accident de Travail (AT)
        </button>
        <button onClick={() => setCurrentPage('calculDC')}>
          Droit Commun (DC)
        </button>
      </div> */}
      <div>
        <button onClick={() => {
          setCurrentPage('rechercheAffilie');
          setModeCalcul('recherche');
        }}>
          Rechercher un affilié existant
        </button>
        <button onClick={() => {
          setCurrentPage('encodageManuel');
          setModeCalcul('encodage');
        }}>
          Encoder manuellement un nouveau calcul
        </button>
      </div>
    </div>
  );
}

export default Home;