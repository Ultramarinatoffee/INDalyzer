import React, { useState } from 'react';
import axios from 'axios';

function RecapitulatifEtPeriode({ affilie, accident, setEtape }) {
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [resultatCalcul, setResultatCalcul] = useState(null);

  const handleCalcul = async (typeReclamation) => {
    if (!dateDebut || !dateFin) {
      alert("Veuillez sélectionner une période de calcul.");
      return;
    }

    try {
      const response = await axios.post('/api/calculs/', {
        affilie: affilie.id,
        accident: accident.id,
        date_debut: dateDebut,
        date_fin: dateFin,
        type_reclamation: typeReclamation,
      });
      setResultatCalcul(response.data);
      // Optionnel : passer à une nouvelle étape pour afficher le résultat
      // setEtape('resultatCalcul');
    } catch (error) {
      console.error('Erreur lors du calcul:', error);
      alert("Une erreur s'est produite lors du calcul.");
    }
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
      <p>Salaire de base: {accident.salaire_base ? `${accident.salaire_base}€` : 'Non défini'}</p>

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

      <button onClick={() => handleCalcul('standard')}>Réclamation Standard</button>
      <button onClick={() => handleCalcul('personnalisee')}>Réclamation Personnalisée</button>

      {resultatCalcul && (
        <div>
          <h3>Résultat du calcul</h3>
          <pre>{JSON.stringify(resultatCalcul, null, 2)}</pre>
        </div>
      )}
    </div>
  );
}

export default RecapitulatifEtPeriode;