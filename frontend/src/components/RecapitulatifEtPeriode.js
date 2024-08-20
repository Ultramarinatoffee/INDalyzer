import React, { useState } from 'react';

function RecapitulatifEtPeriode({ affilie, accident, setEtape, setPeriodeCalcul }) {
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setPeriodeCalcul({ dateDebut, dateFin });
    setEtape('choixReclamation');
  };

  return (
    <div>
      <h2>Récapitulatif</h2>
      <h3>Détails de l'affilié</h3>
      <p>Nom: {affilie.nom}</p>
      <p>Prénom: {affilie.prenom}</p>
      <p>Numéro de registre national: {affilie.numero_registre_national}</p>

      <h3>Détails de l'accident</h3>
      <p>Date de l'accident: {accident.date_accident}</p>
      <p>Type: {accident.type_accident_display}</p>
      <p>Taux IPP: {accident.taux_IPP}%</p>

      <h3>Période de calcul</h3>
      <form onSubmit={handleSubmit}>
        <label>
          Date de début:
          <input 
            type="date" 
            value={dateDebut} 
            onChange={(e) => setDateDebut(e.target.value)}
            required
          />
        </label>
        <label>
          Date de fin:
          <input 
            type="date" 
            value={dateFin} 
            onChange={(e) => setDateFin(e.target.value)}
            required
          />
        </label>
        <button type="submit">Continuer</button>
      </form>
    </div>
  );
}

export default RecapitulatifEtPeriode;