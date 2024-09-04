import React, { useState } from 'react';
import { formaterDate } from '../utils';

function RecapitulatifManuel({ handleCalcul }) {
  const [periodes, setPeriodes] = useState([]);
  const [periodeActuelle, setPeriodeActuelle] = useState({ dateDebut: '', dateFin: '', nombreJours: '' });

  const handlePeriodeChange = (e) => {
    const { name, value } = e.target;
    setPeriodeActuelle(prev => ({ ...prev, [name]: value }));
  };

  const ajouterPeriode = () => {
    if (periodeActuelle.dateDebut && periodeActuelle.dateFin && periodeActuelle.nombreJours) {
      setPeriodes([...periodes, periodeActuelle]);
      setPeriodeActuelle({ dateDebut: '', dateFin: '', nombreJours: '' });
    } else {
      alert("Veuillez remplir tous les champs de la période.");
    }
  };

  const onCalcul = (typeReclamation) => {
    if (periodes.length === 0) {
      alert("Veuillez ajouter au moins une période.");
      return;
    }

    handleCalcul({
      periodes: periodes,
      type_reclamation: typeReclamation,
    });
  };

  return (
    <>
      <h3>Périodes d'indemnisation</h3>
      <div>
        <label htmlFor="dateDebut">Date de début :</label>
        <input 
          type="date" 
          id="dateDebut"
          name="dateDebut"
          value={periodeActuelle.dateDebut} 
          onChange={handlePeriodeChange}
        />
      </div>
      <div>
        <label htmlFor="dateFin">Date de fin :</label>
        <input 
          type="date" 
          id="dateFin"
          name="dateFin"
          value={periodeActuelle.dateFin} 
          onChange={handlePeriodeChange}
        />
      </div>
      <div>
        <label htmlFor="nombreJours">Nombre de jours :</label>
        <input 
          type="number" 
          id="nombreJours"
          name="nombreJours"
          value={periodeActuelle.nombreJours} 
          onChange={handlePeriodeChange}
        />
      </div>
      <button type="button" onClick={ajouterPeriode}>Ajouter la période</button>

      {periodes.length > 0 && (
        <table>
          <thead>
            <tr>
              <th>Date de début</th>
              <th>Date de fin</th>
              <th>Nombre de jours</th>
            </tr>
          </thead>
          <tbody>
            {periodes.map((periode, index) => (
              <tr key={index}>
                <td>{formaterDate(periode.dateDebut)}</td>
                <td>{formaterDate(periode.dateFin)}</td>
                <td>{periode.nombreJours}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      <button onClick={() => onCalcul('standard')}>Réclamation Standard</button>
      <button onClick={() => onCalcul('personnalisee')}>Réclamation Personnalisée</button>
    </>
  );
}

export default RecapitulatifManuel;