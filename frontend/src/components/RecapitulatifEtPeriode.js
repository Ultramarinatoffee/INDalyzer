import React, { useState, useEffect } from 'react';
import { formaterDate, formaterDatePourBackend } from '../utils';
import axios from 'axios';
import RecapitulatifAuto from './RecapitulatifAuto';
import RecapitulatifManuel from './RecapitulatifManuel';

function RecapitulatifEtPeriode({ affilie, accident, dateAccident, setEtape, isManualEntry }) {
  const [resultatCalcul, setResultatCalcul] = useState(null);
  // const [typeCommentaire, setTypeCommentaire] = useState('');

  const [typeCalcul, setTypeCalcul] = useState('');

  const [commentaireTexte, setCommentaireTexte] = useState('');
  const [donneesCalcul, setDonneesCalcul] = useState({});

  useEffect(() => {
    if (!affilie || !accident) {
      console.error("Affilié ou accident non défini", { affilie, accident });
    }
  }, [affilie, accident]);

  const handleCalcul = async (donneesSpecifiques) => {
    if (!affilie || !affilie.id) {
      console.error("Affilié invalide:", affilie);
      alert("Les informations de l'affilié sont manquantes.");
      return;
    }


  const donneesCompletes = {
    affilie: affilie.id,
    accident: accident.id,
    is_manual_entry: isManualEntry,

    // type_commentaire: typeCommentaire,
    // commentaire_texte: typeCommentaire === 'AUTRE' ? commentaireTexte : '',

    type_calcul: typeCalcul,
    commentaire_texte: commentaireTexte,

    // date_accident: accident.date_accident,
    date_accident: formaterDatePourBackend(accident.date_accident),
    type_accident: accident.type_accident,
    statut_chomage: accident.statut_chomage,
    convention_assuralia: accident.convention_assuralia,
    salaire_base: accident.salaire_base,
    // date_consolidation: accident.date_consolidation,
    date_consolidation: formaterDatePourBackend(accident.date_consolidation),
    taux_IPP: accident.taux_IPP,
    ...donneesSpecifiques
  };

    // debogage
    console.log('Type de accident.convention_assuralia:', typeof accident.convention_assuralia);


    setDonneesCalcul(donneesCompletes);

    try {
      console.log("Envoi de la requête avec:", donneesCompletes);
      const response = await axios.post('/api/calculs/calculer_rente/', donneesCompletes);
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



        // Créer une copie de resultatCalcul pour éviter de modifier l'état directement
      const resultatCalculPourEnvoi = { ...resultatCalcul };
      

        // Reformater les dates dans les périodes au format 'YYYY-MM-DD'
        if (resultatCalculPourEnvoi.periodes && Array.isArray(resultatCalculPourEnvoi.periodes)) {
          resultatCalculPourEnvoi.periodes = resultatCalculPourEnvoi.periodes.map(periode => ({
              ...periode,
              debut: formaterDatePourBackend(periode.debut),
              fin: formaterDatePourBackend(periode.fin),
          }));
      }

          // Reformater les dates dans donneesCalcul si nécessaire
      const donneesCalculPourEnvoi = { ...donneesCalcul };

      if (donneesCalculPourEnvoi.date_debut) {
        donneesCalculPourEnvoi.date_debut = formaterDatePourBackend(donneesCalculPourEnvoi.date_debut);
    }
      if (donneesCalculPourEnvoi.date_fin) {
        donneesCalculPourEnvoi.date_fin = formaterDatePourBackend(donneesCalculPourEnvoi.date_fin);
    }
      if (donneesCalculPourEnvoi.date_accident) {
        donneesCalculPourEnvoi.date_accident = formaterDatePourBackend(donneesCalculPourEnvoi.date_accident);
    }
      if (donneesCalculPourEnvoi.date_consolidation) {
        donneesCalculPourEnvoi.date_consolidation = formaterDatePourBackend(donneesCalculPourEnvoi.date_consolidation);
    }

      try {
        const dataToSend = {
            ...donneesCalculPourEnvoi,
            ...resultatCalculPourEnvoi,
            affilie: affilie.id,
            accident: accident.id,
            generate_pdf: true
        };

        console.log("Données envoyées pour la génération du PDF:", dataToSend);

        const response = await axios.post('/api/calculs/calculer_rente/', dataToSend, {
            responseType: 'blob'
        });

        // Code pour le téléchargement du PDF
        const url = window.URL.createObjectURL(new Blob([response.data]));
        const link = document.createElement('a');
        link.href = url;
        link.setAttribute('download', 'rapport_rente.pdf');
        document.body.appendChild(link);
        link.click();
        link.parentNode.removeChild(link);
        alert("Le PDF a été généré avec succès et le téléchargement a commencé.");

      } catch (error) {
        console.error('Erreur lors de la génération du PDF:', error);
        if (error.response) {
          console.error('Statut de l\'erreur:', error.response.status);
          if (error.response.data instanceof Blob) {
            const reader = new FileReader();
            reader.onload = () => {
              try {
                const errorData = JSON.parse(reader.result);
                console.error('Détails de l\'erreur:', errorData);
                alert(`Erreur lors de la génération du PDF: ${errorData.error || 'Erreur inconnue'}`);
              } catch (e) {
                console.error('Impossible de parser l\'erreur:', reader.result);
                alert("Une erreur s'est produite lors de la génération du PDF.");
              }
            };
            reader.readAsText(error.response.data);
          } else {
            console.error('Détails de l\'erreur:', error.response.data);
            alert(`Erreur lors de la génération du PDF: ${error.response.data.error || 'Erreur inconnue'}`);
          }
        } else {
          alert("Une erreur s'est produite lors de la génération du PDF.");
        }
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
              <td>{periode.montant_journalier_rente?.toFixed(2) ?? 'N/A'}€</td>
              <td>{periode.total?.toFixed(2) ?? 'N/A'}€</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="4">Total général</td>
            <td>{resultatCalcul.total_general?.toFixed(2) ?? 'N/A'}€</td>
          </tr>
        </tfoot>
      </table>
    );
  };

  return (
    <div>
      <h2>Récapitulatif</h2>
      <h3>Détails de l'affilié</h3>
      <p>Nom: {affilie?.nom}</p>
      <p>Prénom: {affilie?.prenom}</p>
      <p>Numéro de registre national: {affilie?.numero_registre_national}</p>

      <h3>Détails de l'accident</h3>
      <p>Date de l'accident: {formaterDate(accident?.date_accident || dateAccident || 'Non défini')}</p>
      <p>Type: {accident?.type_accident_display || (accident?.type === 'AT' ? 'Accident de Travail' : 'Droit Commun') || 'Non défini'}</p>
      <p>Date de consolidation: {accident?.type_calcul === 'ITT' ? 'N/A' : (formaterDate(accident?.date_consolidation) || 'N/A')}</p>
      <p>Taux IPP: {accident?.taux_IPP ? `${accident.taux_IPP}%` : 'N/A'}</p>
      <p>Salaire de base: {accident?.salaire_base ? `${accident.salaire_base}€` : 'N/A'}</p>

      
      <h3>Type de calcul</h3>


      {/* <select value={typeCommentaire} onChange={(e) => setTypeCommentaire(e.target.value)}> */}

      <select value={typeCalcul} onChange={(e) => setTypeCalcul(e.target.value)}>

        <option value="" disabled>Sélectionner le motif</option>
        <option value="IPP">Reconnaissance d'une IPP</option>
        <option value="AGGRAVATION">Aggravation d'une IPP</option>
        <option value="ITT">Reconnaissance d'une ITT</option>
        <option value="SALAIRE">Modification du salaire de base</option>
        <option value="AUTRE">Autre</option>
      </select>

      {typeCalcul === 'AUTRE' && (
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

      {isManualEntry ? (
              <RecapitulatifManuel handleCalcul={handleCalcul} accident={accident} />
            ) : (
              <RecapitulatifAuto handleCalcul={handleCalcul} accident={accident} />
            )}

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


{/* 
      {isManualEntry ? (
        <RecapitulatifManuel handleCalcul={handleCalcul} />
      ) : (
        <RecapitulatifAuto handleCalcul={handleCalcul} />
      )}

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

 */}
