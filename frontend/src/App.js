import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { BrowserRouter as Router, Route, Routes, Link, useNavigate } from 'react-router-dom';
import SignUp from './SignUp.js';  // Import the SignUp component
import Login from './Login';
import Header from './Header.js';
import ProtectedRoute from './ProtectedRoute';
import './App.css';  // Custom CSS
import logo from './assets/ai-trader.jpg';  // Add your logo image path

function App() {
  const [marketData, setMarketData] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Check if the user is logged in by looking for the JWT in localStorage
    useEffect(() => {
      const token = localStorage.getItem('token');
      if (token) {
        setIsLoggedIn(true);
      }
    }, []);

    const handleLogout = () => {
      localStorage.removeItem('token');  // Remove the JWT from localStorage
      setIsLoggedIn(false);  // Set logged-in state to false
    };
  

  useEffect(() => {
    // Fetch market data from the backend API
    const fetchData = async () => {
      try {
        const response = await axios.get('/api/market-data?symbol=AAPL');
        setMarketData(response.data);
      } catch (error) {
        console.error("Error fetching market data:", error);
      }
    };

    fetchData();
  }, []);

  const [isDarkMode, setIsDarkMode] = useState(() => {
    return localStorage.getItem('dark-mode') === 'true';
  });

  useEffect(() => {
    if (isDarkMode) {
      document.body.classList.add('dark-mode');
    } else {
      document.body.classList.remove('dark-mode');
    }
  }, [isDarkMode]);

  const toggleDarkMode = () => {
    setIsDarkMode(!isDarkMode);
    localStorage.setItem('dark-mode', !isDarkMode);
  };


  return (
    <Router>
    <div className="App">
      {/* Header with Dark Mode Toggle */}
      
      <Header isLoggedIn={isLoggedIn} handleLogout={handleLogout} />

      <Routes>
        <Route path="/signup" element={<SignUp />} />
        <Route path="/login" element={<Login setIsLoggedIn={setIsLoggedIn} />} />
        {/* Add other routes if needed */}
      </Routes>

      {/* Hero Section */}
      <section className={`hero-section ${isDarkMode ? 'dark-mode' : ''} d-flex align-items-center justify-content-center text-center`}>
        <div>
          <h1>Welcome to AI Trader</h1>
          <p>Your gateway to AI-driven market insights and trading strategies.</p>
        </div>
      </section>

      {/* Features Section */}
      <section className="features-section container">
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

{/*
      {marketData ? (
        <div>
          <h2>Market Data for AAPL</h2>
          <table>
            <thead>
              <tr>
                <th>Date</th>
                <th>Open</th>
                <th>High</th>
                <th>Low</th>
                <th>Close</th>
              </tr>
            </thead>
            <tbody>
              {Object.keys(marketData['Time Series (Daily)']).map(date => (
                <tr key={date}>
                  <td>{date}</td>
                  <td>{marketData['Time Series (Daily)'][date]['1. open']}</td>
                  <td>{marketData['Time Series (Daily)'][date]['2. high']}</td>
                  <td>{marketData['Time Series (Daily)'][date]['3. low']}</td>
                  <td>{marketData['Time Series (Daily)'][date]['4. close']}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ) : (
        <p>Loading market data...</p>
      )}*/}

       {/* Footer */}
       <footer className="footer bg-dark text-white text-center">
        <p>AI Trader &copy; 2024 | Contact me: Badri Narayana Tulsi Ram Iyengar aka Krsna: Krsna.Iyengar@gmail.com</p>
      </footer>
    
    </div>
    </Router>
  );
  
}

export default App;
