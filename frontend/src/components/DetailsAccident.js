import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DetailsAccident({ setEtape, setDateAccident, setAccident, affilie }) {
  const [accidents, setAccidents] = useState([]);

  useEffect(() => {
    const fetchAccidents = async () => {
      try {
        const response = await axios.get(`/api/accidents/?affilie=${affilie.id}`);
        setAccidents(response.data);
      } catch (error) {
        console.error("Erreur lors de la récupération des accidents:", error);
      }
    };

    if (affilie) {
      fetchAccidents();
    }
  }, [affilie]);

  const handleAccidentClick = (accident) => {
    setAccident(accident);
    setDateAccident(accident.date_accident);
    setEtape('recapitulatif');
  };

  return (
    <div className="details-accident">
      <h3>Détails de l'affilié</h3>a
      <p>Nom: {affilie.nom}</p>
      <p>Prénom: {affilie.prenom}</p>
      <p>Numéro de registre national: {affilie.numero_registre_national}</p>
      <p>Numéro externe: {affilie.numero_externe}</p>

      <h3>Liste des accidents</h3>
      {accidents.length > 0 ? (
        <table className="accidents-table">
          <thead>
            <tr>
              <th>Date</th>
              <th>Type</th>
              <th>Date de consolidation</th>
              <th>Taux IPP</th>
              <th>Salaire de base</th>
            </tr>
          </thead>
          <tbody>
            {accidents.map(accident => (
              <tr 
                key={accident.id} 
                onClick={() => handleAccidentClick(accident)}
                className="clickable-row"
              >
                <td>{accident.date_accident}</td>
                <td>{accident.type_accident_display}</td>
                <td>{accident.date_consolidation || 'N/A'}</td>
                <td>{accident.taux_IPP !== null ? `${accident.taux_IPP}%` : 'N/A'}</td>
                <td>{accident.type_accident === 'AT' ? 
                    (accident.salaire_base ? `${accident.salaire_base}€` : 'Non défini') : 
                    'N/A'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <p>Aucun accident enregistré pour cet affilié.</p>
      )}

      <button onClick={() => setEtape('choixReclamation')}>Nouvel accident</button>
    </div>
  );
}

export default DetailsAccident;