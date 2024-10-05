import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import logo from './assets/ai-trader.jpg';  // Add your logo image path


function Header({ isLoggedIn, handleLogout, darkMode, toggleDarkMode }) {
  return (
    <header className={`navbar navbar-expand-lg ${darkMode ? 'dark-mode' : ''}`}>
        <div className="container-fluid d-flex justify-content-between align-items-center">
          <Link to="/" className="navbar-brand align-items-center">
          <img src={logo} alt="AI Trader" width="50" height="50" className="logo"/>
            <h1 className="mb-0 ml-2">AI Trader</h1>  {/* Add margin for spacing */}
          </Link>
          <div className="header-buttons">

            <button className="btn btn-outline-light" onClick={toggleDarkMode}>
              Switch to {darkMode ? 'Light' : 'Dark'} Mode
              {/*{isDarkMode ? 'Light Mode' : 'Dark Mode'}*/}
            </button>
          
            {!isLoggedIn ? (
            <>
              <Link to="/signup" className="btn btn-outline-primary mx-2">Sign Up</Link>
              <Link to="/login" className="btn btn-primary">Log In</Link>
            </>
          ) : (
            <button onClick={handleLogout} className="btn btn-danger">Log Out</button>
          )}
          </div>
        </div>
      </header>
  );
}

export default Header;
