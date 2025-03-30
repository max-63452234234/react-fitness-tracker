import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
// No database client (Supabase or SQLite) needed here anymore.
// Backend handles the database connection.

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
