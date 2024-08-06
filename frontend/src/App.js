import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import Home from './Home';
import Layout from './components/Layout';
import Login from './components/Login';
import axios from 'axios';

axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const checkAuthStatus = async () => {
      try {
        const response = await axios.get('/api/auth-status/');  
        //Débogage
        console.log("Auth status:", response.data);
        setIsAuthenticated(response.data.isAuthenticated);
      } catch (error) {
        console.error('Erreur lors de la vérification du statut d\'authentification', error);
        setIsAuthenticated(false);
      } finally {
        setIsLoading(false);
      }
    };

    checkAuthStatus();
  }, []);

  if (isLoading) {
    return <div>Chargement...</div>;
  }

  return (
    <Layout setIsAuthenticated={setIsAuthenticated} isAuthenticated={isAuthenticated}>
      {isAuthenticated ? <Home /> : <Login setIsAuthenticated={setIsAuthenticated} />}
    </Layout>
  );
}

export default App;
