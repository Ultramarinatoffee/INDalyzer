import React, { useState } from 'react';

function RecapitulatifAuto({ handleCalcul }) {
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  const onCalcul = (typeReclamation) => {
    if (!dateDebut || !dateFin) {
      alert("Veuillez sélectionner une période de calcul.");
      return;
    }

    handleCalcul({
      date_debut: dateDebut,
      date_fin: dateFin,
      type_reclamation: typeReclamation,
    });
  };

  return (
    <>
      <h3>Période de calcul souhaitée</h3>
      <div>
        <label>
          Date de début:
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            required
          />
        </label>
      </div>
      <div>
        <label>
          Date de fin:
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            required
          />
        </label>
      </div>

      <button onClick={() => onCalcul('standard')}>Réclamation Standard</button>
      <button onClick={() => onCalcul('personnalisee')}>Réclamation Personnalisée</button>
    </>
  );
}

export default RecapitulatifAuto;