import React, { useEffect, useState } from 'react';
import axios from 'axios';

function DetailsAccident({ setEtape, setDateAccident, setAccident, affilie }) {
  const [accidents, setAccidents] = useState([]);
  const [selectedAccident, setSelectedAccident] = useState(null);
  const [conventionAssuralia, setConventionAssuralia] = useState(null);
  const [statutChomage, setStatutChomage] = useState('NON');

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

  // const handleAccidentClick = (accident) => {
  //   setAccident(accident);
  //   setDateAccident(accident.date_accident);
  //   setEtape('recapitulatif');
  // };

  const handleAccidentClick = (accident) => {
    setSelectedAccident(accident);
    setDateAccident(accident.date_accident);
    // Si l'accident est de type DC, on attend les informations supplémentaires
    if (accident.type_accident === 'DC') {
      // On ne passe pas encore à l'étape suivante
    } else {
      // Pour les accidents de type AT, on peut directement passer à l'étape suivante
      setAccident(accident);
      setEtape('recapitulatif');
    }
  };

  const handleNext = () => {
    if (selectedAccident) {

      // debogage
      console.log('conventionAssuralia:', conventionAssuralia, 'Type:', typeof conventionAssuralia);


      const updatedAccident = {
        ...selectedAccident,
        convention_assuralia: conventionAssuralia,
        statut_chomage: conventionAssuralia ? statutChomage : 'NON',
      };
      setAccident(updatedAccident);
      setEtape('recapitulatif');
    }
  };

  return (
    <div className="details-accident">
      <h3>Détails de l'affilié</h3>
      <p>Nom: {affilie.nom}</p>
      <p>Prénom: {affilie.prenom}</p>
      <p>Numéro de registre national: {affilie.numero_registre_national}</p>
      <p>Numéro externe: {affilie.numero_externe}</p>

      <h3>Liste des accidents</h3>
      {accidents.length > 0 ? (
        <>
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
                  className={`clickable-row ${selectedAccident && selectedAccident.id === accident.id ? 'selected' : ''}`}
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

          {selectedAccident && selectedAccident.type_accident === 'DC' && (
            <div>
              <h3>Informations supplémentaires pour l'accident de droit commun (DC)</h3>
              <label>
                La convention Assuralia s'applique-t-elle ?
                <select value={conventionAssuralia !== null ? conventionAssuralia.toString() : ''} onChange={(e) => setConventionAssuralia(e.target.value === 'true')}>
                  <option value="">Sélectionnez</option>
                  <option value="true">Oui</option>
                  <option value="false">Non</option>
                </select>
              </label>
              {conventionAssuralia === true && (
                <label>
                  Statut de chômage :
                  <select value={statutChomage} onChange={(e) => setStatutChomage(e.target.value)}>
                    <option value="NON">Non applicable</option>
                    <option value="OCCASIONNEL">Chômeur occasionnel</option>
                    <option value="LONGUE_DUREE">Chômeur de longue durée</option>
                  </select>
                </label>
              )}
              <button onClick={handleNext}>Suivant</button>
            </div>
          )}

          {selectedAccident && selectedAccident.type_accident !== 'DC' && (
            <p>Accident sélectionné. Cliquez sur 'Suivant' pour continuer.</p>
          )}
        </>
      ) : (
        <p>Aucun accident enregistré pour cet affilié.</p>
      )}

      {selectedAccident && selectedAccident.type_accident !== 'DC' && (
        <button onClick={() => setEtape('recapitulatif')}>Suivant</button>
      )}

    </div>
  );
}

export default DetailsAccident;

