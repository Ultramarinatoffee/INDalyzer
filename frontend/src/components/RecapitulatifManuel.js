import React, { useState } from 'react';
// import { formaterDate } from '../utils';
import { formaterDate, formaterDatePourBackend } from '../utils';

// function RecapitulatifManuel({ handleCalcul }) {
function RecapitulatifManuel({ handleCalcul, accident }) {
  const [periodes, setPeriodes] = useState([]);
  const [periodeActuelle, setPeriodeActuelle] = useState({ dateDebut: '', dateFin: '', nombreJours: '' });


  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

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
  

//   const onCalcul = (typeReclamation) => {
//     if (periodes.length === 0) {
//       alert("Veuillez ajouter au moins une période.");
//       return;
//     }

//     const formattedPeriodes = periodes.map(p => ({
//       dateDebut: formaterDatePourBackend(p.dateDebut),
//       dateFin: formaterDatePourBackend(p.dateFin),
//       nombreJours: parseInt(p.nombreJours, 10),
//       debut: formaterDatePourBackend(p.dateDebut),
//       fin: formaterDatePourBackend(p.dateFin)
//     }));

//     const dateDebut = formattedPeriodes.reduce((min, p) => p.dateDebut < min ? p.dateDebut : min, formattedPeriodes[0].dateDebut);
//     const dateFin = formattedPeriodes.reduce((max, p) => p.dateFin > max ? p.dateFin : max, formattedPeriodes[0].dateFin);

//     handleCalcul({
//         date_debut: dateDebut,
//         date_fin: dateFin,
//         type_reclamation: typeReclamation,
//         periodes: formattedPeriodes,
//         is_manual_entry: true
//     });
// };

const onCalcul = () => {
  const donneesSpecifiques = {};

  if (accident.type_accident === 'DC' && !accident.convention_assuralia) {
    // DC sans Assuralia : l'utilisateur ajoute les périodes manuellement
    if (periodes.length === 0) {
      alert("Veuillez ajouter au moins une période.");
      return;
    }
    const formattedPeriodes = periodes.map(p => ({
      dateDebut: formaterDatePourBackend(p.dateDebut),
      dateFin: formaterDatePourBackend(p.dateFin),
      nombreJours: parseInt(p.nombreJours, 10),
      taux: p.taux,
      debut: formaterDatePourBackend(p.dateDebut),
      fin: formaterDatePourBackend(p.dateFin),
    }));
    donneesSpecifiques.periodes = formattedPeriodes;

  } else {
    // AT et DC avec Assuralia : générer une période automatiquement
    if (!dateDebut || !dateFin) {
      alert("Veuillez saisir les dates de début et de fin.");
      return;
    }
    const nombreJours = Math.ceil((new Date(dateFin) - new Date(dateDebut)) / (1000 * 60 * 60 * 24)) + 1;

    const periode = {
      dateDebut: formaterDatePourBackend(dateDebut),
      dateFin: formaterDatePourBackend(dateFin),
      nombreJours: nombreJours,
      taux: '100',  // Taux par défaut
      debut: formaterDatePourBackend(dateDebut),
      fin: formaterDatePourBackend(dateFin),
    };

    donneesSpecifiques.periodes = [periode];
  }

  // Inclure date_debut et date_fin pour le backend
  donneesSpecifiques.date_debut = formaterDatePourBackend(dateDebut);
  donneesSpecifiques.date_fin = formaterDatePourBackend(dateFin);

  handleCalcul(donneesSpecifiques);
};


return (
  <>
    {accident.type_accident === 'DC' && !accident.convention_assuralia ? (
      // Pour DC sans Assuralia : l'utilisateur ajoute les périodes manuellement
      <div>
        <h3>Périodes d'ITT avec taux (Dégressivité)</h3>
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
        <div>
          <label htmlFor="taux">Taux applicable (%) :</label>
          <input 
            type="number" 
            id="taux"
            name="taux"
            value={periodeActuelle.taux} 
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
                <th>Taux (%)</th>
              </tr>
            </thead>
            <tbody>
              {periodes.map((periode, index) => (
                <tr key={index}>
                  <td>{formaterDate(periode.dateDebut)}</td>
                  <td>{formaterDate(periode.dateFin)}</td>
                  <td>{periode.nombreJours}</td>
                  <td>{periode.taux}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    ) : (
      // Pour AT et DC avec Assuralia : l'utilisateur saisit les dates de début et de fin
      <div>
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
      </div>
    )}

    <button onClick={onCalcul}>Calculer</button>
  </>
);
}

export default RecapitulatifManuel;

//   return (
//     <>
//       <h3>Périodes d'indemnisation</h3>
//       <div>
//         <label htmlFor="dateDebut">Date de début :</label>
//         <input 
//           type="date" 
//           id="dateDebut"
//           name="dateDebut"
//           value={periodeActuelle.dateDebut} 
//           onChange={handlePeriodeChange}
//         />
//       </div>
//       <div>
//         <label htmlFor="dateFin">Date de fin :</label>
//         <input 
//           type="date" 
//           id="dateFin"
//           name="dateFin"
//           value={periodeActuelle.dateFin} 
//           onChange={handlePeriodeChange}
//         />
//       </div>
//       <div>
//         <label htmlFor="nombreJours">Nombre de jours :</label>
//         <input 
//           type="number" 
//           id="nombreJours"
//           name="nombreJours"
//           value={periodeActuelle.nombreJours} 
//           onChange={handlePeriodeChange}
//         />
//       </div>
//       <button type="button" onClick={ajouterPeriode}>Ajouter la période</button>

//       {periodes.length > 0 && (
//         <table>
//           <thead>
//             <tr>
//               <th>Date de début</th>
//               <th>Date de fin</th>
//               <th>Nombre de jours</th>
//             </tr>
//           </thead>
//           <tbody>
//             {periodes.map((periode, index) => (
//               <tr key={index}>
//                 <td>{formaterDate(periode.dateDebut)}</td>
//                 <td>{formaterDate(periode.dateFin)}</td>
//                 <td>{periode.nombreJours}</td>
//               </tr>
//             ))}
//           </tbody>
//         </table>
//       )}

//       <button onClick={() => onCalcul('standard')}>Réclamation Standard</button>
//       <button onClick={() => onCalcul('personnalisee')}>Réclamation Personnalisée</button>
//     </>
//   );
// }

// export default RecapitulatifManuel;