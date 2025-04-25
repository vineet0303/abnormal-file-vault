// src/components/Register.js
import React, { useState } from 'react';
import axios from 'axios';

// Accept navigateToLogin function as a prop
function Register({ navigateToLogin }) { 
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [password2, setPassword2] = useState(''); // For password confirmation
  const [email, setEmail] = useState(''); // Optional email field
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');

    // Basic client-side password match validation
    if (password !== password2) {
      setError("Passwords do not match.");
      return;
    }
    // Basic client-side password length check (optional, backend does validation too)
    if (password.length < 8) {
        setError("Password must be at least 8 characters long.");
        return;
    }

    try {
      // --- CORRECTED URL CONSTRUCTION ---
      // Use template literal (backticks) to correctly insert the environment variable
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/api/vault/register/`;
      console.log("Attempting registration to:", apiUrl); // Optional: log for debugging

      // Make POST request to the backend registration endpoint
      const response = await axios.post(apiUrl, { 
        username: username,
        password: password,
        email: email, // Send email if collected
      });
      // --- END CORRECTION ---

      // Handle success (usually 201 Created)
      if (response.status === 201) {
        setSuccessMessage("Registration successful! Redirecting to login...");
        // Clear form 
        setUsername('');
        setPassword('');
        setPassword2('');
        setEmail('');
        // Automatically navigate to login after a short delay
        setTimeout(() => {
            if (navigateToLogin) navigateToLogin();
        }, 2000); // 2 second delay
      }
    } catch (err) {
      // Handle errors (e.g., username taken, password validation)
      console.error('Registration failed:', err);
      // Log the URL that was actually used in case of error
      console.error('Failed URL:', `${process.env.REACT_APP_API_BASE_URL}/api/vault/register/`); 
      if (err.response && err.response.data) {
        // Try to format backend errors nicely
        let errorMsg = '';
        for (const key in err.response.data) {
          // Join array messages, otherwise use the value directly
          errorMsg += `${key}: ${err.response.data[key].join ? err.response.data[key].join(', ') : err.response.data[key]} `;
        }
        setError(errorMsg.trim() || 'Registration failed.');
      } else if (err.request) {
          // The request was made but no response was received
          setError('Registration failed. Could not connect to the server. Is the backend running?');
      }
       else {
        setError('Registration failed. An unexpected error occurred.');
      }
    }
  };

  return (
    <div className="container-3d"> {/* Add container style */}
      <h2>Register New Account</h2>
      <form onSubmit={handleRegister}>
        <div>
          <label htmlFor="reg-username">Username:</label>
          <input
            type="text"
            id="reg-username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            required
          />
        </div>
        <div>
          <label htmlFor="reg-email">Email (Optional):</label>
          <input
            type="email"
            id="reg-email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />
        </div>
        <div>
          <label htmlFor="reg-password">Password:</label>
          <input
            type="password"
            id="reg-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength="8" // Match DRF setting if possible
          />
        </div>
         <div>
          <label htmlFor="reg-password2">Confirm Password:</label>
          <input
            type="password"
            id="reg-password2"
            value={password2}
            onChange={(e) => setPassword2(e.target.value)}
            required
            minLength="8"
          />
        </div>
        {/* Apply button style */}
        <div className="form-actions"> {/* Optional wrapper for centering */}
           <button type="submit" className="button-3d">Register</button>
        </div>
      </form>
      {/* Display error/success messages */}
      {error && <p className="error-message">{error}</p>}
      {successMessage && <p className="success-message">{successMessage}</p>}
      
      {/* Add button/link to switch to Login view */}
      <p style={{ textAlign: 'center', marginTop: '15px' }}>
        Already have an account?{' '}
        <button 
            type="button" 
            onClick={navigateToLogin} /* Use the prop passed from App.js */
            className="button-link-style" /* Use link style */
        >
          Login
        </button>
      </p>
    </div>
  );
}

export default Register;

