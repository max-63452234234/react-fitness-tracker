import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
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
  IconButton,
  Alert,
  useMediaQuery,
  useTheme
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import WorkoutForm from './WorkoutForm.js';
import MobileWorkoutCard from './MobileWorkoutCard.js';
import { useLocation, useNavigate } from 'react-router-dom'; // Removed Link, Added useLocation, useNavigate

/**
 * WorkoutLog component for tracking user workouts
 * Allows creating, viewing, editing and deleting workout sessions
 * @param {Object} props - Component props
 * @param {Object} props.currentUser - Current user object (e.g., { id: userId })
 */
const WorkoutLog = ({ currentUser }) => {
  const [workouts, setWorkouts] = useState([]);
  const [loading, setLoading] = useState(true); // Combined loading state
  const [openWorkoutForm, setOpenWorkoutForm] = useState(false);
  const [selectedWorkout, setSelectedWorkout] = useState(null);
  const [commonExercises, setCommonExercises] = useState([]); // State for common exercises (Restored)
  const [error, setError] = useState(null);
  const [editMode, setEditMode] = useState(false);

  // Theme and media query for responsive design
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const location = useLocation(); // Moved hooks to top
  const navigate = useNavigate(); // Moved hooks to top

  // --- Handlers defined before useEffect hooks that use them ---
  const handleOpenWorkoutForm = useCallback((workout = null) => {
    setError(null); // Clear error when opening form
    if (workout) {
      setSelectedWorkout(workout);
      // Set editMode ONLY if the workout has an ID (i.e., it's an existing workout)
      // Otherwise, it's a new workout pre-filled from a template.
      setEditMode(!!workout.id);
    } else {
      // No workout passed, definitely a new blank workout
      setSelectedWorkout(null);
      setEditMode(false);
    }
    setOpenWorkoutForm(true);
  }, []); // Empty dependency array as it doesn't depend on component state/props

  const handleCloseWorkoutForm = useCallback(() => {
    setOpenWorkoutForm(false);
    setSelectedWorkout(null);
    setEditMode(false);
    setError(null); // Also clear errors on close
  }, []); // Empty dependency array

  // --- Data Fetching ---
  const fetchWorkouts = async (userId) => {
      // --- Fetch workouts from backend API ---
      const response = await fetch(`http://localhost:3002/api/workouts?userId=${userId}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      // Sort workouts by date descending before setting state
      const sortedWorkouts = (data.data || []).sort((a, b) => new Date(b.date) - new Date(a.date));
      setWorkouts(sortedWorkouts);
  };

  const fetchCommonExercises = async () => {
      const response = await fetch(`http://localhost:3002/api/common-exercises`);
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setCommonExercises(data.data || []);
  };

  // --- Effects ---
  // Initial data load effect
  useEffect(() => {
    const loadInitialData = async () => {
        if (!currentUser || !currentUser.id) {
            console.log("WorkoutLog: No current user found.");
            setLoading(false);
            setWorkouts([]);
            setCommonExercises([]); // Clear common exercises if no user
            return;
        }

        setLoading(true);
        setError(null);
        try {
            // Fetch workouts and common exercises concurrently
            await Promise.all([
                fetchWorkouts(currentUser.id),
                fetchCommonExercises() // Restore call
            ]);
        } catch (error) {
            console.error('Error loading initial data:', error.message);
            setError(`Error loading data: ${error.message}. Please try again.`);
            setWorkouts([]); // Clear data on error
            setCommonExercises([]); // Clear common exercises on error
        } finally {
            setLoading(false);
        }
    };

    loadInitialData();
  }, [currentUser]); // Re-fetch if currentUser changes

  // Effect to check for template exercises passed via navigation state
  useEffect(() => {
    if (location.state?.templateExercises) {
      console.log("Received template exercises:", location.state.templateExercises);
      // Create a dummy workout object to pass to the form
      const workoutFromTemplate = {
        date: new Date().toISOString().split('T')[0], // Default to today
        notes: '', // Start with empty notes
        exercises: location.state.templateExercises
      };
      // Open the form in 'add' mode but pre-filled with template exercises
      handleOpenWorkoutForm(workoutFromTemplate);

      // Clear the state from location to prevent re-triggering on refresh
      navigate(location.pathname, { replace: true, state: {} });
    }
    // Dependencies are location.state, navigate, handleOpenWorkoutForm, and location.pathname
  }, [location.state, navigate, handleOpenWorkoutForm, location.pathname]);


  // --- CRUD Handlers ---
  // Add Workout
  const handleAddWorkout = async (workoutData) => {
    if (!currentUser?.id) {
        setError("You must be logged in to add a workout.");
        return Promise.reject(new Error("User not logged in")); // Return a rejected promise for form handling
    }
    setError(null);
    try {
      const response = await fetch('http://localhost:3002/api/workouts', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              userId: currentUser.id,
              date: workoutData.date,
              notes: workoutData.notes,
              exercises: workoutData.exercises // Send exercises array
          })
      });
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to add workout');
      }
      const newWorkout = await response.json();
      setWorkouts(prevWorkouts =>
        [newWorkout.data, ...prevWorkouts].sort((a, b) => new Date(b.date) - new Date(a.date))
      );
      handleCloseWorkoutForm(); // Close form on success
      return Promise.resolve(); // Indicate success
    } catch (error) {
      console.error('Error adding workout:', error.message);
      setError(`Failed to add workout: ${error.message}. Please try again.`);
      throw error; // Re-throw the error so the form knows submission failed
    }
  };

  // Update Workout
  const handleUpdateWorkout = async (workoutData) => {
     if (!currentUser?.id || !selectedWorkout?.id) {
        setError("Cannot update workout. User or workout ID missing.");
        return Promise.reject(new Error("User or workout ID missing")); // Return rejected promise
     }
     setError(null);
    try {
      const response = await fetch(`http://localhost:3002/api/workouts/${selectedWorkout.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              userId: currentUser.id, // Include for backend auth check
              date: workoutData.date,
              notes: workoutData.notes,
              exercises: workoutData.exercises // Send exercises array
          })
      });
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to update workout');
      }
      const updatedWorkout = await response.json();
      setWorkouts(prevWorkouts =>
        prevWorkouts.map(w =>
          w.id === selectedWorkout.id ? updatedWorkout.data : w
        ).sort((a, b) => new Date(b.date) - new Date(a.date))
      );
      handleCloseWorkoutForm(); // Close form on success
      return Promise.resolve(); // Indicate success
    } catch (error) {
      console.error('Error updating workout:', error.message);
      setError(`Failed to update workout: ${error.message}. Please try again.`);
      throw error; // Re-throw the error so the form knows submission failed
    }
  };

  // Delete Workout
  const handleDeleteWorkout = async (workoutId) => {
    if (!currentUser?.id) return;
     if (!window.confirm('Are you sure you want to delete this workout and all its exercises?')) {
       return;
     }
    setError(null);
    try {
      const response = await fetch(`http://localhost:3002/api/workouts/${workoutId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ userId: currentUser.id })
      });
      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || 'Failed to delete workout');
      }
      setWorkouts(workouts.filter(w => w.id !== workoutId));
    } catch (error) {
      console.error('Error deleting workout:', error.message);
      setError(`Failed to delete workout: ${error.message}. Please try again.`);
    }
  };

  // --- Formatting Helpers ---
  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const formatExerciseDetails = (ex) => {
    switch (ex.exercise_type || 'weight_based') {
      case 'weight_based':
        return `${ex.sets} sets, ${ex.reps} reps ${ex.weight ? `@ ${ex.weight}kg` : '(Bodyweight)'}`;
      case 'cardio_distance':
        return `${ex.distance} ${ex.distance_unit || 'km'} ${ex.duration ? `in ${formatDuration(ex.duration)}` : ''}`;
      case 'cardio_time':
        return `${formatDuration(ex.duration)} ${ex.intensity ? `(${ex.intensity} intensity)` : ''}`;
      case 'time_based':
        return `Duration: ${formatDuration(ex.duration)}`;
      default:
        return `${ex.sets || '-'} sets, ${ex.reps || '-'} reps ${ex.weight ? `@ ${ex.weight}kg` : ''}`;
    }
  };

  const formatDate = (dateString) => {
    try {
        const date = new Date(dateString);
        if (isNaN(date.getTime())) {
            const dateWithTime = new Date(dateString + 'T00:00:00');
             if (isNaN(dateWithTime.getTime())) {
                return "Invalid Date";
             }
             return dateWithTime.toLocaleDateString();
        }
        return date.toLocaleDateString();
    } catch (e) {
        console.error("Error formatting date:", dateString, e);
        return "Invalid Date";
    }
  };

  // --- Render Logic ---
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1, p: isMobile ? 2 : 3 }}>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs>
          <Typography variant={isMobile ? "h5" : "h4"} component="h1">
            Workout Log
          </Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenWorkoutForm()} // Use the memoized handler
            disabled={!currentUser}
            size={isMobile ? "small" : "medium"}
          >
            Add Workout
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {workouts.length === 0 && !loading ? (
        <Paper sx={{ p: 3, textAlign: 'center', mt: 3 }}>
          <Typography variant="body1">
            You haven't logged any workouts yet. Click "Add Workout" to get started!
          </Typography>
        </Paper>
      ) : isMobile ? (
        // Mobile view
        <Box sx={{ mt: 2 }}>
          {workouts.map((workout) => (
            <MobileWorkoutCard
              key={workout.id}
              workout={workout}
              onEdit={() => handleOpenWorkoutForm(workout)} // Use memoized handler
              onDelete={() => handleDeleteWorkout(workout.id)}
              formatDate={formatDate}
              formatDuration={formatDuration}
              disabled={!currentUser}
            />
          ))}
        </Box>
      ) : (
        // Desktop view
        <TableContainer component={Paper} sx={{ mt: 3 }}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Exercises</TableCell>
                <TableCell>Notes</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {workouts.map((workout) => (
                <TableRow key={workout.id} hover>
                  <TableCell>{formatDate(workout.date)}</TableCell>
                  <TableCell>
                    {workout.exercises && workout.exercises.length > 0 ? (
                      <ul style={{ margin: 0, paddingLeft: '1.2em', listStyle: 'none' }}>
                        {workout.exercises.map((ex, index) => (
                          <li key={ex.id || index}>
                            <Typography variant="body2" component="span">
                              <strong>{ex.name}:</strong> {formatExerciseDetails(ex)}
                            </Typography>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <Typography variant="body2" color="textSecondary">
                        No exercises logged.
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell sx={{ whiteSpace: 'pre-wrap', wordBreak: 'break-word' }}>
                    {workout.notes}
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenWorkoutForm(workout)} // Use memoized handler
                      sx={{ mr: 1 }}
                      disabled={!currentUser}
                      title="Edit Workout"
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDeleteWorkout(workout.id)}
                      disabled={!currentUser}
                      title="Delete Workout"
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
      {openWorkoutForm && (
          <WorkoutForm
            open={openWorkoutForm}
            onClose={handleCloseWorkoutForm} // Use memoized handler
            onSubmit={editMode ? handleUpdateWorkout : handleAddWorkout}
            workout={selectedWorkout}
            editMode={editMode}
            currentUser={currentUser}
            commonExercises={commonExercises}
          />
      )}

    </Box>
  );
};

export default WorkoutLog;
