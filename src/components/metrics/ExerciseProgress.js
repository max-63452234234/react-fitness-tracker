import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  TextField,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow
} from '@mui/material';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider, DatePicker } from '@mui/x-date-pickers';
import { format, subMonths } from 'date-fns';
import { supabase } from '../../index.js';

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

/**
 * Exercise Progress component
 * Tracks and visualizes progress for individual exercises over time
 */
const ExerciseProgress = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  
  // Exercise data
  const [exerciseNames, setExerciseNames] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [exerciseHistory, setExerciseHistory] = useState([]);
  const [chartData, setChartData] = useState([]);
  
  // Form for adding progress
  const [date, setDate] = useState(new Date());
  const [weight, setWeight] = useState('');
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [notes, setNotes] = useState('');
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        
        // Fetch unique exercise names from both exercises and progress tables
        const { data: exercisesData, error: exercisesError } = await supabase
          .from('exercises')
          .select('name')
          .eq('user_id', user.id);
          
        if (exercisesError) throw exercisesError;
        
        const { data: progressData, error: progressError } = await supabase
          .from('exercise_progress')
          .select('exercise_name')
          .eq('user_id', user.id);
          
        if (progressError) throw progressError;
        
        // Combine and deduplicate exercise names
        const exerciseSet = new Set([
          ...(exercisesData || []).map(e => e.name),
          ...(progressData || []).map(e => e.exercise_name)
        ]);
        
        const uniqueExercises = Array.from(exerciseSet).sort();
        setExerciseNames(uniqueExercises);
        
        // If there are exercises, select the first one
        if (uniqueExercises.length > 0) {
          setSelectedExercise(uniqueExercises[0]);
        }
        
      } catch (error) {
        console.error('Error fetching exercise data:', error.message);
        setError('Failed to load exercise data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // When selected exercise changes, fetch history
  useEffect(() => {
    if (selectedExercise && userId) {
      fetchExerciseHistory(selectedExercise);
    }
  }, [selectedExercise, userId]);
  
  const fetchExerciseHistory = async (exerciseName) => {
    try {
      setLoading(true);
      
      // Get the last 6 months of data
      const sixMonthsAgo = subMonths(new Date(), 6).toISOString().split('T')[0];
      
      const { data, error } = await supabase
        .from('exercise_progress')
        .select('*')
        .eq('user_id', userId)
        .eq('exercise_name', exerciseName)
        .gte('date', sixMonthsAgo)
        .order('date', { ascending: true });
        
      if (error) throw error;
      
      setExerciseHistory(data || []);
      
      // Format data for chart
      const formattedData = (data || []).map(entry => ({
        date: format(new Date(entry.date), 'MM/dd'),
        weight: entry.weight,
        totalVolume: entry.weight * entry.sets * entry.reps
      }));
      
      setChartData(formattedData);
      
    } catch (error) {
      console.error('Error fetching exercise history:', error.message);
      setError('Failed to load exercise history. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleExerciseChange = (event) => {
    setSelectedExercise(event.target.value);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!selectedExercise || !sets || !reps) {
      setError('Please fill all required fields');
      return;
    }
    
    try {
      const formattedDate = format(date, 'yyyy-MM-dd');
      
      const { data, error } = await supabase
        .from('exercise_progress')
        .insert([{
          user_id: userId,
          exercise_name: selectedExercise,
          date: formattedDate,
          weight: weight ? parseFloat(weight) : null,
          sets: parseInt(sets),
          reps: parseInt(reps),
          notes: notes
        }])
        .select();
        
      if (error) throw error;
      
      // Reset form
      setWeight('');
      setSets('');
      setReps('');
      setNotes('');
      
      // Refresh data
      fetchExerciseHistory(selectedExercise);
      
    } catch (error) {
      console.error('Error saving exercise progress:', error.message);
      setError('Failed to save exercise progress. Please try again.');
    }
  };

  if (loading && exerciseNames.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Exercise Progress Tracker
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      <Grid container spacing={3}>
        {/* Exercise Selection */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Track Your Progress
            </Typography>
            
            {exerciseNames.length === 0 ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                No exercises found. Start logging workouts to track your progress.
              </Alert>
            ) : (
              <FormControl fullWidth margin="normal">
                <InputLabel id="exercise-select-label">Exercise</InputLabel>
                <Select
                  labelId="exercise-select-label"
                  id="exercise-select"
                  value={selectedExercise}
                  label="Exercise"
                  onChange={handleExerciseChange}
                >
                  {exerciseNames.map(name => (
                    <MenuItem key={name} value={name}>{name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
            
            <Divider sx={{ my: 3 }} />
            
            <Typography variant="h6" gutterBottom>
              Add Progress Entry
            </Typography>
            
            <form onSubmit={handleSubmit}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Date"
                  value={date}
                  onChange={(newDate) => setDate(newDate)}
                  renderInput={(params) => 
                    <TextField {...params} fullWidth margin="normal" required />
                  }
                  slotProps={{
                    textField: { fullWidth: true, margin: 'normal', required: true },
                  }}
                />
              </LocalizationProvider>
              
              <TextField
                fullWidth
                margin="normal"
                label="Weight (kg)"
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                InputProps={{ inputProps: { min: 0, step: 0.5 } }}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Sets"
                type="number"
                value={sets}
                onChange={(e) => setSets(e.target.value)}
                required
                InputProps={{ inputProps: { min: 1 } }}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Reps"
                type="number"
                value={reps}
                onChange={(e) => setReps(e.target.value)}
                required
                InputProps={{ inputProps: { min: 1 } }}
              />
              
              <TextField
                fullWidth
                margin="normal"
                label="Notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                multiline
                rows={2}
              />
              
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
              >
                Save Progress
              </Button>
            </form>
          </Paper>
        </Grid>
        
        {/* Progress Chart and History */}
        <Grid item xs={12} md={8}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Progress Chart
            </Typography>
            
            {chartData.length === 0 ? (
              <Alert severity="info">
                No data available. Add progress entries to see your improvement over time.
              </Alert>
            ) : (
              <Box sx={{ height: 300, mt: 2 }}>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis yAxisId="left" />
                    <YAxis yAxisId="right" orientation="right" />
                    <Tooltip />
                    <Legend />
                    <Line
                      yAxisId="left"
                      type="monotone"
                      dataKey="weight"
                      stroke="#8884d8"
                      name="Weight (kg)"
                      activeDot={{ r: 8 }}
                    />
                    <Line
                      yAxisId="right"
                      type="monotone"
                      dataKey="totalVolume"
                      stroke="#82ca9d"
                      name="Total Volume (kg)"
                    />
                  </LineChart>
                </ResponsiveContainer>
              </Box>
            )}
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Exercise History
            </Typography>
            
            {exerciseHistory.length === 0 ? (
              <Alert severity="info">
                No history available for this exercise.
              </Alert>
            ) : (
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Date</TableCell>
                      <TableCell>Weight (kg)</TableCell>
                      <TableCell>Sets</TableCell>
                      <TableCell>Reps</TableCell>
                      <TableCell>Total Volume</TableCell>
                      <TableCell>Notes</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {exerciseHistory.map((entry) => (
                      <TableRow key={entry.id}>
                        <TableCell>{format(new Date(entry.date), 'MMM dd, yyyy')}</TableCell>
                        <TableCell>{entry.weight || '-'}</TableCell>
                        <TableCell>{entry.sets}</TableCell>
                        <TableCell>{entry.reps}</TableCell>
                        <TableCell>
                          {entry.weight ? (entry.weight * entry.sets * entry.reps).toFixed(1) : '-'}
                        </TableCell>
                        <TableCell>{entry.notes || '-'}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            )}
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExerciseProgress;
