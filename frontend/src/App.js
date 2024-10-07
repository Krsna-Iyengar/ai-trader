import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import SignUp from './SignUp.js';  // Import the SignUp component
import Login from './Login.js';
import Header from './Header.js';
import ProtectedRoute from './ProtectedRoute';
import Dashboard from './Dashboard';
import Account from './Account';  
import Advisor from './Advisor.js';
import Game from './Game.js'
import './App.css';  // Custom CSS

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('userData');
    setIsLoggedIn(false);
  };

  const [darkMode, setDarkMode] = useState(false);

  const toggleDarkMode = () => {
    console.log("Toggling dark mode");  // Debugging log
    setDarkMode(!darkMode);
  };

  return (
    <Router>
      <div className={`App ${darkMode ? 'dark-mode' : ''}`}>     
        
        <Header isLoggedIn={isLoggedIn} handleLogout={handleLogout} darkMode={darkMode} toggleDarkMode={toggleDarkMode} className="header"/>

        <Routes>
          <Route path="/signup" element={<SignUp darkMode={darkMode}/>} />
          <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} darkMode={darkMode}/>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard darkMode={darkMode}/></ProtectedRoute>} />
          <Route path="/account" element={<ProtectedRoute><Account darkMode={darkMode}/></ProtectedRoute>} />
          <Route path="/advisor" element={<ProtectedRoute><Advisor darkMode={darkMode}/></ProtectedRoute>} />
          <Route path="/game" element={<ProtectedRoute><Game darkMode={darkMode}/></ProtectedRoute>} />
        </Routes>

          {/* Hero Section */}
          <section className={`hero-section d-flex align-items-center justify-content-center text-center ${darkMode ? 'dark-mode' : ''}`}>
            <div>
              <h1>Welcome to AI Trader</h1>
              <p>Your gateway to AI-driven market insights and trading strategies.</p>
            </div>
          </section>

            {/* Features Section */}
            <section className={`features-section container ${darkMode ? 'dark-mode' : ''}`}>
              <div className="row text-center">
                <div className="col-md-4">
                  <h3>Real-Time Market Data</h3>
                  <p>Stay updated with the latest stock prices and trends in real-time.</p>
                </div>
                <div className="col-md-4">
                  <h3>AI-Driven Insights</h3>
                  <p>Utilize artificial intelligence for market sentiment analysis and trade recommendations.</p>
                </div>
                <div className="col-md-4">
                  <h3>Portfolio Management</h3>
                  <p>Track and manage your portfolio with personalized performance metrics.</p>
                </div>
              </div>
            </section>

              {/* Footer */}
              <footer className="footer bg-dark text-white text-center">
                <p>AI Trader &copy; 2024 | Contact me: <br></br>
                Badri Narayana Tulsi Ram Iyengar <br></br>
                aka <br></br>
                Krsna<br></br> 
                Krsna.Iyengar@gmail.com</p>
              </footer>
      </div>
    </Router>
  );
  
}

export default App;
