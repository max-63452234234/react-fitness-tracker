import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  TextField,
  Grid,
  Box,
  CircularProgress
} from '@mui/material';

/**
 * WorkoutForm component
 * Form for adding/editing workouts
 * 
 * @param {Object} props - Component props
 * @param {boolean} props.open - Controls dialog visibility
 * @param {Function} props.onClose - Function to call when dialog is closed
 * @param {Function} props.onSubmit - Function to call when form is submitted
 * @param {Object} props.workout - Workout object for editing (null for new workout)
 * @param {boolean} props.editMode - Whether the form is in edit mode
 */
const WorkoutForm = ({ open, onClose, onSubmit, workout, editMode }) => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  
  // Set form values when editing an existing workout
  useEffect(() => {
    if (workout && editMode) {
      setDate(workout.date.split('T')[0]);
      setNotes(workout.notes || '');
    } else if (!editMode) {
      // Reset form for new workout
      setDate(new Date().toISOString().split('T')[0]);
      setNotes('');
    }
  }, [workout, editMode]);
  
  const validate = () => {
    const newErrors = {};
    
    if (!date) {
      newErrors.date = 'Date is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    try {
      setLoading(true);
      
      await onSubmit({
        date,
        notes
      });
      
      // Reset form
      if (!editMode) {
        setDate(new Date().toISOString().split('T')[0]);
        setNotes('');
      }
    } catch (error) {
      console.error('Error submitting workout:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <Dialog 
      open={open} 
      onClose={loading ? null : onClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>
        {editMode ? 'Edit Workout' : 'Add New Workout'}
      </DialogTitle>
      <Box component="form" onSubmit={handleSubmit}>
        <DialogContent>
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <TextField
                margin="normal"
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
                disabled={loading}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                margin="normal"
                fullWidth
                id="notes"
                label="Notes"
                multiline
                rows={4}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                disabled={loading}
                placeholder="Optional notes about this workout"
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={onClose} disabled={loading}>
            Cancel
          </Button>
          <Button 
            type="submit" 
            variant="contained" 
            color="primary"
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : editMode ? 'Update' : 'Add'}
          </Button>
        </DialogActions>
      </Box>
    </Dialog>
  );
};

export default WorkoutForm;
