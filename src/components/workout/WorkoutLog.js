import React, { useState, useEffect, useMemo } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  IconButton,
  Alert,
  useMediaQuery,
  useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import { supabase } from '../../index.js';
import WorkoutForm from './WorkoutForm.js';
import ExerciseForm from './ExerciseForm.js';
import MobileWorkoutCard from './MobileWorkoutCard.js';
import { Link } from 'react-router-dom';

/**
 * WorkoutLog component for tracking user workouts
 * Allows creating, viewing, editing and deleting workout sessions
 */
const WorkoutLog = () => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openWorkoutForm, setOpenWorkoutForm] = useState(false);
  const [openExerciseForm, setOpenExerciseForm] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [exercises, setExercises] = useState([]);
  const [commonExercises, setCommonExercises] = useState([]);
  const [exerciseLoading, setExerciseLoading] = useState(false);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [expandedCardId, setExpandedCardId] = useState(null);
  
  // Theme and media query for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));

  useEffect(() => {
    // Get current user and fetch workouts
    const fetchData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        setUserId(user.id);
        
        // Fetch workouts
        const { data, error } = await supabase
          .from('workouts')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
          
        if (error) throw error;
        
        setWorkouts(data || []);
        
        // Fetch common exercises
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('common_exercises')
          .select('*')
          .order('name');
          
        if (exerciseError) {
          console.error('Error fetching common exercises:', exerciseError.message);
        } else {
          setCommonExercises(exerciseData || []);
        }
        
      } catch (error) {
        console.error('Error fetching workouts:', error.message);
        setError('Error loading workouts. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleOpenWorkoutForm = (workout = null) => {
    if (workout) {
      setSelectedWorkout(workout);
      setEditMode(true);
    } else {
      setSelectedWorkout(null);
      setEditMode(false);
    }
    setOpenWorkoutForm(true);
  };
  
  const handleCloseWorkoutForm = () => {
    setOpenWorkoutForm(false);
    setSelectedWorkout(null);
    setEditMode(false);
  };
  
  const handleAddWorkout = async (workoutData) => {
    try {
      const { data, error } = await supabase
        .from('workouts')
        .insert([
          { 
            user_id: userId,
            date: workoutData.date,
            notes: workoutData.notes
          }
        ])
        .select();
        
      if (error) throw error;
      
      // Add the new workout to state
      setWorkouts([data[0], ...workouts]);
      handleCloseWorkoutForm();
    } catch (error) {
      console.error('Error adding workout:', error.message);
      setError('Failed to add workout. Please try again.');
    }
  };
  
  const handleUpdateWorkout = async (workoutData) => {
    try {
      const { error } = await supabase
        .from('workouts')
        .update({ 
          date: workoutData.date,
          notes: workoutData.notes
        })
        .eq('id', selectedWorkout.id);
        
      if (error) throw error;
      
      // Update workout in state
      setWorkouts(workouts.map(w => 
        w.id === selectedWorkout.id 
          ? { ...w, date: workoutData.date, notes: workoutData.notes }
          : w
      ));
      
      handleCloseWorkoutForm();
    } catch (error) {
      console.error('Error updating workout:', error.message);
      setError('Failed to update workout. Please try again.');
    }
  };
  
  const handleDeleteWorkout = async (workoutId) => {
    if (!window.confirm('Are you sure you want to delete this workout?')) {
      return;
    }
    
    try {
      // First delete associated exercises
      const { error: exerciseError } = await supabase
        .from('exercises')
        .delete()
        .eq('workout_id', workoutId);
        
      if (exerciseError) throw exerciseError;
      
      // Then delete the workout
      const { error } = await supabase
        .from('workouts')
        .delete()
        .eq('id', workoutId);
        
      if (error) throw error;
      
      // Update state
      setWorkouts(workouts.filter(w => w.id !== workoutId));
    } catch (error) {
      console.error('Error deleting workout:', error.message);
      setError('Failed to delete workout. Please try again.');
    }
  };
  
  const handleViewExercises = async (workout) => {
    try {
      setSelectedWorkout(workout);
      setExerciseLoading(true);
      
      const { data, error } = await supabase
        .from('exercises')
        .select('*')
        .eq('workout_id', workout.id)
        .order('id');
        
      if (error) throw error;
      
      setExercises(data || []);
      setOpenExerciseForm(true);
    } catch (error) {
      console.error('Error fetching exercises:', error.message);
      setError('Failed to load exercises. Please try again.');
    } finally {
      setExerciseLoading(false);
    }
  };
  
  const handleAddExercise = async (exerciseData) => {
    try {
      // Prepare the exercise data based on type
      const exerciseToInsert = { 
        workout_id: selectedWorkout.id,
        name: exerciseData.name,
        exercise_type: exerciseData.exercise_type,
        // Always include sets and reps as they're required by the database schema
        sets: exerciseData.sets || 1,
        reps: exerciseData.reps || 1,
        weight: 0 // Default to 0 for non-weight exercises
      };
      
      // Add type-specific fields
      if (exerciseData.exercise_type === 'weight_based') {
        exerciseToInsert.weight = exerciseData.weight;
      } else if (exerciseData.exercise_type === 'cardio_distance') {
        exerciseToInsert.distance = exerciseData.distance;
        exerciseToInsert.distance_unit = exerciseData.distance_unit;
        exerciseToInsert.duration = exerciseData.duration;
      } else if (exerciseData.exercise_type === 'cardio_time' || exerciseData.exercise_type === 'time_based') {
        exerciseToInsert.duration = exerciseData.duration;
        if (exerciseData.intensity) {
          exerciseToInsert.intensity = exerciseData.intensity;
        }
      }
      
      const { data, error } = await supabase
        .from('exercises')
        .insert([exerciseToInsert])
        .select();
        
      if (error) throw error;
      
      // Add the new exercise to state
      setExercises([...exercises, data[0]]);
    } catch (error) {
      console.error('Error adding exercise:', error.message);
      setError('Failed to add exercise. Please try again.');
    }
  };
  
  const handleDeleteExercise = async (exerciseId) => {
    try {
      const { error } = await supabase
        .from('exercises')
        .delete()
        .eq('id', exerciseId);
        
      if (error) throw error;
      
      // Update state
      setExercises(exercises.filter(e => e.id !== exerciseId));
    } catch (error) {
      console.error('Error deleting exercise:', error.message);
      setError('Failed to delete exercise. Please try again.');
    }
  };
  
  // Format duration from seconds to MM:SS
  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Get exercises for a specific workout
  const getExercisesForWorkout = (workoutId) => {
    return workouts.find(w => w.id === workoutId)?.exercises || [];
  };

  const handleToggleExpandCard = (workoutId) => {
    setExpandedCardId(expandedCardId === workoutId ? null : workoutId);
  };

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs>
          <Typography variant="h4" component="h1">
            Workout Log
          </Typography>
        </Grid>
        <Grid item>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenWorkoutForm()}
          >
            Add Workout
          </Button>
        </Grid>
      </Grid>
      
      <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
        <Grid item>
          <Button 
            variant="outlined" 
            color="primary"
            component={Link}
            to="/workout-templates"
          >
            Use Template
          </Button>
        </Grid>
      </Grid>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {workouts.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            You haven't logged any workouts yet. Click "Add Workout" to get started!
          </Typography>
        </Paper>
      ) : isMobile ? (
        // Mobile view - use cards instead of table
        <Box>
          {workouts.map((workout) => (
            <MobileWorkoutCard
              key={workout.id}
              workout={workout}
              exercises={exercises.filter(e => e.workout_id === workout.id)}
              onEdit={() => handleOpenWorkoutForm(workout)}
              onDelete={() => handleDeleteWorkout(workout.id)}
              onAddExercise={() => handleViewExercises(workout)}
              formatDate={formatDate}
              formatDuration={formatDuration}
              expanded={expandedCardId === workout.id}
              onExpand={() => handleToggleExpandCard(workout.id)}
            />
          ))}
        </Box>
      ) : (
        // Desktop view - use table
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workouts.map((workout) => (
                <TableRow key={workout.id}>
                  <TableCell>{formatDate(workout.date)}</TableCell>
                  <TableCell>{workout.notes}</TableCell>
                  <TableCell align="right">
                    <Button 
                      variant="outlined" 
                      size="small" 
                      sx={{ mr: 1 }}
                      onClick={() => handleViewExercises(workout)}
                    >
                      Exercises
                    </Button>
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleOpenWorkoutForm(workout)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteWorkout(workout.id)}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
      
      {/* Workout Form Dialog */}
      <WorkoutForm 
        open={openWorkoutForm}
        onClose={handleCloseWorkoutForm}
        onSubmit={editMode ? handleUpdateWorkout : handleAddWorkout}
        workout={selectedWorkout}
        editMode={editMode}
      />
      
      {/* Exercise Dialog */}
      <Dialog 
        open={openExerciseForm} 
        onClose={() => setOpenExerciseForm(false)}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Exercises for {selectedWorkout && formatDate(selectedWorkout.date)}
        </DialogTitle>
        <DialogContent>
          {exerciseLoading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
              <CircularProgress />
            </Box>
          ) : (
            <>
              {exercises.length === 0 ? (
                <Typography variant="body1" sx={{ my: 2 }}>
                  No exercises added yet. Add your first exercise below.
                </Typography>
              ) : (
                <TableContainer sx={{ mt: 2 }}>
                  <Table>
                    <TableHead>
                      <TableRow>
                        <TableCell>Exercise</TableCell>
                        <TableCell>Type</TableCell>
                        <TableCell>Details</TableCell>
                        <TableCell align="right">Action</TableCell>
                      </TableRow>
                    </TableHead>
                    <TableBody>
                      {exercises.map((exercise) => {
                        let details = '';
                        
                        // Create details string based on exercise type
                        if (exercise.exercise_type === 'weight_based') {
                          details = `${exercise.sets} sets × ${exercise.reps} reps`;
                          if (exercise.weight > 0) {
                            details += ` @ ${exercise.weight} kg`;
                          }
                        } else if (exercise.exercise_type === 'cardio_distance') {
                          details = `${exercise.distance} ${exercise.distance_unit}`;
                          if (exercise.duration) {
                            details += ` • ${formatDuration(exercise.duration)}`;
                          }
                        } else if (exercise.exercise_type === 'cardio_time') {
                          details = formatDuration(exercise.duration);
                          if (exercise.intensity) {
                            details += ` • ${exercise.intensity.charAt(0).toUpperCase() + exercise.intensity.slice(1)} intensity`;
                          }
                        } else if (exercise.exercise_type === 'time_based') {
                          details = formatDuration(exercise.duration);
                        }
                        
                        // Convert exercise type to display format
                        let typeDisplay;
                        switch(exercise.exercise_type) {
                          case 'weight_based':
                            typeDisplay = 'Weights';
                            break;
                          case 'cardio_distance':
                            typeDisplay = 'Cardio (Distance)';
                            break;
                          case 'cardio_time':
                            typeDisplay = 'Cardio (Time)';
                            break;
                          case 'time_based':
                            typeDisplay = 'Timed Exercise';
                            break;
                          default:
                            typeDisplay = exercise.exercise_type;
                        }
                        
                        return (
                          <TableRow key={exercise.id}>
                            <TableCell>{exercise.name}</TableCell>
                            <TableCell>{typeDisplay}</TableCell>
                            <TableCell>{details}</TableCell>
                            <TableCell align="right">
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => handleDeleteExercise(exercise.id)}
                              >
                                <DeleteIcon />
                              </IconButton>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                    </TableBody>
                  </Table>
                </TableContainer>
              )}
              
              <ExerciseForm onAddExercise={handleAddExercise} commonExercises={commonExercises} />
            </>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenExerciseForm(false)}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default WorkoutLog;
