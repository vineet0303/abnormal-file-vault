// src/components/Login.js
import React, { useState } from 'react';
import axios from 'axios'; // Import axios
import FileList from './FileList'; // Make sure casing matches the filename 'FileList.js'
import FileUpload from './FileUpload'; // Make sure casing matches the filename 'FileUpload.js'

// Accept navigateToRegister function as a prop
function Login({ navigateToRegister }) { 
  // State hooks for username, password, potential errors, and the token
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [token, setToken] = useState(localStorage.getItem('token') || null); // Check localStorage on load
  const [refreshKey, setRefreshKey] = useState(0); // State for refresh trigger

  // Callback function passed to FileUpload
  const handleUploadSuccess = () => {
    console.log("Upload success detected, triggering list refresh...");
    setRefreshKey(prevKey => prevKey + 1); // Increment key to force re-render of FileList
  };

  // --- Handler for form submission ---
  const handleLogin = async (e) => {
    e.preventDefault(); // Prevent default page reload on form submit
    setError(''); // Clear previous errors

    try {
      // --- CORRECTED URL CONSTRUCTION ---
      // Use template literal (backticks) to correctly insert the environment variable
      const apiUrl = `${process.env.REACT_APP_API_BASE_URL}/api/token-auth/`;
      console.log("Attempting login to:", apiUrl); // Add log to verify URL

      // Make POST request to Django token endpoint
      const response = await axios.post(apiUrl, { 
        username: username,
        password: password,
      });
      // --- END CORRECTION ---

      // --- Handle Success ---
      if (response.data.token) {
        const receivedToken = response.data.token;
        console.log('Login successful! Token:', receivedToken);
        setToken(receivedToken);
        // Store token in localStorage for persistence across page refreshes
        localStorage.setItem('token', receivedToken); 
        // Clear form fields on success
        setUsername('');
        setPassword('');
        // Trigger initial file list load by changing key (optional, FileList loads on mount anyway)
        setRefreshKey(prevKey => prevKey + 1); 
      }
    } catch (err) {
      // --- Handle Errors ---
      console.error('Login failed:', err);
      // Log the URL that was actually used in case of error
      console.error('Failed URL:', `${process.env.REACT_APP_API_BASE_URL}/api/token-auth/`); 
      if (err.response && err.response.data) {
        // Try to get specific error message from DRF (often in non_field_errors)
        // Use optional chaining and check for non_field_errors specifically
        const errorDetail = err.response.data.non_field_errors 
            ? err.response.data.non_field_errors.join(' ') 
            : JSON.stringify(err.response.data);
        setError(errorDetail || 'Login failed. Please check credentials.');
      } else if (err.request) {
          // The request was made but no response was received (network error, CORS, server down?)
          setError('Login failed. Could not connect to the server. Is the backend running?');
      }
       else {
        setError('Login failed. An unexpected error occurred.');
      }
      setToken(null);
      localStorage.removeItem('token'); // Clear token on failure
    }
  };

  // --- Handler for logout ---
  const handleLogout = () => {
      setToken(null);
      localStorage.removeItem('token');
      // No need to explicitly redirect, the component will re-render showing the login form
      console.log("Logged out.");
  }

  // --- Render Logic ---
  if (token) {
      // If logged in, show the main application view
      return (
          <div className="container-3d"> {/* Add container style */}
              <h2>Your Vault</h2>
              {/* Pass the callback function as a prop */}
              <FileUpload onUploadSuccess={handleUploadSuccess} /> 
              <hr />          
              {/* Add the key prop here to force re-mount on key change */}
              <FileList key={refreshKey} /> 
              <hr />
              {/* Apply button style to logout */}
              <div style={{ textAlign: 'center', marginTop: '20px' }}> {/* Center logout */}
                <button onClick={handleLogout} className="button-3d">Log Out</button>
              </div>
          </div>
      );
  }

  // If not logged in, show the login form
  return (
      <div className="container-3d"> {/* Add container style */}
        <h2>Login</h2>
        <form onSubmit={handleLogin}>
          <div>
            <label htmlFor="username">Username:</label>
            <input
              type="text"
              id="username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required 
            />
          </div>
          <div>
            <label htmlFor="password">Password:</label>
            <input
              type="password"
              id="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          {/* Apply button style */}
          <div className="form-actions"> {/* Optional wrapper for centering */}
             <button type="submit" className="button-3d">Log In</button>
          </div>
        </form>
        {/* Display error message */}
        {error && <p className="error-message">{error}</p>} 

        {/* Add button/link to switch to Register view */}
        <p style={{ textAlign: 'center', marginTop: '15px' }}>
          Need an account?{' '}
          <button 
            type="button" 
            onClick={navigateToRegister} /* Use the prop passed from App.js */
            className="button-link-style" /* Use link style */
          >
            Register
          </button>
        </p>
      </div>
  );
}

export default Login;

