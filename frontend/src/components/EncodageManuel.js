import React, { useState } from 'react';

function EncodageManuel({ setEtape, setAffilie }) {
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');
  const [rn, setRN] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    setAffilie({ nom, prenom, numero_registre_national: rn });
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
      <button type="submit">Suivant</button>
    </form>
  );
}

export default EncodageManuel;