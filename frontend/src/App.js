// src/App.js
import React, { useState } from 'react'; // Import useState
import './App.css'; 
import Login from './components/Login'; // Ensure correct casing from your file
import Register from './components/Register'; // Import Register

function App() {
  // State to track which view to show: 'login' or 'register'
  const [currentView, setCurrentView] = useState('login'); 

  // Simple navigation functions
  const navigateToRegister = () => setCurrentView('register');
  const navigateToLogin = () => setCurrentView('login');

  return (
    <div className="App">
      <header className="App-header">
        <h1>Abnormal File Vault</h1>
      </header>
      <main>
        {/* Conditionally render Login or Register based on state */}
        {currentView === 'login' ? (
          // Pass the navigation function to Login
          <Login navigateToRegister={navigateToRegister} /> 
        ) : (
          // Pass the navigation function to Register
          <Register navigateToLogin={navigateToLogin} />
        )}
      </main>
      {/* Optional Footer */}
      {/* <footer> <p>&copy; 2025 Abnormal File Vault</p> </footer> */}
    </div>
  );
}

export default App;

