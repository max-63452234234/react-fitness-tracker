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
 * Registration component for new user sign up
 * Handles email/password registration with custom backend API
 */
const Register = () => {
  const [email, setEmail] = useState(''); // Clear default email
  const [password, setPassword] = useState(''); // Clear default password
  const [confirmPassword, setConfirmPassword] = useState(''); // Clear default password
  // Optional: Add state for fullName if you want to collect it here
  // const [fullName, setFullName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();

    // Form validation
    if (!email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    // Basic password strength check (can be enhanced)
    if (password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('http://localhost:3002/api/register', { // Use backend API URL
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Include fullName if collecting it: body: JSON.stringify({ email, password, fullName }),
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        // Throw an error with the message from the backend, or a default one
        throw new Error(data.error || `HTTP error! status: ${response.status}`);
      }

      // Registration successful
      console.log('Registration successful:', data);
      setSuccess(true);
      // Optionally clear form fields or redirect

    } catch (error) {
      console.error("Registration error:", error);
      setError(error.message || 'An error occurred during registration');
      setSuccess(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Grid container justifyContent="center" sx={{ mt: 8 }}>
      <Grid item xs={12} sm={8} md={6} lg={4}>
        <Paper elevation={3} sx={{ p: 4 }}>
          <Box component="form" onSubmit={handleRegister} sx={{ mt: 1 }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
              Register
            </Typography>

            {error && (
              <Alert severity="error" sx={{ mb: 2 }}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 2 }}>
                Registration successful! You can now log in.
                {/* Changed message as email confirmation isn't implemented */}
              </Alert>
            )}

            {/* Optional: Add TextField for Full Name here if needed */}
            {/*
            <TextField
              margin="normal"
              fullWidth
              id="fullName"
              label="Full Name"
              name="fullName"
              autoComplete="name"
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              disabled={loading || success}
            />
            */}

            <TextField
              margin="normal"
              required
              fullWidth
              id="email"
              label="Email Address"
              name="email"
              type="email" // Set type to email for better validation
              autoComplete="email"
              autoFocus
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={loading || success}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="password"
              label="Password"
              type="password"
              id="password"
              autoComplete="new-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={loading || success}
            />

            <TextField
              margin="normal"
              required
              fullWidth
              name="confirmPassword"
              label="Confirm Password"
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              disabled={loading || success}
            />

            <Button
              type="submit"
              fullWidth
              variant="contained"
              sx={{ mt: 3, mb: 2 }}
              disabled={loading || success}
            >
              {loading ? <CircularProgress size={24} /> : 'Register'}
            </Button>

            <Grid container justifyContent="center">
              <Grid item>
                <Typography variant="body2" align="center">
                  Already have an account?{' '}
                  <MuiLink component={Link} to="/login" variant="body2">
                    Log In
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

export default Register;
