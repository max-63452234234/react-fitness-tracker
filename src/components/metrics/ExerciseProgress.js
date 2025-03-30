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
import { format } from 'date-fns'; // Removed subMonths
// import { supabase } from '../../index.js'; // REMOVED Supabase import

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
 * @param {Object} props - Component props
 * @param {Object} props.currentUser - Current user object (e.g., { id: userId })
 */
const ExerciseProgress = ({ currentUser }) => { // Accept currentUser prop
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [userId, setUserId] = useState(null); // Use currentUser.id

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

  // Fetch initial list of unique exercise names
  useEffect(() => {
    const fetchExerciseNames = async () => {
      if (!currentUser || !currentUser.id) {
        console.log("ExerciseProgress: No current user found.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const userId = currentUser.id;

        // --- Fetch unique exercise names from backend ---
        const response = await fetch(`http://localhost:3002/api/exercises/names?userId=${userId}`); // Use new endpoint
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const uniqueExercises = data.data || [];
        setExerciseNames(uniqueExercises);

        // If there are exercises, select the first one by default
        if (uniqueExercises.length > 0 && !selectedExercise) {
          setSelectedExercise(uniqueExercises[0]);
        } else if (uniqueExercises.length === 0) {
            // If no exercises, stop loading
            setLoading(false);
        }

      } catch (error) {
        console.error('Error fetching exercise names:', error.message);
        setError(`Failed to load exercise names: ${error.message}. Please try again.`);
        setExerciseNames([]);
        setLoading(false); // Stop loading on error
      }
      // Loading state will be handled by the history fetch useEffect
    };

    fetchExerciseNames();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [currentUser]); // Refetch if user changes

  // Fetch history when selected exercise changes
  useEffect(() => {
    const fetchExerciseHistory = async (exerciseName) => {
       if (!currentUser || !currentUser.id || !exerciseName) {
           setExerciseHistory([]);
           setChartData([]);
           setLoading(false); // Ensure loading stops if no exercise selected
           return;
       }
      try {
        setLoading(true); // Set loading true when fetching history
        setError(null);
        const userId = currentUser.id;

        // --- Fetch exercise history from backend ---
        const response = await fetch(`http://localhost:3002/api/exercise-progress?userId=${userId}&exerciseName=${encodeURIComponent(exerciseName)}`); // Use correct endpoint
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const historyEntries = data.data || [];
        setExerciseHistory(historyEntries);

        // Format data for chart
        const formattedData = historyEntries.map(entry => ({
          date: format(new Date(entry.date + 'T00:00:00'), 'MM/dd'), // Add time to avoid timezone issues
          weight: entry.weight,
          totalVolume: entry.weight && entry.sets && entry.reps ? (entry.weight * entry.sets * entry.reps) : 0
        }));
        setChartData(formattedData);

      } catch (error) {
        console.error('Error fetching exercise history:', error.message);
        setError(`Failed to load history for ${exerciseName}: ${error.message}.`);
        setExerciseHistory([]);
        setChartData([]);
      } finally {
        setLoading(false);
      }
    };

    if (selectedExercise) {
      fetchExerciseHistory(selectedExercise);
    } else {
        // Clear history if no exercise is selected
        setExerciseHistory([]);
        setChartData([]);
        setLoading(false); // Stop loading if no exercise selected
    }
  }, [selectedExercise, currentUser]); // Refetch if selectedExercise or user changes

  const handleExerciseChange = (event) => {
    setSelectedExercise(event.target.value);
  };

  // Handle saving new progress entry
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!currentUser?.id) {
        setError('User not logged in.');
        return;
    }
    if (!selectedExercise || !sets || !reps) {
      setError('Please select an exercise and fill required fields (Sets, Reps)');
      return;
    }

    const progressData = {
        userId: currentUser.id,
        exercise_name: selectedExercise,
        date: format(date, 'yyyy-MM-dd'), // Format date correctly
        weight: weight ? parseFloat(weight) : null,
        sets: parseInt(sets),
        reps: parseInt(reps),
        notes: notes
    };

    try {
      // --- Save progress entry via backend API ---
      const response = await fetch(`http://localhost:3002/api/exercise-progress`, { // Use correct endpoint
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(progressData)
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      await response.json(); // Consume response body but don't store unused variable

      // Reset form
      setWeight('');
      setSets('');
      setReps('');
      setNotes('');
      setDate(new Date()); // Reset date picker to today

      // Add new entry to history and chart data (optimistic update or refetch)
      // Refetching is simpler for now to ensure chart data is correct
      if (selectedExercise) {
          // Trigger refetch by changing selectedExercise temporarily (or use a dedicated refetch function)
          const currentSelection = selectedExercise;
          setSelectedExercise(''); // Clear selection briefly
          // Use a small timeout to ensure state update cycle completes before re-selecting
          setTimeout(() => setSelectedExercise(currentSelection), 10);
      }


    } catch (error) {
      console.error('Error saving exercise progress:', error.message);
      setError(`Failed to save exercise progress: ${error.message}. Please try again.`);
    }
  };

  // Initial loading state check
  if (loading && exerciseNames.length === 0 && !selectedExercise) {
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
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      <Grid container spacing={3}>
        {/* Exercise Selection & Add Form */}
        <Grid item xs={12} md={4}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>
              Track Your Progress
            </Typography>

            {exerciseNames.length === 0 && !loading ? (
              <Alert severity="info" sx={{ mt: 2 }}>
                No exercises found. Start logging workouts to track your progress.
              </Alert>
            ) : (
              <FormControl fullWidth margin="normal" disabled={loading}>
                <InputLabel id="exercise-select-label">Select Exercise</InputLabel>
                <Select
                  labelId="exercise-select-label"
                  id="exercise-select"
                  value={selectedExercise}
                  label="Select Exercise"
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
                  onChange={(newDate) => setDate(newDate || new Date())} // Ensure date is not null
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
                InputProps={{ inputProps: { min: 0, step: 0.1 } }} // Allow decimals
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
                disabled={!selectedExercise || loading || !currentUser} // Disable if no exercise selected or loading/logged out
              >
                Save Progress
              </Button>
            </form>
          </Paper>
        </Grid>

        {/* Progress Chart and History */}
        <Grid item xs={12} md={8}>
          {loading && selectedExercise && ( // Show loading indicator only when fetching history
               <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
                   <CircularProgress />
               </Box>
          )}
          {!loading && selectedExercise && (
            <>
              <Paper sx={{ p: 3, mb: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Progress Chart for {selectedExercise}
                </Typography>

                {chartData.length === 0 ? (
                  <Alert severity="info">
                    No data available for {selectedExercise}. Add progress entries to see your improvement.
                  </Alert>
                ) : (
                  <Box sx={{ height: 300, mt: 2 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis yAxisId="left" domain={['auto', 'auto']} />
                        <YAxis yAxisId="right" orientation="right" domain={['auto', 'auto']} />
                        <Tooltip />
                        <Legend />
                        <Line
                          yAxisId="left"
                          type="monotone"
                          dataKey="weight"
                          stroke="#8884d8"
                          name="Weight (kg)"
                          activeDot={{ r: 8 }}
                          connectNulls // Connect line over missing data points
                        />
                        <Line
                          yAxisId="right"
                          type="monotone"
                          dataKey="totalVolume"
                          stroke="#82ca9d"
                          name="Total Volume (kg)"
                          connectNulls
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </Box>
                )}
              </Paper>

              <Paper sx={{ p: 3 }}>
                <Typography variant="h6" gutterBottom>
                  History for {selectedExercise}
                </Typography>

                {exerciseHistory.length === 0 ? (
                  <Alert severity="info">
                    No history available for this exercise.
                  </Alert>
                ) : (
                  <TableContainer>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Date</TableCell>
                          <TableCell>Weight (kg)</TableCell>
                          <TableCell>Sets</TableCell>
                          <TableCell>Reps</TableCell>
                          <TableCell>Total Volume</TableCell>
                          <TableCell>Notes</TableCell>
                          {/* TODO: Add Delete Action */}
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {/* Display history sorted by date descending */}
                        {exerciseHistory.sort((a, b) => new Date(b.date) - new Date(a.date)).map((entry) => (
                          <TableRow key={entry.id}>
                            <TableCell>{format(new Date(entry.date + 'T00:00:00'), 'MMM dd, yyyy')}</TableCell>
                            <TableCell>{entry.weight ?? '-'}</TableCell>
                            <TableCell>{entry.sets}</TableCell>
                            <TableCell>{entry.reps}</TableCell>
                            <TableCell>
                              {entry.weight && entry.sets && entry.reps ? (entry.weight * entry.sets * entry.reps).toFixed(1) : '-'}
                            </TableCell>
                            <TableCell>{entry.notes || '-'}</TableCell>
                             {/* TODO: Add Delete Button */}
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </TableContainer>
                )}
              </Paper>
            </>
          )}
           {!selectedExercise && !loading && (
                <Paper sx={{ p: 3 }}>
                    <Typography>Please select an exercise to view progress.</Typography>
                </Paper>
           )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default ExerciseProgress;
