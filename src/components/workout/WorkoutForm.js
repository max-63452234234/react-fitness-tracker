import React, { useState, useEffect, useCallback } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  CircularProgress,
  AppBar,
  Toolbar,
  IconButton,
  Typography,
  useMediaQuery,
  useTheme,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  Divider, // Added
  Paper, // Added
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import SaveIcon from '@mui/icons-material/Save';
import DeleteIcon from '@mui/icons-material/Delete'; // Added
import ExerciseForm from './ExerciseForm'; // Added

/**
 * WorkoutForm component
 * Form for adding/editing workouts including exercises
 *
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls dialog visibility
 * @param {Function} props.onClose - Function to call when dialog is closed
 * @param {Function} props.onSubmit - Function to call when form is submitted
 * @param {Object} props.workout - Workout object for editing (null for new workout)
 * @param {boolean} props.editMode - Whether the form is in edit mode
 * @param {Object} props.currentUser - Current user object
 * @param {Array} props.commonExercises - List of common exercises for Autocomplete
 */
const WorkoutForm = ({ open, onClose, onSubmit, workout, editMode, currentUser, commonExercises = [] }) => { // Restored commonExercises prop
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [exercises, setExercises] = useState([]); // State for exercises in the form
  const [loading, setLoading] = useState(false);
  const [exerciseLoading, setExerciseLoading] = useState(false); // Loading state for fetching exercises
  const [errors, setErrors] = useState({});
  const [formError, setFormError] = useState(null); // General form error

  // Fetch exercises when editing an existing workout
  const fetchExercisesForWorkout = useCallback(async (workoutId) => {
    if (!currentUser?.id || !workoutId) return;
    setExerciseLoading(true);
    setFormError(null);
    try {
      // --- Fetch exercises for this workout from backend ---
      // NOTE: This endpoint might be removed later if GET /api/workouts includes exercises
      const response = await fetch(`http://localhost:3002/api/workouts/${workoutId}/exercises?userId=${currentUser.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setExercises(data.data || []);
    } catch (error) {
      console.error('Error fetching exercises for form:', error.message);
      setFormError(`Failed to load existing exercises: ${error.message}.`);
      setExercises([]); // Clear exercises on error
    } finally {
      setExerciseLoading(false);
    }
  }, [currentUser]); // Dependency on currentUser

  // Set form values when opening
  useEffect(() => {
    setFormError(null); // Clear errors when dialog opens/changes
    if (open) {
      if (workout) {
        // If a workout object is provided (editing OR using template)
        setDate(workout.date ? workout.date.split('T')[0] : new Date().toISOString().split('T')[0]); // Use workout date or default
        setNotes(workout.notes || '');

        if (editMode) {
          // Editing an existing workout: Fetch its exercises from DB
          fetchExercisesForWorkout(workout.id);
        } else {
          // Adding a new workout, potentially pre-filled from template
          setExercises(workout.exercises || []); // Use exercises from prop (template) or default to empty
        }
      } else {
        // No workout object provided (completely new, blank workout)
        setDate(new Date().toISOString().split('T')[0]);
        setNotes('');
        setExercises([]);
      }
    } else {
      // Reset everything when closed
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
      setExercises([]);
      setErrors({});
      setFormError(null);
      setLoading(false);
      setExerciseLoading(false);
    }
    // Dependencies: open state, the workout object itself, editMode flag, and the fetch function
  }, [open, workout, editMode, fetchExercisesForWorkout]);

  const validate = () => {
    const newErrors = {};
    if (!date) {
      newErrors.date = 'Date is required';
    }
    // Basic validation: ensure at least one exercise is added? Optional.
    // if (exercises.length === 0) {
    //   newErrors.exercises = 'Add at least one exercise';
    // }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handler to add an exercise from ExerciseForm to the local state
  const handleAddExerciseLocal = (exerciseData) => {
    // Add a temporary ID for list key purposes if needed, backend will assign real ID
    setExercises([...exercises, { ...exerciseData, tempId: Date.now() }]);
    setFormError(null); // Clear error if adding succeeds
  };

  // Handler to remove an exercise from the local state
  const handleRemoveExerciseLocal = (indexToRemove) => {
    setExercises(exercises.filter((_, index) => index !== indexToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormError(null); // Clear previous errors

    if (!validate()) {
      return;
    }

    // Prevent submission if exercises are still loading
    if (exerciseLoading) {
        setFormError("Please wait for exercises to load before saving.");
        return;
    }

    try {
      setLoading(true);

      // Call the onSubmit passed from WorkoutLog, now sending exercises too
      await onSubmit({
        date,
        notes,
        exercises // Pass the list of exercises
      });

      // No need to reset form here, useEffect handles it on close/reopen
      // onClose(); // Close handled by WorkoutLog on success

    } catch (error) {
      console.error('Error submitting workout:', error);
      // Display error message to the user within the form
      setFormError(`Error saving workout: ${error.message || 'Please try again.'}`);
    } finally {
      setLoading(false);
    }
  };

  // Helper to format exercise details for display
  const formatExerciseDetails = (ex) => {
    switch (ex.exercise_type || 'weight_based') { // Default to weight_based if type missing
      case 'weight_based':
        return `${ex.sets} sets, ${ex.reps} reps ${ex.weight ? `@ ${ex.weight}kg` : '(Bodyweight)'}`;
      case 'cardio_distance':
        return `${ex.distance} ${ex.distance_unit || 'km'} ${ex.duration ? `in ${formatDuration(ex.duration)}` : ''}`;
      case 'cardio_time':
        return `${formatDuration(ex.duration)} ${ex.intensity ? `(${ex.intensity} intensity)` : ''}`;
      case 'time_based':
        return `Duration: ${formatDuration(ex.duration)}`;
      default:
        // Fallback for exercises potentially added before type was mandatory
        return `${ex.sets || '-'} sets, ${ex.reps || '-'} reps ${ex.weight ? `@ ${ex.weight}kg` : ''}`;
    }
  };

  // Format duration from seconds to MM:SS
  const formatDuration = (seconds) => {
    if (!seconds && seconds !== 0) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };


  return (
    <Dialog
      open={open}
      onClose={loading ? null : onClose} // Prevent closing while saving
      maxWidth="md" // Wider dialog to accommodate exercises
      fullWidth
      fullScreen={isMobile}
    >
      {isMobile ? (
        <AppBar sx={{ position: 'relative' }}>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={onClose}
              aria-label="close"
              disabled={loading || exerciseLoading}
            >
              <CloseIcon />
            </IconButton>
            <Typography sx={{ ml: 2, flex: 1 }} variant="h6" component="div">
              {editMode ? 'Edit Workout' : 'Add New Workout'}
            </Typography>
            <Button
              autoFocus
              color="inherit"
              onClick={handleSubmit}
              disabled={loading || exerciseLoading} // Disable if loading workout or exercises
              startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <SaveIcon />}
            >
              {editMode ? 'Update' : 'Save'}
            </Button>
          </Toolbar>
        </AppBar>
      ) : (
        <DialogTitle>
          {editMode ? 'Edit Workout' : 'Add New Workout'}
        </DialogTitle>
      )}
      {/* Use Box for form to prevent nested forms if ExerciseForm uses one */}
      <Box component="div">
        <DialogContent>
          {/* Display General Form Error */}
          {formError && (
            <Paper elevation={0} sx={{ p: 1.5, mb: 2, backgroundColor: 'error.lighter', color: 'error.dark' }}>
              <Typography variant="body2">{formError}</Typography>
            </Paper>
          )}

          {/* Workout Details Section */}
          <Grid container spacing={isMobile ? 3 : 2}>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense" // Changed from normal
                size={isMobile ? "medium" : "small"} // Standardized size
                required
                fullWidth
                id="date"
                label="Workout Date"
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                InputLabelProps={{
                  shrink: true,
                }}
                error={!!errors.date}
                helperText={errors.date}
                disabled={loading || exerciseLoading}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                margin="dense" // Changed from normal
                size={isMobile ? "medium" : "small"} // Standardized size
                fullWidth
                id="notes"
                label="Notes"
                multiline
                rows={isMobile ? 3 : 1} // Adjusted rows
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading || exerciseLoading}
                placeholder="Optional notes about this workout"
              />
            </Grid>
          </Grid>

          <Divider sx={{ my: 3 }} />

          {/* Exercises Section */}
          <Typography variant="h6" gutterBottom>Exercises</Typography>

          {exerciseLoading ? (
             <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
               <CircularProgress />
             </Box>
           ) : exercises.length === 0 ? (
            <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
              No exercises added yet. Use the form below to add one.
            </Typography>
          ) : (
            <Paper variant="outlined" sx={{ mb: 3 }}>
              <List dense>
                {exercises.map((ex, index) => (
                  <React.Fragment key={ex.id || ex.tempId || index}>
                    <ListItem>
                      <ListItemText
                        primary={ex.name}
                        secondary={formatExerciseDetails(ex)}
                      />
                      <ListItemSecondaryAction>
                        <IconButton
                          edge="end"
                          aria-label="delete"
                          onClick={() => handleRemoveExerciseLocal(index)}
                          disabled={loading}
                          size="small"
                          color="error"
                        >
                          <DeleteIcon fontSize="small"/>
                        </IconButton>
                      </ListItemSecondaryAction>
                    </ListItem>
                    {index < exercises.length - 1 && <Divider component="li" />}
                  </React.Fragment>
                ))}
              </List>
            </Paper>
          )}

          {/* Embed ExerciseForm */}
          {/* Pass handler to add exercise to local state */}
          {/* Pass commonExercises if available (needs to be fetched in WorkoutLog and passed down) */}
          <ExerciseForm
            onAddExercise={handleAddExerciseLocal}
            commonExercises={commonExercises} // Pass common exercises down - ADDED
            disabled={loading || exerciseLoading} // Disable form while saving/loading
          />

        </DialogContent>

        {/* Actions for Desktop View */}
        {!isMobile && (
          <DialogActions sx={{ pt: 2, pb: 2, px: 3 }}>
            <Button onClick={onClose} disabled={loading || exerciseLoading}>
              Cancel
            </Button>
            <Button
              onClick={handleSubmit} // Trigger submit
              variant="contained"
              color="primary"
              disabled={loading || exerciseLoading} // Disable if loading workout or exercises
              startIcon={loading ? <CircularProgress size={20} /> : <SaveIcon />}
            >
              {loading ? 'Saving...' : editMode ? 'Update Workout' : 'Save Workout'}
            </Button>
          </DialogActions>
        )}
      </Box>
    </Dialog>
  );
};

export default WorkoutForm;
