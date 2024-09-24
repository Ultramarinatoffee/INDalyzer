import React, { useState } from 'react';
// import { formaterDate } from '../utils';
import { formaterDate, formaterDatePourBackend } from '../utils';

function RecapitulatifManuel({ handleCalcul }) {
  const [periodes, setPeriodes] = useState([]);
  const [periodeActuelle, setPeriodeActuelle] = useState({ dateDebut: '', dateFin: '', nombreJours: '' });

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
  

  const onCalcul = (typeReclamation) => {
    if (periodes.length === 0) {
      alert("Veuillez ajouter au moins une période.");
      return;
    }

    const formattedPeriodes = periodes.map(p => ({
      dateDebut: formaterDatePourBackend(p.dateDebut),
      dateFin: formaterDatePourBackend(p.dateFin),
      nombreJours: parseInt(p.nombreJours, 10),
      debut: formaterDatePourBackend(p.dateDebut),
      fin: formaterDatePourBackend(p.dateFin)
    }));

    const dateDebut = formattedPeriodes.reduce((min, p) => p.dateDebut < min ? p.dateDebut : min, formattedPeriodes[0].dateDebut);
    const dateFin = formattedPeriodes.reduce((max, p) => p.dateFin > max ? p.dateFin : max, formattedPeriodes[0].dateFin);

    handleCalcul({
        date_debut: dateDebut,
        date_fin: dateFin,
        type_reclamation: typeReclamation,
        periodes: formattedPeriodes,
        is_manual_entry: true
    });
};


  //   const dateDebut = periodes.reduce((min, p) => p.dateDebut < min ? p.dateDebut : min, periodes[0].dateDebut);
  //   const dateFin = periodes.reduce((max, p) => p.dateFin > max ? p.dateFin : max, periodes[0].dateFin);
    
  
  //   handleCalcul({
  //     date_debut: dateDebut,  // Pas besoin de reformater ici, déjà au format YYYY-MM-DD
  //     date_fin: dateFin,      // Pas besoin de reformater ici, déjà au format YYYY-MM-DD
  //     type_reclamation: typeReclamation,
  //     periodes: periodes.map(p => ({   
  //       dateDebut: p.dateDebut,
  //       dateFin: p.dateFin,
  //       nombreJours: parseInt(p.nombreJours, 10), // Conversion en entier pour le backend
  //       debut: p.dateDebut,  // Compatibilité avec le backend
  //       fin: p.dateFin       // Compatibilité avec le backend
  //     })),
  //     is_manual_entry: true
      
  //   });
  // };
  // print("fin de if is manuel entry", data)

  //   handleCalcul({
  //     periodes: periodes,
  //     type_reclamation: typeReclamation,
  //   });
  // };

  return (
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

      <button onClick={() => onCalcul('standard')}>Réclamation Standard</button>
      <button onClick={() => onCalcul('personnalisee')}>Réclamation Personnalisée</button>
    </>
  );
}

export default RecapitulatifManuel;