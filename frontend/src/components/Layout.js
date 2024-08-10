import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, setIsAuthenticated, isAuthenticated }) => (
  <div>
    <Header setIsAuthenticated={setIsAuthenticated} isAuthenticated={isAuthenticated} />
    <main>{children}</main>
    <Footer />
  </div>
);

export default Layout;