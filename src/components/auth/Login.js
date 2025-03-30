import React, { useState } from 'react';
import {
  Box,
  TextField,
  Button,
  Typography,
  Paper,
  Grid,
  Link as MuiLink,
  Alert,
  CircularProgress
} from '@mui/material';
import { Link } from 'react-router-dom';
// import { supabase } from '../../index.js'; // Removed Supabase import

/**
 * Login component for user authentication
 * Handles email/password login with custom backend API
 */
const Login = (props) => { // Accept props
  const [email, setEmail] = useState('maximilian.kuchlbauer@gmail.com'); // Keep default for testing?
  const [password, setPassword] = useState('IloveJanu1!'); // Keep default for testing?
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [loggedInUserId, setLoggedInUserId] = useState(null); // State to hold user ID on success

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setLoading(true);
    setError(null);
    setLoggedInUserId(null); // Reset user ID state

    try {
      const response = await fetch('http://localhost:3002/api/login', { // Use backend API URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Throw an error with the message from the backend, or a default one
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      // Login successful
      console.log('Login successful:', data);
      setLoggedInUserId(data.userId); // Store the user ID locally in component state (optional)
      // Call the handler passed from App.js to update the global state
      if (props.onLoginSuccess) {
        props.onLoginSuccess({ id: data.userId }); // Pass user info up
      }
      // TODO: Navigation should be handled by App.js based on currentUser state change

    } catch (error) {
      console.error("Login error:", error);
      setError(error.message || 'An error occurred during login');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container justifyContent="center" sx={{ mt: 8 }}>
      <Grid item xs={12} sm={8} md={6} lg={4}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleLogin} sx={{ mt: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Log In
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {loggedInUserId && ( // Display success message for now
                <Alert severity="success" sx={{ mb: 2 }}>
                    Login successful! User ID: {loggedInUserId}
                </Alert>
            )}

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Log In'}
            </Button>

            <Grid container justifyContent="center">
              <Grid item>
                <Typography variant="body2" align="center">
                  Don't have an account?{' '}
                  <MuiLink component={Link} to="/register" variant="body2">
                    Sign Up
                  </MuiLink>
                </Typography>
              </Grid>
            </Grid>
          </Box>
        </Paper>
      </Grid>
    </Grid>
  );
};

export default Login;
