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
  MenuItem
} from '@mui/material';
import { supabase } from '../index.js';

/**
 * Profile component for viewing and updating user profile information
 */
const Profile = () => {
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState({
    full_name: '',
    age: '',
    gender: '',
    height: '',
    fitness_goal: ''
  });
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const getProfile = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          throw new Error('User not found');
        }
        
        setUser(user);
        
        // Get profile data
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
        
        if (error && error.code !== 'PGRST116') {
          throw error;
        }
        
        if (data) {
          setProfile({
            full_name: data.full_name || '',
            age: data.age || '',
            gender: data.gender || '',
            height: data.height || '',
            fitness_goal: data.fitness_goal || ''
          });
        }
      } catch (error) {
        console.error('Error loading profile:', error.message);
        setError('Error loading profile data');
      } finally {
        setLoading(false);
      }
    };
    
    getProfile();
  }, []);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setProfile({
      ...profile,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setUpdating(true);
      setError(null);
      setSuccess(false);
      
      if (!user) throw new Error('No user found');
      
      // Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('id', user.id)
        .single();
      
      let error;
      
      if (existingProfile) {
        // Update existing profile
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            full_name: profile.full_name,
            age: profile.age || null,
            gender: profile.gender || null,
            height: profile.height || null,
            fitness_goal: profile.fitness_goal || null,
            updated_at: new Date()
          })
          .eq('id', user.id);
          
        error = updateError;
      } else {
        // Insert new profile
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: user.id,
              full_name: profile.full_name,
              age: profile.age || null,
              gender: profile.gender || null,
              height: profile.height || null,
              fitness_goal: profile.fitness_goal || null,
              created_at: new Date(),
              updated_at: new Date()
            }
          ]);
          
        error = insertError;
      }
      
      if (error) throw error;
      
      setSuccess(true);
    } catch (error) {
      console.error('Error updating profile:', error.message);
      setError(error.message || 'Error updating profile');
      setSuccess(false);
    } finally {
      setUpdating(false);
    }
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
      
      <Paper sx={{ p: 4 }}>
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        {success && (
          <Alert severity="success" sx={{ mb: 3 }}>
            Profile updated successfully!
          </Alert>
        )}
        
        <Grid container spacing={3} component="form" onSubmit={handleSubmit}>
          <Grid item xs={12}>
            <Typography variant="subtitle1" gutterBottom>
              Email: {user?.email}
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
              value={profile.age}
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
                value={profile.gender}
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
              value={profile.height}
              onChange={handleChange}
              disabled={updating}
              inputProps={{ min: 0 }}
            />
          </Grid>
          
          <Grid item xs={12}>
            <FormControl fullWidth>
              <InputLabel id="fitness-goal-label">Fitness Goal</InputLabel>
              <Select
                labelId="fitness-goal-label"
                id="fitness_goal"
                name="fitness_goal"
                value={profile.fitness_goal}
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
              disabled={updating}
              sx={{ mr: 2 }}
            >
              {updating ? <CircularProgress size={24} /> : 'Update Profile'}
            </Button>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Profile;
