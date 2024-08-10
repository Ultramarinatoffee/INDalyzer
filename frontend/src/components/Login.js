import React, { useState, useEffect } from 'react';
import axios from 'axios';



const Login = ({ setIsAuthenticated }) => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');


  useEffect(() => {
    // Configurez axios pour inclure le token CSRF dans toutes les requêtes
    axios.defaults.xsrfCookieName = 'csrftoken';
    axios.defaults.xsrfHeaderName = 'X-CSRFToken';
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    try {
      const response = await axios.post('/api/login/', { username, password });
      if (response.data.success) {
        setIsAuthenticated(true);
        // Optionnel : redirection ou autre action après connexion réussie
        // window.location.href = '/';
      } else {
        setError('Échec de la connexion. Veuillez vérifier vos identifiants.');
      }
    } catch (error) {
      console.error('Erreur de connexion', error);
      setError('Une erreur s\'est produite lors de la connexion. Veuillez réessayer.');
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      {error && <div style={{ color: 'red' }}>{error}</div>}
      <div>
        <label htmlFor="username">Nom d'utilisateur:</label>
        <input
          type="text"
          id="username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          required
        />
      </div>
      <div>
        <label htmlFor="password">Mot de passe:</label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
      </div>
      <button type="submit">Se connecter</button>
    </form>
  );
};

export default Login;