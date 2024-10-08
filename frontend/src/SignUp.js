import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';  // Import Axios for HTTP requests
import './SignUp.css';

function SignUp({ darkMode }) {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
  });

  const [errors, setErrors] = useState({
    nameInvalid: false,
    emailInvalid: false,
    passwordMismatch: false,
    invalidPassword: false,
  });

  const [successMessage, setSuccessMessage] = useState('');

  const navigate = useNavigate();  // Initialize the navigate function

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const validatePassword = (password) => {
    const regex = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$%^&*]).{8,}$/;
    return regex.test(password);  // Validates the password strength
  };

  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    const { name, email, password, confirmPassword } = formData;
  
    // Reset errors
    setErrors({
      nameInvalid: false,
      emailInvalid: false,
      passwordMismatch: false,
      invalidPassword: false,
    });
  
    // Check if name is valid (non-empty)
    if (name.trim() === '') {
      setErrors((prevErrors) => ({ ...prevErrors, nameInvalid: true }));
      return;
    }
  
    // Check if the email is valid
    if (!validateEmail(email)) {
      setErrors((prevErrors) => ({ ...prevErrors, emailInvalid: true }));
      return;
    }
  
    // Check if passwords match
    if (password !== confirmPassword) {
      setErrors((prevErrors) => ({ ...prevErrors, passwordMismatch: true }));
      return;
    }
  
    // Check if password meets the criteria
    if (!validatePassword(password)) {
      setErrors((prevErrors) => ({ ...prevErrors, invalidPassword: true }));
      return;
    }
  
    // Send the data to the backend API
    try {
      const response = await axios.post('/api/signup', {
        name,
        email,
        password,
      });
  
      // Check if response and response.data exist
      if (response.status === 201) {
        setSuccessMessage('Sign-up successful! Redirecting to login...');
        setTimeout(() => {
          navigate('/login'); // Redirect to the login page after 2 seconds
        }, 2000);
      }
    } catch (error) {
      console.error('Error during sign-up:', error.response?.data?.message || error.message);
    }
  };

  return (
    <div className={`sign-up-container mt-5 ${darkMode ? 'dark-mode' : ''}`}>
      <h2 className="text-center mb-4">Create Your Account</h2>
      {successMessage && <div className="alert alert-success">{successMessage}</div>}
      <form onSubmit={handleSubmit} className="p-4 border rounded shadow">
        <div className="form-group mb-3">
          <label>Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            className="form-control"
            placeholder="Enter your full name"
          />
        </div>
        
        <div className="form-group mb-3">
          <label>Email</label>
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            required
            className="form-control"
            placeholder="Enter your email"
          />
          {errors.emailInvalid && (
            <small className="text-danger">Please enter a valid email address.</small>
          )}
        </div>

        <div className="form-group mb-3">
          <label>Password</label>
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            required
            className="form-control"
            placeholder="Create a password"
          />
          {errors.invalidPassword && (
            <small className="text-danger">
              Password must contain at least 8 characters, including a capital letter, a number, and a symbol.
            </small>
          )}
        </div>

        <div className="form-group mb-4">
          <label>Confirm Password</label>
          <input
            type="password"
            name="confirmPassword"
            value={formData.confirmPassword}
            onChange={handleChange}
            required
            className="form-control"
            placeholder="Confirm your password"
          />
          {errors.passwordMismatch && (
            <small className="text-danger">Passwords do not match.</small>
          )}
        </div>

        <button type="submit" className="btn btn-primary w-100">Sign Up</button>
      </form>
    </div>
  );
}

export default SignUp;
