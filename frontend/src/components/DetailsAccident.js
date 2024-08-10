import React from 'react';

function DetailsAccident({ setEtape, setDateAccident }) {
  const handleSubmit = (e) => {
    e.preventDefault();
    setDateAccident(e.target.dateAccident.value);
    setEtape('choixReclamation');
  };

  return (
    <form onSubmit={handleSubmit}>
      <input 
        type="date" 
        name="dateAccident"
        required
      />
      <button type="submit">Suivant</button>
    </form>
  );
}

export default DetailsAccident;