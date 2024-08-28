import logo from './logo.svg';
import './App.css';
import React, { useState, useEffect } from 'react';
import Home from './Home';
import Layout from './components/Layout';
import Login from './components/Login';
import axios from 'axios';
// import CalculAT from './components/CalculAT';
import CalculPrestations from './components/CalculPrestations';


axios.defaults.xsrfCookieName = 'csrftoken';
axios.defaults.xsrfHeaderName = 'X-CSRFToken';


function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState('home');
  const [modeCalcul, setModeCalcul] = useState('');

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

  const renderPage = () => {
    if (!isAuthenticated) {
      return <Login setIsAuthenticated={setIsAuthenticated} />;
    }

    switch (currentPage) {
    //   case 'home':
    //     return <Home setCurrentPage={setCurrentPage} />;
    //   case 'calculAT':
    //     return <CalculAT />;
    //   case 'calculDC':
    //     return <div>Page de calcul DC</div>;
    //   default:
    //     return <Home setCurrentPage={setCurrentPage} />;
    // }
 
        case 'home':
          return <Home setCurrentPage={setCurrentPage} setModeCalcul={setModeCalcul} />;
        case 'rechercheAffilie':
          return <CalculPrestations modeCalcul="recherche" />;
        case 'encodageManuel':
          return <CalculPrestations modeCalcul="encodage" />;
        default:
          return <Home setCurrentPage={setCurrentPage} setModeCalcul={setModeCalcul} />;
      }
  };

  return (
    <Layout setIsAuthenticated={setIsAuthenticated} isAuthenticated={isAuthenticated}>
      {renderPage()}
    </Layout>
  );
  // return (
  //   <Layout setIsAuthenticated={setIsAuthenticated} isAuthenticated={isAuthenticated}>
  //     <Home setCurrentPage={setCurrentPage} setModeCalcul={setModeCalcul} />
  //   </Layout>
  // );

}

export default App;
