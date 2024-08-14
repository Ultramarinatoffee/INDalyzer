import React, { useState } from 'react';

function EncodageManuel({ setEtape, setAffilie }) {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [rn, setRN] = useState('');
  const [dateNaissance, setDateNaissance] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    // Au lieu de sauvegarder dans la base de données, nous stockons simplement dans l'état
    setAffilie({
      nom,
      prenom,
      numero_registre_national: rn,
      date_naissance: dateNaissance,
      estTemporaire: true // Indique que cet affilié n'est pas enregistré dans la BD
    });
    setEtape('detailsAccident');
  };

  return (
    <form onSubmit={handleSubmit}>
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
      <button type="submit">Suivant</button>
    </form>
  );
}

export default EncodageManuel;