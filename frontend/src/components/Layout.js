import React from 'react';
import Header from './Header';
import Footer from './Footer';

const Layout = ({ children, setIsAuthenticated }) => (
  <div>
    <Header setIsAuthenticated={setIsAuthenticated} />
    <main>{children}</main>
    <Footer />
  </div>
);

export default Layout;