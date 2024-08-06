// src/components/Header.js
import React from 'react';
import axios from 'axios';

const Header = ({ setIsAuthenticated }) => {
  const handleLogout = async () => {
    try {
      await axios.post('/api/logout/');
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Erreur lors de la déconnexion', error);
    }
  };

  return (
    <header>
      <h1>INDalyzer</h1>
      <nav>
        {/* Ajoutez ici d'autres liens de navigation si nécessaire */}
      </nav>
      <button onClick={handleLogout}>Déconnexion</button>
    </header>
  );
};

export default Header;