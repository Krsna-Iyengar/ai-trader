import React, { useState, useRef, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ setIsLoggedIn, darkMode }) {
  const [isDragging, setIsDragging] = useState(false);
  const containerRef = useRef(null);
  const [position, setPosition] = useState({ top: 0, left: 0 });
  const [offset, setOffset] = useState({ x: 0, y: 0 });

  // Center the container on the screen when it first loads
  //useEffect(() => {
    /*const container = containerRef.current;
    const screenWidth = window.innerWidth;
    const screenHeight = window.innerHeight;

    const containerWidth = container.offsetWidth;
    const containerHeight = container.offsetHeight;

    // Calculate center position
    const top = (screenHeight - containerHeight) / 2;
    const left = (screenWidth - containerWidth) / 2;

    // Set the initial position
    setPosition({ top, left });
  }, []);

  const handleMouseDown = (e) => {
    const container = containerRef.current;
    setIsDragging(true);
    setOffset({
      x: e.clientX - container.offsetLeft,
      y: e.clientY - container.offsetTop,
    });
  };

  const handleMouseMove = (e) => {
    if (!isDragging) return;
    setPosition({
      top: e.clientY - offset.y,
      left: e.clientX - offset.x,
    });
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };*/

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();  // Initialize navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Replace the localhost URL with the Heroku backend URL
      const response = await axios.post('https://my-ai-trader-api-3d8e6f662cb5.herokuapp.com/api/login', {
        email,
        password,
      });
  
      if (response.data) {
        const { token, user } = response.data;
        // Store token and user data in localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(user));
        setIsLoggedIn(true);
        // Redirect to the dashboard after successful login
        navigate('/dashboard');
      }
    } catch (error) {
      // Handle error and display the message
      setErrorMessage(error.response?.data?.message || 'Login failed');
    }
  };
  

  return (
    <div className={`sign-up-container mt-5 ${darkMode ? 'dark-mode' : ''}`}
    /*ref={containerRef}
      style={{
        position: 'absolute',
        top: `${position.top}px`,
        left: `${position.left}px`,
        cursor: isDragging ? 'grabbing' : 'grab',
      }}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
      onMouseLeave={handleMouseUp}
      */>
      <h2 className="text-center mb-4">Login</h2>
      {errorMessage && <div className="alert alert-danger">{errorMessage}</div>}
      <form onSubmit={handleSubmit} className="p-4 border rounded shadow">
        <div className="form-group mb-3">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="form-control"
            placeholder="Enter your email"
          />
        </div>
        <div className="form-group mb-4">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="form-control"
            placeholder="Enter your password"
          />
        </div>
        <button type="submit" className="btn btn-primary w-100">Log In</button>
      </form>
    </div>
  );
}

export default Login;
