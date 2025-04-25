// src/index.js
// This is the main entry point for the React application.

import React from 'react';
import ReactDOM from 'react-dom/client'; // Use createRoot for React 18+
import './index.css'; // Import global styles (optional, but common)
import App from './App'; // Import the main App component
import reportWebVitals from './reportWebVitals'; // For performance monitoring

// Get the root DOM element where the React app will be mounted
const rootElement = document.getElementById('root');
if (!rootElement) throw new Error('Failed to find the root element');

// Create a root instance using the new React 18 API
const root = ReactDOM.createRoot(rootElement);

// Render the main App component into the root element
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);

// If you want to start measuring performance in your app, pass a function
// to log results (for example: reportWebVitals(console.log))
// or send to an analytics endpoint. Learn more: https://bit.ly/CRA-vitals
reportWebVitals();


