import React, { useState } from 'react';
import axios from 'axios';

function RechercheAffilie({ setEtape, setAffilie }) {
  const [rn, setRN] = useState('');
  const [numeroExterne, setNumeroExterne] = useState('');
  const [nom, setNom] = useState('');
  const [prenom, setPrenom] = useState('');

  const handleSearch = async (e) => {
    e.preventDefault();
    
    let query = '';
    if (rn) {
      query = `rn=${rn}`;
    } else if (numeroExterne) {
      query = `externe=${numeroExterne}`;
    } else if (nom && prenom) {
      query = `nom=${nom}&prenom=${prenom}`;
    } else {
      alert('Veuillez remplir au moins un critère de recherche');
      return;
    }

    try {
        const response = await axios.get(`/api/affilies/?${query}`);
        if (response.data.length > 0) {
          setAffilie(response.data[0]);
          setEtape('detailsAccident');
        } else {
          alert("Aucun affilié trouvé");
        }
      } catch (error) {
        console.error("Erreur lors de la recherche", error);
        alert("Une erreur s'est produite lors de la recherche");
      }
    };

  return (
    <div className="form-container">
      <form onSubmit={handleSearch}>
        <div className="form-field">
          <label>
            Numéro de Registre National:
            <input 
              type="text"
              value={rn}
              onChange={e => setRN(e.target.value)}
            />
          </label>
        </div>
        <div className="form-field">
          <label>
            Numéro Externe:
            <input 
              type="text"
              value={numeroExterne}
              onChange={e => setNumeroExterne(e.target.value)}
            />
          </label>
        </div>
        <div className="form-field">
          <label>
            Nom:
            <input 
              type="text"
              value={nom}
              onChange={e => setNom(e.target.value)}
            />
          </label>
        </div>
        <div className="form-field">
          <label>
            Prénom:
            <input 
              type="text"
              value={prenom}
              onChange={e => setPrenom(e.target.value)}
            />
          </label>
        </div>
        <div className="form-actions">
          <button type="submit">Rechercher</button>
          <button onClick={() => setEtape('encodageManuel')}>Encoder manuellement</button>
        </div>
      </form>
    </div>
  );
}





export default RechercheAffilie;
