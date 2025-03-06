import React, { useState, useEffect } from 'react';
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  List,
  ListItem,
  ListItemText,
  Divider,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  InputAdornment
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';

/**
 * Exercise form dialog component for adding/editing exercises in a workout template
 */
const ExerciseFormDialog = ({
  open,
  onClose,
  loading,
  selectedTemplate,
  templateExercises,
  currentExercise,
  handleExerciseChange,
  handleAddExercise,
  handleDeleteExercise,
  selectedCategory,
  setSelectedCategory,
  categories,
  exercisesByCategory,
  handleSelectCommonExercise
}) => {
  const [exerciseType, setExerciseType] = useState('weight_based');
  const [duration, setDuration] = useState('');
  const [distance, setDistance] = useState('');
  const [distanceUnit, setDistanceUnit] = useState('km');
  const [intensity, setIntensity] = useState('');

  // Reset form fields when dialog is opened/closed
  useEffect(() => {
    if (open) {
      setExerciseType('weight_based');
      setDuration('');
      setDistance('');
      setDistanceUnit('km');
      setIntensity('');
    }
  }, [open]);

  // Update exercise type when an exercise is selected from common exercises
  useEffect(() => {
    if (currentExercise.name && exercisesByCategory) {
      const allExercises = Object.values(exercisesByCategory).flat();
      const selectedExercise = allExercises.find(
        ex => ex.name.toLowerCase() === currentExercise.name.toLowerCase()
      );
      
      if (selectedExercise && selectedExercise.default_type) {
        setExerciseType(selectedExercise.default_type);
      }
    }
  }, [currentExercise.name, exercisesByCategory]);

  // Format duration from seconds to MM:SS for display
  const formatDuration = (seconds) => {
    if (!seconds) return '';
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  // Parse time input (MM:SS) to seconds
  const parseTimeToSeconds = (timeStr) => {
    if (!timeStr) return 0;
    
    if (timeStr.includes(':')) {
      const [minutes, seconds] = timeStr.split(':').map(Number);
      return (isNaN(minutes) ? 0 : minutes) * 60 + (isNaN(seconds) ? 0 : seconds);
    } else {
      const mins = parseInt(timeStr);
      return isNaN(mins) ? 0 : mins * 60; // If only number entered, assume minutes
    }
  };

  // Handle custom add exercise with different types
  const handleCustomAddExercise = () => {
    // Create exercise data based on type
    const exerciseData = {
      ...currentExercise,
      exercise_type: exerciseType,
      // Always provide sets and reps with defaults if not explicitly set
      sets: currentExercise.sets || 1,
      reps: currentExercise.reps || 1
    };
    
    // Add type-specific fields
    if (exerciseType === 'cardio_distance') {
      exerciseData.distance = parseFloat(distance);
      exerciseData.distance_unit = distanceUnit;
      exerciseData.duration = duration ? parseTimeToSeconds(duration) : null;
      exerciseData.weight = 0; // Default
    } else if (exerciseType === 'cardio_time' || exerciseType === 'time_based') {
      exerciseData.duration = parseTimeToSeconds(duration);
      exerciseData.weight = 0; // Default
      if (exerciseType === 'cardio_time') {
        exerciseData.intensity = intensity;
      }
    } else if (exerciseType === 'weight_based') {
      exerciseData.weight = currentExercise.weight || 0;
    }
    
    handleAddExercise(exerciseData);
    
    // Reset form fields
    setDuration('');
    setDistance('');
    setIntensity('');
  };

  // Helper function to create details string for different exercise types
  const getExerciseDetails = (exercise) => {
    if (!exercise.exercise_type || exercise.exercise_type === 'weight_based') {
      return `${exercise.sets} sets × ${exercise.reps} reps ${exercise.weight ? '@ ' + exercise.weight + ' kg' : ''}`;
    } else if (exercise.exercise_type === 'cardio_distance') {
      return `${exercise.distance} ${exercise.distance_unit} ${exercise.duration ? '• ' + formatDuration(exercise.duration) : ''}`;
    } else if (exercise.exercise_type === 'cardio_time') {
      return `${formatDuration(exercise.duration)} ${exercise.intensity ? '• ' + exercise.intensity + ' intensity' : ''}`;
    } else if (exercise.exercise_type === 'time_based') {
      return formatDuration(exercise.duration);
    }
    return '';
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
    >
      <DialogTitle>
        {selectedTemplate && `Exercises for ${selectedTemplate.name}`}
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
                No exercises added to this template yet. Add your first exercise below.
              </Typography>
            ) : (
              <TableContainer component={Paper} sx={{ mb: 4, mt: 2 }}>
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
                    {templateExercises.map((exercise) => {
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
                          typeDisplay = 'Weights';
                      }
                      
                      return (
                        <TableRow key={exercise.id}>
                          <TableCell>{exercise.name}</TableCell>
                          <TableCell>{typeDisplay}</TableCell>
                          <TableCell>{getExerciseDetails(exercise)}</TableCell>
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
            
            {/* Add Exercise Form */}
            <Typography variant="h6" gutterBottom>
              Add Exercise
            </Typography>
            
            {/* Common Exercise Selection */}
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle2" gutterBottom>
                Select from Common Exercises (Optional)
              </Typography>
              
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel id="category-select-label">Exercise Category</InputLabel>
                <Select
                  labelId="category-select-label"
                  id="category-select"
                  value={selectedCategory}
                  label="Exercise Category"
                  onChange={(e) => setSelectedCategory(e.target.value)}
                >
                  <MenuItem value="">
                    <em>Select a category</em>
                  </MenuItem>
                  {categories.map(category => (
                    <MenuItem key={category} value={category}>{category}</MenuItem>
                  ))}
                </Select>
              </FormControl>
              
              {selectedCategory && (
                <List dense sx={{ maxHeight: 200, overflow: 'auto', border: 1, borderColor: 'divider', borderRadius: 1 }}>
                  {exercisesByCategory[selectedCategory]?.map((exercise) => (
                    <React.Fragment key={exercise.id}>
                      <ListItem button onClick={() => handleSelectCommonExercise(exercise.name)}>
                        <ListItemText 
                          primary={exercise.name} 
                          secondary={`${exercise.equipment || ''} ${exercise.default_type ? '• ' + exercise.default_type.replace('_', ' ') : ''}`}
                        />
                      </ListItem>
                      <Divider />
                    </React.Fragment>
                  ))}
                </List>
              )}
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={6}>
                <TextField
                  required
                  fullWidth
                  id="exerciseName"
                  name="name"
                  label="Exercise Name"
                  value={currentExercise.name}
                  onChange={handleExerciseChange}
                  placeholder="e.g., Bench Press"
                />
              </Grid>
              
              <Grid item xs={12} sm={6} md={6}>
                <FormControl fullWidth>
                  <InputLabel id="exercise-type-label">Exercise Type</InputLabel>
                  <Select
                    labelId="exercise-type-label"
                    id="exercise-type"
                    value={exerciseType}
                    label="Exercise Type"
                    onChange={(e) => setExerciseType(e.target.value)}
                  >
                    <MenuItem value="weight_based">Weight Based</MenuItem>
                    <MenuItem value="cardio_distance">Cardio with Distance</MenuItem>
                    <MenuItem value="cardio_time">Cardio with Time</MenuItem>
                    <MenuItem value="time_based">Time Based</MenuItem>
                  </Select>
                </FormControl>
              </Grid>
              
              {/* Type-specific fields */}
              {exerciseType === 'weight_based' && (
                <>
                  <Grid item xs={12} sm={4} md={4}>
                    <TextField
                      required
                      fullWidth
                      id="exerciseSets"
                      name="sets"
                      label="Sets"
                      type="number"
                      inputProps={{ min: 1 }}
                      value={currentExercise.sets}
                      onChange={handleExerciseChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4} md={4}>
                    <TextField
                      required
                      fullWidth
                      id="exerciseReps"
                      name="reps"
                      label="Reps"
                      type="number"
                      inputProps={{ min: 1 }}
                      value={currentExercise.reps}
                      onChange={handleExerciseChange}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4} md={4}>
                    <TextField
                      fullWidth
                      id="exerciseWeight"
                      name="weight"
                      label="Weight (kg)"
                      type="number"
                      inputProps={{ min: 0, step: 0.5 }}
                      value={currentExercise.weight}
                      onChange={handleExerciseChange}
                    />
                  </Grid>
                </>
              )}
              
              {exerciseType === 'cardio_distance' && (
                <>
                  <Grid item xs={12} sm={4} md={4}>
                    <TextField
                      required
                      fullWidth
                      id="exerciseDistance"
                      label="Distance"
                      type="number"
                      inputProps={{ min: 0, step: 0.1 }}
                      value={distance}
                      onChange={(e) => setDistance(e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={4} md={4}>
                    <FormControl fullWidth>
                      <InputLabel id="distance-unit-label">Unit</InputLabel>
                      <Select
                        labelId="distance-unit-label"
                        id="distance-unit"
                        value={distanceUnit}
                        label="Unit"
                        onChange={(e) => setDistanceUnit(e.target.value)}
                      >
                        <MenuItem value="km">Kilometers</MenuItem>
                        <MenuItem value="mi">Miles</MenuItem>
                        <MenuItem value="m">Meters</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  
                  <Grid item xs={12} sm={4} md={4}>
                    <TextField
                      fullWidth
                      id="exerciseDuration"
                      label="Duration (MM:SS)"
                      placeholder="e.g., 30:00"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </Grid>
                </>
              )}
              
              {exerciseType === 'cardio_time' && (
                <>
                  <Grid item xs={12} sm={6} md={6}>
                    <TextField
                      required
                      fullWidth
                      id="exerciseDuration"
                      label="Duration (MM:SS)"
                      placeholder="e.g., 30:00"
                      value={duration}
                      onChange={(e) => setDuration(e.target.value)}
                    />
                  </Grid>
                  
                  <Grid item xs={12} sm={6} md={6}>
                    <FormControl fullWidth>
                      <InputLabel id="intensity-label">Intensity</InputLabel>
                      <Select
                        labelId="intensity-label"
                        id="intensity"
                        value={intensity}
                        label="Intensity"
                        onChange={(e) => setIntensity(e.target.value)}
                      >
                        <MenuItem value="low">Low</MenuItem>
                        <MenuItem value="medium">Medium</MenuItem>
                        <MenuItem value="high">High</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </>
              )}
              
              {exerciseType === 'time_based' && (
                <Grid item xs={12} sm={6} md={6}>
                  <TextField
                    required
                    fullWidth
                    id="exerciseDuration"
                    label="Duration (MM:SS)"
                    placeholder="e.g., 01:30"
                    value={duration}
                    onChange={(e) => setDuration(e.target.value)}
                  />
                </Grid>
              )}
              
              <Grid item xs={12}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<AddIcon />}
                  onClick={handleCustomAddExercise}
                >
                  Add Exercise
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
