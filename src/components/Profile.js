import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  TextField,
  Button,
  Paper,
  Grid,
  Alert,
  CircularProgress,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Divider,
  List,
  ListItem,
  ListItemText,
  ListItemIcon
} from '@mui/material';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import FastfoodIcon from '@mui/icons-material/Fastfood';
// import { supabase } from '../index.js'; // REMOVED Supabase import
import { Link } from 'react-router-dom';
import AddExerciseForm from './settings/AddExerciseForm'; // Import the new form
import ManageExercises from './settings/ManageExercises'; // Import the management component

/**
 * Profile component for viewing and updating user profile information
 * @param {Object} props - Component props
 * @param {Object} props.currentUser - Current user object (e.g., { id: userId })
 */
const Profile = ({ currentUser }) => { // Accept currentUser prop
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  // const [user, setUser] = useState(null); // No longer needed, use currentUser
  const [profile, setProfile] = useState({
    full_name: '',
    age: '',
    gender: '',
    height: '',
    fitness_goal: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [userEmail] = useState(''); // State to store email separately - Removed unused setUserEmail

  useEffect(() => {
    const getProfile = async () => {
      if (!currentUser || !currentUser.id) {
        setError('User not logged in.');
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userId = currentUser.id;

        // --- Fetch profile data from backend ---
        const response = await fetch(`http://localhost:3002/api/profiles/${userId}`);

        if (response.status === 404) {
          // Profile doesn't exist yet, keep default empty state
          console.log("Profile not found for user, using defaults.");
          // Optionally fetch email if needed, though it's not stored in profile table
          // For now, we'll leave email blank or get it from currentUser if passed differently
        } else if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        } else {
          const data = await response.json();
          if (data.data) {
            setProfile({
              full_name: data.data.full_name || '',
              age: data.data.age || '',
              gender: data.data.gender || '',
              height: data.data.height || '',
              fitness_goal: data.data.fitness_goal || ''
            });
          }
        }
        // TODO: Fetch user email separately if needed (e.g., from a /api/users/:userId endpoint)
        // setUserEmail(currentUser.email || 'Email not available'); // Assuming email might be in currentUser

      } catch (error) {
        console.error('Error loading profile:', error.message);
        setError(`Error loading profile data: ${error.message}`);
      } finally {
        setLoading(false);
      }
    };

    getProfile();
  }, [currentUser]); // Re-fetch if currentUser changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      // Convert empty string back to null for numeric fields if needed by backend/db
      [name]: (name === 'age' || name === 'height') && value === '' ? null : value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!currentUser || !currentUser.id) {
      setError('User not logged in.');
      return;
    }

    try {
      setUpdating(true);
      setError(null);
      setSuccess(false);
      const userId = currentUser.id;

      // --- Update profile data via backend ---
      const response = await fetch(`http://localhost:3002/api/profiles/${userId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              // Send only profile fields, not the whole currentUser object
              full_name: profile.full_name,
              age: profile.age || null, // Send null if empty
              gender: profile.gender || null,
              height: profile.height || null,
              fitness_goal: profile.fitness_goal || null
          })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const updatedData = await response.json();
      console.log("Profile update response:", updatedData); // Log response for debugging

      // Optionally update local state if backend returns the updated profile
      if (updatedData.data) {
           setProfile({
             full_name: updatedData.data.full_name || '',
             age: updatedData.data.age || '',
             gender: updatedData.data.gender || '',
             height: updatedData.data.height || '',
             fitness_goal: updatedData.data.fitness_goal || ''
           });
      }

      setSuccess(true);
    } catch (error) {
      console.error('Error updating profile:', error.message);
      setError(error.message || 'Error updating profile');
      setSuccess(false);
    } finally {
      setUpdating(false);
    }
  };

  // Callback for when a new exercise is added via the form
  // TODO: Implement logic to refresh common exercises list if needed
  const handleExerciseAdded = (newExercise) => {
    console.log("New exercise added:", newExercise);
    // Potentially trigger a refresh of the common exercises list used elsewhere
    // Maybe pass fetchExercises from ManageExercises down? Or use context.
  };


  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Profile
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          {/* Profile Update Form */}
          <Paper sx={{ p: 4 }}>
            {error && (
              <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
                {error}
              </Alert>
            )}

            {success && (
              <Alert severity="success" sx={{ mb: 3 }} onClose={() => setSuccess(false)}>
                Profile updated successfully!
              </Alert>
            )}

            <Grid container spacing={3} component="form" onSubmit={handleSubmit}>
              <Grid item xs={12}>
                <Typography variant="subtitle1" gutterBottom>
                  {/* Display email if available */}
                  Email: {userEmail || '(Email not loaded)'}
                </Typography>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  required
                  fullWidth
                  label="Full Name"
                  name="full_name"
                  value={profile.full_name}
                  onChange={handleChange}
                  disabled={updating}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Age"
                  name="age"
                  type="number"
                  value={profile.age ?? ''} // Use nullish coalescing for controlled input
                  onChange={handleChange}
                  disabled={updating}
                  inputProps={{ min: 0 }}
                />
              </Grid>

              <Grid item xs={12} sm={6}>
                <FormControl fullWidth>
                  <InputLabel id="gender-label">Gender</InputLabel>
                  <Select
                    labelId="gender-label"
                    id="gender"
                    name="gender"
                    value={profile.gender ?? ''} // Use nullish coalescing
                    label="Gender"
                    onChange={handleChange}
                    disabled={updating}
                  >
                    <MenuItem value=""><em>Prefer not to say</em></MenuItem>
                    <MenuItem value="male">Male</MenuItem>
                    <MenuItem value="female">Female</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sm={6}>
                <TextField
                  fullWidth
                  label="Height (cm)"
                  name="height"
                  type="number"
                  value={profile.height ?? ''} // Use nullish coalescing
                  onChange={handleChange}
                  disabled={updating}
                  inputProps={{ min: 0, step: "0.1" }} // Allow decimals
                />
              </Grid>

              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="fitness-goal-label">Fitness Goal</InputLabel>
                  <Select
                    labelId="fitness-goal-label"
                    id="fitness_goal"
                    name="fitness_goal"
                    value={profile.fitness_goal ?? ''} // Use nullish coalescing
                    label="Fitness Goal"
                    onChange={handleChange}
                    disabled={updating}
                  >
                    <MenuItem value=""><em>None selected</em></MenuItem>
                    <MenuItem value="weight_loss">Weight Loss</MenuItem>
                    <MenuItem value="muscle_gain">Muscle Gain</MenuItem>
                    <MenuItem value="endurance">Endurance</MenuItem>
                    <MenuItem value="general_fitness">General Fitness</MenuItem>
                    <MenuItem value="strength">Strength</MenuItem>
                  </Select>
                </FormControl>
              </Grid>

              <Grid item xs={12} sx={{ mt: 2 }}>
                <Button
                  type="submit"
                  variant="contained"
                  disabled={updating || !currentUser} // Disable if not logged in
                  sx={{ mr: 2 }}
                >
                  {updating ? <CircularProgress size={24} /> : 'Update Profile'}
                </Button>
              </Grid>
            </Grid>
          </Paper>

          {/* Add Custom Exercise Form */}
          <AddExerciseForm onExerciseAdded={handleExerciseAdded} />

          {/* Manage Exercises List */}
          <ManageExercises />

        </Grid>

        {/* Templates and Personalization Section */}
        <Grid item xs={12} md={5}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Your Templates & Settings
              </Typography>
              <Divider sx={{ mb: 2 }} />

              <List disablePadding>
                <ListItem component={Link} to="/workout-templates" sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.1)' }
                }}>
                  <ListItemIcon>
                    <FitnessCenterIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Workout Templates"
                    secondary="Manage your workout routines"
                  />
                </ListItem>

                <ListItem component={Link} to="/meal-templates" sx={{
                  textDecoration: 'none',
                  color: 'inherit',
                  borderRadius: 1,
                  '&:hover': { bgcolor: 'rgba(33, 150, 243, 0.1)' }
                }}>
                  <ListItemIcon>
                    <FastfoodIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary="Meal Templates"
                    secondary="Manage your meal plans"
                  />
                </ListItem>
              </List>
            </CardContent>
            <CardActions>
              <Button
                component={Link}
                to="/workouts"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 1 }}
              >
                Log Workout
              </Button>
            </CardActions>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Profile;
