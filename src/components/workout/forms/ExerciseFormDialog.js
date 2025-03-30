import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Button,
    Typography,
    Box,
    Paper,
    Grid,
    CircularProgress,
    // FormControl, // Removed unused
    // InputLabel, // Removed unused
    // Select, // Removed unused
    // MenuItem, // Removed unused
    // List, // Removed unused
    // ListItem, // Removed unused
    // ListItemText, // Removed unused
    Divider,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    IconButton,
    // InputAdornment, // Removed unused
    Autocomplete // Ensure Autocomplete is imported
  } from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * Exercise form dialog component for adding/editing exercises in a workout template
 */
const ExerciseFormDialog = ({
  open,
  onClose,
  loading, // Loading state for the list of exercises in the template
  selectedTemplate,
  templateExercises,
  currentExercise, // State for the exercise being added {name, sets, reps, weight}
  handleExerciseChange, // Handler to update currentExercise state
  handleAddExercise, // Handler to add currentExercise to the template list
  handleDeleteExercise, // Handler to delete an exercise from the list
  commonExercises // Pass the fetched common exercises list
}) => {

  // State specific to the Add Exercise form within the dialog
  const [autoCompleteValue, setAutoCompleteValue] = useState(null);

  // Reset form fields when dialog is opened/closed
  useEffect(() => {
    if (open) {
        // Reset the specific fields for adding a new exercise directly
        handleExerciseChange({ target: { name: 'name', value: '' } });
        handleExerciseChange({ target: { name: 'sets', value: '' } });
        handleExerciseChange({ target: { name: 'reps', value: '' } });
        handleExerciseChange({ target: { name: 'weight', value: '' } });
        setAutoCompleteValue(null);
    }
    // Dependency array only needs 'open' and 'handleExerciseChange'
    // because the reset logic depends on the dialog opening and the function to call.
  }, [open, handleExerciseChange]);

  // Process commonExercises prop for Autocomplete options with grouping
  const autocompleteOptions = useMemo(() =>
    (commonExercises || [])
      .map(ex => ({
          label: ex.name,
          id: ex.id,
          name: ex.name,
          category: ex.category,
          body_region: ex.body_region,
          equipment: ex.equipment
      }))
      .sort((a, b) => {
          const regionCompare = (a.body_region || 'Other').localeCompare(b.body_region || 'Other');
          if (regionCompare !== 0) return regionCompare;
          const categoryCompare = (a.category || '').localeCompare(b.category || '');
          if (categoryCompare !== 0) return categoryCompare;
          return a.label.localeCompare(b.label);
      }),
    [commonExercises]
  );

  // --- Autocomplete Handlers ---
  const handleAutocompleteInputChange = useCallback((event, newInputValue) => {
      handleExerciseChange({ target: { name: 'name', value: newInputValue } });
  }, [handleExerciseChange]);

  const handleAutocompleteChange = useCallback((event, newValue) => {
      setAutoCompleteValue(newValue);
      if (typeof newValue === 'string') {
          handleExerciseChange({ target: { name: 'name', value: newValue } });
      } else if (newValue && newValue.label) {
          handleExerciseChange({ target: { name: 'name', value: newValue.label } });
      } else {
          handleExerciseChange({ target: { name: 'name', value: '' } });
      }
  }, [handleExerciseChange]);


  // Helper function to create details string for template exercises list
  const getExerciseDetails = (exercise) => {
      return `${exercise.sets || '-'} sets × ${exercise.reps || '-'} reps ${exercise.weight ? '@ ' + exercise.weight + ' kg' : ''}`;
  };

  // Handle submitting the "Add Exercise" part of the form
  const handleAddClick = () => {
      if (!currentExercise.name || !currentExercise.sets || !currentExercise.reps) {
          alert('Please fill in Exercise Name, Sets, and Reps.');
          return;
      }
      handleAddExercise(currentExercise);
      // Reset fields after adding
      handleExerciseChange({ target: { name: 'name', value: '' } });
      handleExerciseChange({ target: { name: 'sets', value: '' } });
      handleExerciseChange({ target: { name: 'reps', value: '' } });
      handleExerciseChange({ target: { name: 'weight', value: '' } });
      setAutoCompleteValue(null);
  };


  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {selectedTemplate?.name ? `Exercises for ${selectedTemplate.name}` : 'Exercises'}
      </DialogTitle>
      <DialogContent>
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            {/* Exercise List */}
            {templateExercises.length === 0 ? (
              <Typography variant="body1" sx={{ mt: 2, mb: 4 }}>
                No exercises added to this template yet. Add one below.
              </Typography>
            ) : (
              <TableContainer component={Paper} sx={{ mb: 4, mt: 2 }}>
                <Table size="small">
                  <TableHead>
                    <TableRow>
                      <TableCell>Exercise</TableCell>
                      <TableCell>Details</TableCell>
                      <TableCell align="right">Action</TableCell>
                    </TableRow>
                  </TableHead>
                  {/* Removed whitespace */}
                  <TableBody>{/* Removed whitespace */}
                    {templateExercises.map((exercise) => (
                        <TableRow key={exercise.id || exercise.tempId}>{/* Removed whitespace */}
                          <TableCell>{exercise.name}</TableCell>
                          <TableCell>{getExerciseDetails(exercise)}</TableCell>
                          <TableCell align="right">
                            <IconButton
                              size="small"
                              color="error"
                              onClick={() => handleDeleteExercise(exercise.id)}
                            >
                              <DeleteIcon fontSize="inherit"/>
                            </IconButton>
                          </TableCell>
                        </TableRow>
                      )
                    )}{/* Removed whitespace */}
                  </TableBody>{/* Removed whitespace */}
                </Table>
              </TableContainer>
            )}

            <Divider sx={{ my: 3 }} />

            {/* Add Exercise Form */}
            <Typography variant="h6" gutterBottom>
              Add Exercise to Template
            </Typography>

            <Grid container spacing={2}>
              {/* Autocomplete for Exercise Name */}
              <Grid item xs={12}>
                 <Autocomplete
                    freeSolo
                    id="template-exercise-name-autocomplete"
                    options={autocompleteOptions}
                    groupBy={(option) => option.body_region ? `${option.body_region} - ${option.category}` : `Other - ${option.category}`}
                    getOptionLabel={(option) => (typeof option === 'string' ? option : option.label || "")}
                    value={autoCompleteValue}
                    onInputChange={handleAutocompleteInputChange}
                    onChange={handleAutocompleteChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        required
                        label="Exercise Name"
                        name="name" // Ensure name matches state key
                        placeholder="Type or select exercise"
                      />
                    )}
                    sx={{ mb: 1 }}
                  />
              </Grid>

              {/* Sets, Reps, Weight Fields */}
              <Grid item xs={4}>
                <TextField
                  required
                  fullWidth
                  id="templateExerciseSets"
                  name="sets"
                  label="Sets"
                  type="number"
                  inputProps={{ min: 1 }}
                  value={currentExercise.sets}
                  onChange={handleExerciseChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  required
                  fullWidth
                  id="templateExerciseReps"
                  name="reps"
                  label="Reps"
                  type="number"
                  inputProps={{ min: 1 }}
                  value={currentExercise.reps}
                  onChange={handleExerciseChange}
                  size="small"
                />
              </Grid>
              <Grid item xs={4}>
                <TextField
                  fullWidth
                  id="templateExerciseWeight"
                  name="weight"
                  label="Weight (kg)"
                  type="number"
                  inputProps={{ min: 0, step: 0.5 }}
                  value={currentExercise.weight}
                  onChange={handleExerciseChange}
                  size="small"
                />
              </Grid>

              {/* Add Button */}
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleAddClick}
                >
                  Add Exercise to Template
                </Button>
              </Grid>
            </Grid>
          </>
        )}
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Close</Button>
      </DialogActions>
    </Dialog>
  );
};

export default ExerciseFormDialog;
