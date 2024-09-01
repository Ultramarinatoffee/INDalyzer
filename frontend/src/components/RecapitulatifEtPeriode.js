import React, { useState, useEffect } from 'react';
import { formaterDate } from '../utils';
import axios from 'axios';

function RecapitulatifEtPeriode({ affilie, accident, dateAccident, setEtape, isManualEntry}) {


  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [resultatCalcul, setResultatCalcul] = useState(null);
  // const [typeCommentaire, setTypeCommentaire] = useState('AUTRE');
  const [pourcentageIPP, setPourcentageIPP] = useState('');
  const [dateEffet, setDateEffet] = useState('');
  const [commentaireTexte, setCommentaireTexte] = useState('');
  const [typeCommentaire, setTypeCommentaire] = useState('');

  const [periodes, setPeriodes] = useState([]);
  const [periodeActuelle, setPeriodeActuelle] = useState({
    dateDebut: '',
    dateFin: '',
    nombreJours: '',
  });

  // debogage, à supprimer
  useEffect(() => {
    console.log("RecapitulatifEtPeriode monté avec:", { affilie, accident });
  }, [affilie, accident]);

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

  const handleCalcul = async (typeReclamation) => {
    if (!dateDebut || !dateFin) {
      alert("Veuillez sélectionner une période de calcul.");
      return;
    }

    if (!typeCommentaire) {
      alert("Veuillez sélectionner un type de commentaire.");
      return;
    }

    try {
      console.log("Envoi de la requête avec:", { affilie, accident, dateDebut, dateFin, typeReclamation });
      const response = await axios.post('/api/calculs/calculer_rente/', {
        affilie: affilie.id,
        accident: accident.id,
        date_debut: dateDebut,
        date_fin: dateFin,

        type_reclamation: typeReclamation,
        type_commentaire: typeCommentaire,
        commentaire_texte: typeCommentaire === 'AUTRE' ? commentaireTexte : '',
        pourcentage_ipp: accident.taux_IPP, 
        date_effet: accident.date_consolidation,
       
       
      });
      console.log("Réponse reçue:", response.data);
      setResultatCalcul(response.data);
    } catch (error) {
      console.error('Erreur lors du calcul:', error);
      alert("Une erreur s'est produite lors du calcul.");
    }
  };

  const handleGenererPDF = async () => {
    if (!resultatCalcul) {
      alert("Veuillez d'abord effectuer un calcul.");
      return;
    }

  try {
    const response = await axios.post('/api/calculs/calculer_rente/', {
      ...resultatCalcul,
      affilie: affilie.id,
      accident: accident.id,
      date_debut: dateDebut,
      date_fin: dateFin,
      type_commentaire: typeCommentaire,
      pourcentage_ipp: pourcentageIPP,
      date_effet: dateEffet,
      commentaire_texte: typeCommentaire === 'AUTRE' ? commentaireTexte : '',
      periodes: isManualEntry ? periodes : undefined,
      generate_pdf: true
    }, {
      responseType: 'blob'
    });

      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'rapport_rente.pdf');
      document.body.appendChild(link);
      link.click();
      link.parentNode.removeChild(link);
    } catch (error) {
      console.error('Erreur lors de la génération du PDF:', error);
      alert("Une erreur s'est produite lors de la génération du PDF.");
    }
  };

  const renderTableauResultats = () => {
    if (!resultatCalcul || !resultatCalcul.periodes) return null;

    return (
      <table>
        <thead>
          <tr>
            <th>Date début d'ITT</th>
            <th>Date fin</th>
            <th>Nombre de jours</th>
            <th>Taux journalier d'IPP Calculé</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {resultatCalcul.periodes.map((periode, index) => (
            <tr key={index}>
              <td>{periode.debut}</td>
              <td>{periode.fin}</td>
              <td>{periode.nombre_jours}</td>
              <td>{periode.montant_journalier_rente?.toFixed(2) ?? 'N/A'}€</td> {/* Utilisation de ?. et ?? pour gérer les valeurs undefined */}
              <td>{periode.total?.toFixed(2) ?? 'N/A'}€</td> {/* Utilisation de ?. et ?? pour gérer les valeurs undefined */}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="4">Total général</td>
            <td>{resultatCalcul.total_general?.toFixed(2) ?? 'N/A'}€</td> {/* Utilisation de ?. et ?? pour gérer les valeurs undefined */}
          </tr>
        </tfoot>
      </table>
    );
  };

  return (
    <div>
      <h2>Récapitulatif</h2>
      <h3>Détails de l'affilié</h3>
      <p>Nom: {affilie?.nom}</p> {/* Utilisation de ?. pour éviter les erreurs si affilie est null */}
      <p>Prénom: {affilie?.prenom}</p> {/* Utilisation de ?. pour éviter les erreurs si affilie est null */}
      <p>Numéro de registre national: {affilie?.numero_registre_national}</p> {/* Utilisation de ?. pour éviter les erreurs si affilie est null */}

      <h3>Détails de l'accident</h3>
    
      <p>Date de l'accident: {formaterDate(accident?.date_accident || dateAccident || 'Non défini')}</p>
      <p>Type: {accident?.type_accident_display || (accident?.type === 'AT' ? 'Accident de Travail' : 'Droit Commun') || 'Non défini'}</p>
      {/* <p>Date de consolidation: {formaterDate(accident?.date_consolidation) || 'N/A'}</p> */}
      <p>Date de consolidation: {accident?.type_calcul === 'ITT' ? 'N/A' : (formaterDate(accident?.date_consolidation) || 'N/A')}</p>
      <p>Taux IPP: {accident?.taux_IPP ? `${accident.taux_IPP}%` : 'N/A'}</p>
      <p>Salaire de base: {accident?.salaire_base ? `${accident.salaire_base}€` : 'N/A'}</p>

      {isManualEntry ? (
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
        </>
      ) : (
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
        </>
      )}
 
      <h3>Commentaire</h3>
      <select value={typeCommentaire} onChange={(e) => setTypeCommentaire(e.target.value)}>
        <option value="" disabled>Sélectionner le motif</option>
        <option value="IPP">Reconnaissance d'une IPP</option>
        <option value="AGGRAVATION">Aggravation d'une IPP</option>
        <option value="ITT">Reconnaissance d'une ITT à 100%</option>
        <option value="SALAIRE">Modification du salaire de base</option>
        <option value="AUTRE">Autre</option>
      </select>

      {typeCommentaire === 'AUTRE' && (
        <div>
          <label>
            Commentaire:
            <textarea
              value={commentaireTexte}
              onChange={(e) => setCommentaireTexte(e.target.value)}
            />
          </label>
        </div>
      )}

      <button onClick={() => handleCalcul('standard')}>Réclamation Standard</button>
      <button onClick={() => handleCalcul('personnalisee')}>Réclamation Personnalisée</button>

      {resultatCalcul && (
        <div>
          <h3>Résultat du calcul</h3>
          {resultatCalcul.commentaire && <p>{resultatCalcul.commentaire}</p>}
          {renderTableauResultats()}
          <button onClick={handleGenererPDF}>Générer PDF</button>
        </div>
      )}
    </div>
  );
}

export default RecapitulatifEtPeriode;