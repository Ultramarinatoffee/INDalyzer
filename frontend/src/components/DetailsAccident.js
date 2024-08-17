import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DetailsAccident({ setEtape, setDateAccident, affilie }) {
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

  const handleAccidentSelect = (accident) => {
    setDateAccident(accident.date_accident);
    setEtape('choixReclamation');
  };

  return (
    <div>
      <h3>Détails de l'affilié</h3>
      <p>Nom: {affilie.nom}</p>
      <p>Prénom: {affilie.prenom}</p>
      <p>Numéro de registre national: {affilie.numero_registre_national}</p>
      <p>Numéro externe: {affilie.numero_externe}</p>

      <h3>Liste des accidents</h3>
      {accidents.length > 0 ? (
        <ul>
          {accidents.map(accident => (
            <li key={accident.id} onClick={() => handleAccidentSelect(accident)}>
              Date: {accident.date_accident}, Type: {accident.type_accident}
            </li>
          ))}
        </ul>
      ) : (
        <p>Aucun accident enregistré pour cet affilié.</p>
      )}

      <button onClick={() => setEtape('choixReclamation')}>Nouvel accident</button>
    </div>
  );
}

export default DetailsAccident;