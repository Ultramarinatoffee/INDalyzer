import React, { useState } from 'react';

// function RecapitulatifAuto({ handleCalcul }) {

function RecapitulatifAuto({ handleCalcul, accident }) {
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  const [periodes, setPeriodes] = useState([]);

  console.log('RecapitulatifAuto - accident.convention_assuralia:', accident.convention_assuralia, 'Type:', typeof accident.convention_assuralia);


  // Pour DC sans Assuralia



  // const ajouterPeriode = () => {
  //   setPeriodes([...periodes, { debut: '', fin: '', taux: '100' }]);
  // };


  const ajouterPeriode = () => {
    // Vérifier si la dernière période est complète
    const dernierePeriode = periodes[periodes.length - 1];
    if (dernierePeriode && (!dernierePeriode.debut || !dernierePeriode.fin || !dernierePeriode.taux)) {
      alert("Veuillez compléter la période en cours avant d'en ajouter une nouvelle.");
      return;
    }
    setPeriodes([...periodes, { debut: '', fin: '', taux: '100' }]);
  };

  const handlePeriodeChange = (index, field, value) => {
    const newPeriodes = [...periodes];
    newPeriodes[index][field] = value;
    setPeriodes(newPeriodes);
  };



  // const onCalcul = () => {
  //   // Validation des données
  //   if (accident.type_accident === 'DC') {
  //     if (accident.convention_assuralia) {
  //       if (!dateDebut || !dateFin) {
  //         alert("Veuillez saisir les dates de début et de fin.");
  //         return;
  //       }
  //     } else {
  //       if (periodes.length === 0) {
  //         alert("Veuillez ajouter au moins une période.");
  //         return;
  //       }
  //     }
  //   } else {
  //     // Pour les AT ou autres
  //     if (!dateDebut || !dateFin) {
  //       alert("Veuillez sélectionner une période de calcul.");
  //       return;
  //     }
  //   }

  //   const donneesSpecifiques = {
  //     date_debut: dateDebut,
  //     date_fin: dateFin,
  //     periodes: periodes.map(p => ({
  //       dateDebut: p.debut,
  //       dateFin: p.fin,
  //       taux: p.taux
  //     })),
  //   };



  //   handleCalcul(donneesSpecifiques);
  // };

  const onCalcul = () => {
    // Validation des données
    if (accident.type_accident === 'DC' && !accident.convention_assuralia) {
      // DC sans Assuralia
      if (periodes.length === 0) {
        alert("Veuillez ajouter au moins une période.");
        return;
      }
      // Vérifier que toutes les périodes sont complètes
      for (let i = 0; i < periodes.length; i++) {
        const periode = periodes[i];
        if (!periode.debut || !periode.fin || !periode.taux) {
          alert(`Veuillez compléter toutes les informations pour la période ${i + 1}.`);
          return;
        }
      }
      // Construire les données spécifiques
      const donneesSpecifiques = {
        periodes: periodes.map(p => ({
          dateDebut: p.debut,
          dateFin: p.fin,
          taux: p.taux
        })),
      };
      handleCalcul(donneesSpecifiques);
    } else {
      // DC avec Assuralia ou AT
      if (!dateDebut || !dateFin) {
        alert("Veuillez saisir les dates de début et de fin.");
        return;
      }
      // Construire les données spécifiques
      const donneesSpecifiques = {
        date_debut: dateDebut,
        date_fin: dateFin,
      };
      handleCalcul(donneesSpecifiques);
    }
  };
  
  return (
    <>
      {accident.type_accident === 'DC' && !accident.convention_assuralia && (
        <div>
          <h3>Périodes d'ITT avec taux (Dégressivité)</h3>
          {periodes.map((periode, index) => (
            <div key={index}>
              <label>
                Date début:
                <input
                  type="date"
                  value={periode.debut}
                  onChange={(e) => handlePeriodeChange(index, 'debut', e.target.value)}
                />
              </label>
              <label>
                Date fin:
                <input
                  type="date"
                  value={periode.fin}
                  onChange={(e) => handlePeriodeChange(index, 'fin', e.target.value)}
                />
              </label>
              <label>
                Taux applicable (%):
                <input
                  type="number"
                  value={periode.taux}
                  onChange={(e) => handlePeriodeChange(index, 'taux', e.target.value)}
                />
              </label>
            </div>
          ))}
          <button onClick={ajouterPeriode}>Ajouter une période</button>
        </div>
      )}

      {(accident.type_accident === 'DC' && accident.convention_assuralia) || accident.type_accident === 'AT' ? (
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
      ) : null}

      <button onClick={onCalcul}>Calculer</button>
    </>
  );
}

export default RecapitulatifAuto;

//   return (
//     <>
//       {accident.type_accident === 'DC' && !accident.convention_assuralia && (
//         <div>
//           <h3>Périodes d'ITT avec taux (Dégressivité)</h3>
//           {periodes.map((periode, index) => (
//             <div key={index}>
//               <label>
//                 Date début:
//                 <input
//                   type="date"
//                   value={periode.debut}
//                   onChange={(e) => handlePeriodeChange(index, 'debut', e.target.value)}
//                 />
//               </label>
//               <label>
//                 Date fin:
//                 <input
//                   type="date"
//                   value={periode.fin}
//                   onChange={(e) => handlePeriodeChange(index, 'fin', e.target.value)}
//                 />
//               </label>
//               <label>
//                 Taux applicable (%):
//                 <input
//                   type="number"
//                   value={periode.taux}
//                   onChange={(e) => handlePeriodeChange(index, 'taux', e.target.value)}
//                 />
//               </label>
//             </div>
//           ))}
//           <button onClick={ajouterPeriode}>Ajouter une période</button>
//         </div>
//       )}

//       {((accident.type_accident === 'DC' && accident.convention_assuralia) || accident.type_accident === 'AT') && (
//         <div>
//           <h3>Période de calcul souhaitée</h3>
//           <div>
//             <label>
//               Date de début:
//               <input
//                 type="date"
//                 value={dateDebut}
//                 onChange={(e) => setDateDebut(e.target.value)}
//                 required
//               />
//             </label>
//           </div>
//           <div>
//             <label>
//               Date de fin:
//               <input
//                 type="date"
//                 value={dateFin}
//                 onChange={(e) => setDateFin(e.target.value)}
//                 required
//               />
//             </label>
//           </div>
//         </div>
//       )}

//       <button onClick={onCalcul}>Calculer</button>
//     </>
//   );
// }

// export default RecapitulatifAuto;

// //   return (
// //     <>
// //       <h3>Période de calcul souhaitée</h3>
// //       <div>
// //         <label>
// //           Date de début:
// //           <input
// //             type="date"
// //             value={dateDebut}
// //             onChange={(e) => setDateDebut(e.target.value)}
// //             required
// //           />
// //         </label>
// //       </div>
// //       <div>
// //         <label>
// //           Date de fin:
// //           <input
// //             type="date"
// //             value={dateFin}
// //             onChange={(e) => setDateFin(e.target.value)}
// //             required
// //           />
// //         </label>
// //       </div>

// //       <button onClick={() => onCalcul('standard')}>Réclamation Standard</button>
// //       <button onClick={() => onCalcul('personnalisee')}>Réclamation Personnalisée</button>
// //     </>
// //   );
// // }

// // export default RecapitulatifAuto;

//   // const onCalcul = (typeReclamation) => {
//   //   if (!dateDebut || !dateFin) {
//   //     alert("Veuillez sélectionner une période de calcul.");
//   //     return;
//   //   }

//   //   if (dateDebut > dateFin) {
//   //     alert("La date de début ne peut pas être postérieure à la date de fin.");
//   //     return;
//   //   }





//       // handleCalcul({
//     //   date_debut: dateDebut,
//     //   date_fin: dateFin,
//     //   type_reclamation: typeReclamation,
//     // });