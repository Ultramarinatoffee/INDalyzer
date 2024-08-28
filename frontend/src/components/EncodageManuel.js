import React, { useState } from 'react';

function EncodageManuel({ setEtape, setAffilie, setAccident }) {
  // États existants pour l'affilié
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [rn, setRN] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');

  // Nouveaux états pour l'accident
  const [typeAccident, setTypeAccident] = useState('');
  const [dateAccident, setDateAccident] = useState('');
  const [salaireBase, setSalaireBase] = useState('');
  const [tauxIPP, setTauxIPP] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Stockage des informations de l'affilié
    setAffilie({
      nom,
      prenom,
      numero_registre_national: rn,
      date_naissance: dateNaissance,
      estTemporaire: true // Indique que cet affilié n'est pas enregistré dans la BD
    });

    // Stockage des informations de l'accident
    setAccident({
      type: typeAccident,
      date: dateAccident,
      salaire_base: salaireBase,
      taux_IPP: tauxIPP,
      estTemporaire: true // Indique que cet accident n'est pas enregistré dans la BD
    });

    // Passage à l'étape suivante
    setEtape('recapitulatif');
  };

  return (
    <form onSubmit={handleSubmit}>
      <h3>Informations de l'affilié</h3>
      <input 
        type="text" 
        value={nom} 
        onChange={(e) => setNom(e.target.value)}
        placeholder="Nom"
        required
      />
      <input 
        type="text" 
        value={prenom} 
        onChange={(e) => setPrenom(e.target.value)}
        placeholder="Prénom"
        required
      />
      <input 
        type="text" 
        value={rn} 
        onChange={(e) => setRN(e.target.value)}
        placeholder="Numéro de Registre National"
        required
      />
      <input 
        type="date" 
        value={dateNaissance} 
        onChange={(e) => setDateNaissance(e.target.value)}
        required
      />

      <h3>Informations de l'accident</h3>
      <select 
        value={typeAccident} 
        onChange={(e) => setTypeAccident(e.target.value)}
        required
      >
        <option value="">Sélectionnez le type d'accident</option>
        <option value="AT">Accident de Travail</option>
        <option value="DC">Droit Commun</option>
      </select>
      <input 
        type="date" 
        value={dateAccident} 
        onChange={(e) => setDateAccident(e.target.value)}
        placeholder="Date de l'accident"
        required
      />
      <input 
        type="number" 
        value={salaireBase} 
        onChange={(e) => setSalaireBase(e.target.value)}
        placeholder="Salaire de base"
        required
      />
      <input 
        type="number" 
        value={tauxIPP} 
        onChange={(e) => setTauxIPP(e.target.value)}
        placeholder="Taux IPP"
        required
      />

      <button type="submit">Suivant</button>
    </form>
  );
}

export default EncodageManuel;