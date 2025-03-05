import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.js';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = 'https://rncvhaqzyxgzitovswvd.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InJuY3ZoYXF6eXhneml0b3Zzd3ZkIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDExODAwOTYsImV4cCI6MjA1Njc1NjA5Nn0.LZb_TouegOM-_u8CcQ_11ML1FHEEIDI0Q-XnJZgo95E';
export const supabase = createClient(supabaseUrl, supabaseKey);

const root = ReactDOM.createRoot(document.getElementById('root'));
root.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
