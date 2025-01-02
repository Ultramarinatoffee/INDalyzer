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
    // Contrôle que la dernière période soit complète
    const derniere = periodes[periodes.length - 1];
    if (derniere) {
      const { debut, fin, taux } = derniere;
      // Dans le cas "DC sans Assuralia" => taux requis
      // Dans le cas "DC avec Assuralia" ou AT => pas de taux
      // => On gère la condition
      if (!debut || !fin) {
        alert("Veuillez compléter la date de début et de fin de la dernière période.");
        return;
      }
      // Si c’est DC sans Assuralia, il faut un taux
      if (
        accident.type_accident === 'DC'
        && !accident.convention_assuralia
        && !taux
      ) {
        alert("Veuillez saisir un taux (%) pour la dernière période.");
        return;
      }
    }

    // On ajoute la nouvelle période
    setPeriodes([...periodes, { debut: '', fin: '', taux: '100' }]);
  };

  // Modification d’un champ d’une période
  const handlePeriodeChange = (index, field, value) => {
    const copie = [...periodes];
    copie[index][field] = value;
    setPeriodes(copie);
  };

  // Au clic sur "Calculer"
  const onCalcul = () => {
    if (accident.type_accident === 'DC' && !accident.convention_assuralia) {
      // BLOC 1 : DC sans Assuralia => On attend un tableau "periodes"
      if (periodes.length === 0) {
        alert("Veuillez ajouter au moins une période (DC sans Assuralia).");
        return;
      }
      // Vérif que chaque période est complète
      for (let i = 0; i < periodes.length; i++) {
        const { debut, fin, taux } = periodes[i];
        if (!debut || !fin || !taux) {
          alert(`Veuillez compléter toutes les infos pour la période #${i+1}.`);
          return;
        }
      }
      // Construit l’objet
      const donneesSpecifiques = {
        periodes: periodes.map(p => ({
          dateDebut: p.debut,
          dateFin:   p.fin,
          taux:      p.taux,
        })),
      };
      handleCalcul(donneesSpecifiques);

    } else {
      // BLOC 2 : DC avec Assuralia ou AT => On saisit TOUTES les périodes, mais sans "taux"
      //   OU on veut un "range" unique ? => Minimal change : vous vouliez plusieurs périodes
      //   alors on fait comme ci-dessous.

      if (periodes.length === 0) {
        // si vous désirez conserver un champ dateDebut/dateFin unique => on l’utilise
        // Mais vous disiez que vous vouliez "plusieurs périodes" => on fait la même mécanique
        alert("Veuillez ajouter au moins une période (AT ou DC avec Assuralia).");
        return;
      }
      // Contrôle
      for (let i = 0; i < periodes.length; i++) {
        const { debut, fin } = periodes[i];
        if (!debut || !fin) {
          alert(`Veuillez compléter les dates pour la période #${i+1}.`);
          return;
        }
      }

      // On n’envoie pas "taux" => ou on l’ignore
      const donneesSpecifiques = {
        periodes: periodes.map(p => ({
          dateDebut: p.debut,
          dateFin:   p.fin,
          // pas de dégressivité => on n’envoie pas "taux" ou on l’ignore
        })),
      };
      handleCalcul(donneesSpecifiques);
    }
  };

  return (
    <>
      {/* BLOC 1 : DC sans Assuralia => on affiche la case "taux (%)" */}
      {accident.type_accident === 'DC' && !accident.convention_assuralia && (
        <div>
          <h3>Périodes (DC sans Assuralia) avec taux (%)</h3>
          {periodes.map((periode, idx) => (
            <div key={idx}>
              <label>
                Date début:
                <input
                  type="date"
                  value={periode.debut}
                  onChange={(e) => handlePeriodeChange(idx, 'debut', e.target.value)}
                />
              </label>
              <label style={{ marginLeft: '10px' }}>
                Date fin:
                <input
                  type="date"
                  value={periode.fin}
                  onChange={(e) => handlePeriodeChange(idx, 'fin', e.target.value)}
                />
              </label>
              <label style={{ marginLeft: '10px' }}>
                Taux applicable (%):
                <input
                  type="number"
                  value={periode.taux}
                  onChange={(e) => handlePeriodeChange(idx, 'taux', e.target.value)}
                  style={{ width: '70px' }}
                />
              </label>
            </div>
          ))}
          <button onClick={ajouterPeriode}>Ajouter une période</button>
        </div>
      )}

      {/* BLOC 2 : DC avec Assuralia ou AT => on affiche plusieurs périodes
          mais pas de champ "taux (%)". */}
      {((accident.type_accident === 'DC' && accident.convention_assuralia)
        || accident.type_accident === 'AT') && (
        <div>
          <h3>
            Périodes ({accident.type_accident === 'AT' ? "Accident Travail" : "DC avec Assuralia"})
          </h3>
          {periodes.map((periode, idx) => (
            <div key={idx}>
              <label>
                Date début:
                <input
                  type="date"
                  value={periode.debut}
                  onChange={(e) => handlePeriodeChange(idx, 'debut', e.target.value)}
                />
              </label>
              <label style={{ marginLeft: '10px' }}>
                Date fin:
                <input
                  type="date"
                  value={periode.fin}
                  onChange={(e) => handlePeriodeChange(idx, 'fin', e.target.value)}
                />
              </label>
              {/* pas de champ "taux" */}
            </div>
          ))}
          <button onClick={ajouterPeriode}>Ajouter une période</button>
        </div>
      )}

      <br />
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