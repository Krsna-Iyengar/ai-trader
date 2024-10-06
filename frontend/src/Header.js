import React from 'react';
import { Link } from 'react-router-dom';
import logo from './assets/ai-trader.jpg';
import { Dropdown } from 'react-bootstrap';

function Header({ darkMode, toggleDarkMode, isLoggedIn, handleLogout }) {
  return (
    <header className={`navbar navbar-expand-lg ${darkMode ? 'dark-mode' : ''}`}>
      <div className="container-fluid d-flex justify-content-between align-items-center">
        <Link to="/" className="navbar-brand align-items-center">
          <img src={logo} alt="AI Trader" width="50" height="50" className="logo" />
          <h1 className="mb-0 ml-2">AI Trader</h1>
        </Link>
        <div className="header-buttons flexbox d-flex align-items-center">
          <button className="btn btn-outline-light" onClick={toggleDarkMode}>
            Switch to {darkMode ? 'Light' : 'Dark'} Mode
          </button>

          {!isLoggedIn ? (
            <div className="d-flex align-items-center">
              <Link to="/signup" className="btn btn-outline-primary mx-2">Sign Up</Link>
              <Link to="/login" className="btn btn-primary">Log In</Link>
            </div>
          ) : (
            <div className="d-flex align-items-center">
             
              <Dropdown className="mr-2">
                <Dropdown.Toggle variant="outline-light" id="dropdown-basic">
                  Menu
                </Dropdown.Toggle>

                <Dropdown.Menu>
                  <Dropdown.Item as={Link} to="/dashboard">Dashboard</Dropdown.Item>
                  <Dropdown.Item as={Link} to="/account">Account</Dropdown.Item>
                </Dropdown.Menu>
              </Dropdown>

              <button onClick={handleLogout} className="btn btn-danger">Log Out</button>
           </div>
          )}
        </div>
      </div>
    </header>
  );
}

export default Header;
