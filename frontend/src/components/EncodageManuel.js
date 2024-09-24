import React, { useState, useEffect } from 'react';
import axios from 'axios'; 
import { formaterDatePourBackend } from '../utils';

function EncodageManuel({ setEtape, setAffilie, setAccident }) {
  const [formData, setFormData] = useState({

    
    nom: '',
    prenom: '',
    numero_registre_national: '',
    typeAccident: '',
    dateAccident: '',
    date_naissance: '',
    salaireBase: '',
    dateConsolidation: '',
    tauxIPP: '',
    statutChomage: '',
    isAssuralia: false,
    typeCalcul: ''
  });
  

  const [showAccidentInfo, setShowAccidentInfo] = useState(false);
  const [showSpecificFields, setShowSpecificFields] = useState(false);
  const [showCalculFields, setShowCalculFields] = useState(false);
  

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prevData => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  useEffect(() => {
    const affilieInfoComplete = formData.nom && formData.prenom && formData.numero_registre_national;
    setShowAccidentInfo(affilieInfoComplete);

    const accidentInfoComplete = formData.typeAccident && formData.dateAccident;
    setShowSpecificFields(accidentInfoComplete);

    const calculTypeSelected = formData.typeCalcul !== '';
    setShowCalculFields(calculTypeSelected && formData.typeCalcul === 'IPP');
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    // const tempAffilieId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    // const tempAccidentId = `temp_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;


    try {
      // Étape 1 : Créer l'affilié
      const affilieResponse = await axios.post('/api/affilies/', {
        nom: formData.nom,
        prenom: formData.prenom,
        numero_registre_national: formData.numero_registre_national,
        // date_naissance: formData.date_naissance || null,

        date_naissance: formaterDatePourBackend(formData.date_naissance) || null,

        email: 'example@example.com', 
        est_temporaire: true
      });

      const affilieData = affilieResponse.data;
      setAffilie(affilieData);

      console.log("Affilié créé :", affilieData);

      // Étape 2 : Créer l'accident
      const accidentPayload = {
        affilie: affilieData.id,
        // date_accident: formData.dateAccident,

        date_accident: formaterDatePourBackend(formData.dateAccident),

        source_donnees: 'MANUEL',
        type_accident: formData.typeAccident,
        statut_chomage: formData.statutChomage || 'NON',
        convention_assuralia: formData.isAssuralia || false,
        salaire_base: formData.salaireBase || null,
        // date_consolidation: formData.dateConsolidation || null,

        date_consolidation: formaterDatePourBackend(formData.dateConsolidation) || null,
   

        taux_IPP: formData.tauxIPP || null,
        est_temporaire: true
      };

       console.log("Payload de l'accident :", accidentPayload);

      const accidentResponse = await axios.post('/api/accidents/', accidentPayload);
      const accidentData = accidentResponse.data;
      setAccident(accidentData);

      // Passer à l'étape suivante
      setEtape('recapitulatif', true);
    } catch (error) {
      console.error("Erreur lors de la création de l'affilié ou de l'accident :", error);
    
      if (error.response) {
        console.error('Erreur réponse:', error.response.data);
        alert(`Erreur lors de l'enregistrement : ${JSON.stringify(error.response.data)}`);
      } else {
        alert("Une erreur est survenue lors de l'enregistrement des informations. Veuillez réessayer.");
      }
    }
  };

    // const affilieData = {
    //   id: tempAffilieId,
    //   nom: formData.nom,
    //   prenom: formData.prenom,
    //   numero_registre_national: formData.numero_registre_national,
    //   date_naissance: formData.date_naissance,
    //   estTemporaire: true
    // };

    // const accidentData = {
    //   id: tempAccidentId,
    //   type: formData.typeAccident,
    //   date: formData.dateAccident,
    //   date_accident: formData.dateAccident,
    //   salaire_base: formData.typeAccident === 'AT' ? formData.salaireBase : undefined,
    //   date_consolidation: formData.dateConsolidation,
    //   taux_IPP: formData.tauxIPP,
    //   statut_chomage: formData.typeAccident === 'DC' ? formData.statutChomage : undefined,
    //   is_assuralia: formData.typeAccident === 'DC' ? formData.isAssuralia : undefined,
    //   type_calcul: formData.typeCalcul,
    //   estTemporaire: true,
    //   type_accident_display: formData.typeAccident === 'AT' ? 'Accident de Travail' : 'Droit Commun' 
    // };

   
    // setAffilie(affilieData);
    // setAccident(accidentData);
    // setEtape('recapitulatif', true);
  // };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Encodage Manuel</h2>
      
      <h3>Informations de l'affilié</h3>
      <div>
        <label htmlFor="nom">Nom :</label>
        <input 
          id="nom"
          type="text" 
          name="nom"
          value={formData.nom} 
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="prenom">Prénom :</label>
        <input 
          id="prenom"
          type="text" 
          name="prenom"
          value={formData.prenom} 
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="numero_registre_national">Numéro de Registre National :</label>
        <input 
          id="numero_registre_national"
          type="text" 
          name="numero_registre_national"
          value={formData.numero_registre_national} 
          onChange={handleChange}
          required
        />
      </div>

      {showAccidentInfo && (
        <>
          <h3>Informations sur l'accident</h3>
          <div>
            <label htmlFor="typeAccident">Type d'accident :</label>
            <select 
              id="typeAccident"
              name="typeAccident"
              value={formData.typeAccident} 
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez le type d'accident</option>
              <option value="AT">Accident de Travail</option>
              <option value="DC">Droit Commun</option>
            </select>
          </div>
          <div>
            <label htmlFor="dateAccident">Date de l'accident :</label>
            <input 
              id="dateAccident"
              type="date" 
              name="dateAccident"
              value={formData.dateAccident} 
              onChange={handleChange}
              required
            />
          </div>
        </>
      )}

{showSpecificFields && (
        <>
          <h3>Type de calcul</h3>
          <div>
            <label htmlFor="typeCalcul">Choisissez le type de calcul :</label>
            <select 
              id="typeCalcul"
              name="typeCalcul"
              value={formData.typeCalcul} 
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez le type de calcul</option>
              <option value="ITT">ITT</option>
              <option value="IPP">IPP</option>
            </select>
          </div>
        </>
      )}

      {showCalculFields && (
        <>
          <h3>Informations supplémentaires pour IPP</h3>
          <div>
            <label htmlFor="salaireBase">Salaire de base (€) :</label>
            <input 
              id="salaireBase"
              type="number" 
              name="salaireBase"
              value={formData.salaireBase} 
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="dateConsolidation">Date de consolidation :</label>
            <input 
              id="dateConsolidation"
              type="date" 
              name="dateConsolidation"
              value={formData.dateConsolidation} 
              onChange={handleChange}
              required
            />
          </div>
          <div>
            <label htmlFor="tauxIPP">Taux IPP (%) :</label>
            <input 
              id="tauxIPP"
              type="number" 
              name="tauxIPP"
              value={formData.tauxIPP} 
              onChange={handleChange}
              required
            />
          </div>
        </>
      )}

      {showSpecificFields && formData.typeAccident === 'DC' && (
        <>
          <h3>Informations Droit Commun</h3>
          <div>
            <label htmlFor="statutChomage">Statut de chômage :</label>
            <select 
              id="statutChomage"
              name="statutChomage"
              value={formData.statutChomage} 
              onChange={handleChange}
              required
            >
              <option value="">Sélectionnez le statut de chômage</option>
              <option value="non">Non chômeur</option>
              <option value="occasionnel">Chômeur occasionnel</option>
              <option value="longue_duree">Chômeur de longue durée</option>
            </select>
          </div>
          <div>
            <label>
              <input 
                type="checkbox" 
                name="isAssuralia"
                checked={formData.isAssuralia} 
                onChange={handleChange} 
              />
              Appliquer la convention Assuralia
            </label>
          </div>
          {formData.isAssuralia && (
            <div>
              <label htmlFor="date_naissance">Date de naissance :</label>
              <input 
                id="date_naissance"
                type="date" 
                name="date_naissance"
                value={formData.date_naissance} 
                onChange={handleChange}
                required
              />
            </div>
          )}
        </>
      )}

      {showSpecificFields && (
        <button type="submit">Enregistrer</button>
      )}
    </form>
  );
}

export default EncodageManuel;