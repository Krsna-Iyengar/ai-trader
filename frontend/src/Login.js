import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

function Login({ setIsLoggedIn, darkMode }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();  // Initialize navigate

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/api/login', {
        email,
        password,
      });
  
      if (response.data) {
        const { token, user } = response.data;
        localStorage.setItem('token', token);
        localStorage.setItem('userData', JSON.stringify(user));
        setIsLoggedIn(true);
        navigate('/dashboard');
      }
    } catch (error) {
      setErrorMessage(error.response?.data?.message || 'Login failed');
    }
  };
  

  return (
    <div className={`sign-up-container mt-5 ${darkMode ? 'dark-mode' : ''}`}>
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
