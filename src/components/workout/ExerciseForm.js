import React, { useState, useEffect } from 'react';
import {
  Grid,
  TextField,
  Button,
  Box,
  Typography,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Paper,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import TimerIcon from '@mui/icons-material/Timer';
import StraightenIcon from '@mui/icons-material/Straighten';

/**
 * ExerciseForm component
 * Mobile-friendly form for adding exercises to a workout
 * 
 * @param {Object} props - Component props
 * @param {Function} props.onAddExercise - Function to call when adding an exercise
 * @param {Function} props.commonExercises - List of predefined exercises
 */
const ExerciseForm = ({ onAddExercise, commonExercises = [] }) => {
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [name, setName] = useState('');
  const [exerciseType, setExerciseType] = useState('weight_based');
  
  // Weight-based fields
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  
  // Cardio distance fields
  const [distance, setDistance] = useState('');
  const [distanceUnit, setDistanceUnit] = useState('km');
  
  // Cardio time fields
  const [duration, setDuration] = useState('');
  const [intensity, setIntensity] = useState('');
  
  const [errors, setErrors] = useState({});

  // Get exercise default type when name changes
  useEffect(() => {
    if (name && commonExercises.length > 0) {
      const exercise = commonExercises.find(ex => ex.name.toLowerCase() === name.toLowerCase());
      if (exercise && exercise.default_type) {
        setExerciseType(exercise.default_type);
      }
    }
  }, [name, commonExercises]);
  
  const validate = () => {
    const newErrors = {};
    
    if (!name.trim()) {
      newErrors.name = 'Exercise name is required';
    }
    
    // Validate based on exercise type
    if (exerciseType === 'weight_based') {
      if (!sets || isNaN(sets) || parseInt(sets) <= 0) {
        newErrors.sets = 'Enter a valid number of sets';
      }
      
      if (!reps || isNaN(reps) || parseInt(reps) <= 0) {
        newErrors.reps = 'Enter a valid number of reps';
      }
      
      // Weight can be 0 or empty (bodyweight exercises)
      if (weight && (isNaN(weight) || parseFloat(weight) < 0)) {
        newErrors.weight = 'Enter a valid weight';
      }
    } else if (exerciseType === 'cardio_distance') {
      if (!distance || isNaN(distance) || parseFloat(distance) <= 0) {
        newErrors.distance = 'Enter a valid distance';
      }
      
      if (!distanceUnit) {
        newErrors.distanceUnit = 'Select a unit';
      }
      
      if (duration && (isNaN(duration) || parseInt(duration) <= 0)) {
        newErrors.duration = 'Enter a valid duration';
      }
    } else if (exerciseType === 'cardio_time' || exerciseType === 'time_based') {
      if (!duration || isNaN(duration) || parseInt(duration) <= 0) {
        newErrors.duration = 'Enter a valid duration';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!validate()) {
      return;
    }
    
    const exerciseData = {
      name: name.trim(),
      exercise_type: exerciseType
    };
    
    // Add type-specific fields
    if (exerciseType === 'weight_based') {
      exerciseData.sets = parseInt(sets);
      exerciseData.reps = parseInt(reps);
      exerciseData.weight = weight ? parseFloat(weight) : 0;
    } else if (exerciseType === 'cardio_distance') {
      exerciseData.distance = parseFloat(distance);
      exerciseData.distance_unit = distanceUnit;
      exerciseData.duration = duration ? parseInt(duration) : null;
    } else if (exerciseType === 'cardio_time') {
      exerciseData.duration = parseInt(duration);
      exerciseData.intensity = intensity || null;
    } else if (exerciseType === 'time_based') {
      exerciseData.duration = parseInt(duration);
    }
    
    onAddExercise(exerciseData);
    
    // Reset form
    setName('');
    setSets('');
    setReps('');
    setWeight('');
    setDistance('');
    setDuration('');
    setIntensity('');
    setErrors({});
  };
  
  // Convert minutes to seconds for display
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
      return minutes * 60 + seconds;
    } else {
      return parseInt(timeStr) * 60; // If only number entered, assume minutes
    }
  };

  // Handle tab change for mobile
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    
    // Set exercise type based on tab
    switch(newValue) {
      case 0:
        setExerciseType('weight_based');
        break;
      case 1:
        setExerciseType('cardio_distance');
        break;
      case 2:
        setExerciseType('cardio_time');
        break;
      case 3:
        setExerciseType('time_based');
        break;
      default:
        setExerciseType('weight_based');
    }
  };
  
  // Update tab when exercise type changes
  useEffect(() => {
    switch(exerciseType) {
      case 'weight_based':
        setActiveTab(0);
        break;
      case 'cardio_distance':
        setActiveTab(1);
        break;
      case 'cardio_time':
        setActiveTab(2);
        break;
      case 'time_based':
        setActiveTab(3);
        break;
      default:
        setActiveTab(0);
    }
  }, [exerciseType]);

  return (
      <Box sx={{ mt: 4 }}>
        <Paper 
          elevation={isMobile ? 0 : 2} 
          sx={{ 
            p: isMobile ? 1 : 3,
            borderRadius: isMobile ? 0 : 2
          }}
        >
          <Typography variant="h6" gutterBottom>
            Add Exercise
          </Typography>
          
          <Box component="form" onSubmit={handleSubmit}>
          <Grid container spacing={isMobile ? 2 : 3}>
            <Grid item xs={12}>
              <TextField
                required
                fullWidth
                id="exercise-name"
                label="Exercise Name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                error={!!errors.name}
                helperText={errors.name}
                placeholder="e.g., Bench Press"
                size={isMobile ? "medium" : "small"}
                sx={{ mb: 2 }}
              />
            </Grid>
            
            {isMobile ? (
              <Grid item xs={12}>
                <Tabs
                  value={activeTab}
                  onChange={handleTabChange}
                  variant="fullWidth"
                  indicatorColor="primary"
                  textColor="primary"
                  aria-label="exercise type tabs"
                  sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
                >
                  <Tab icon={<FitnessCenterIcon />} label="Weights" />
                  <Tab icon={<StraightenIcon />} label="Distance" />
                  <Tab icon={<DirectionsRunIcon />} label="Cardio" />
                  <Tab icon={<TimerIcon />} label="Time" />
                </Tabs>
              </Grid>
            ) : (
              <Grid item xs={12}>
                <FormControl fullWidth sx={{ mb: 3 }}>
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
            )}
          
          {/* Show fields based on exercise type */}
            {/* Weight Based Fields */}
            {exerciseType === 'weight_based' && (
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={isMobile ? 4 : 4}>
                  <TextField
                    required
                    fullWidth
                    id="sets"
                    label="Sets"
                    type="number"
                    inputProps={{ min: 1 }}
                    value={sets}
                    onChange={(e) => setSets(e.target.value)}
                    error={!!errors.sets}
                    helperText={errors.sets}
                    size={isMobile ? "medium" : "small"}
                  />
                </Grid>
                
                <Grid item xs={isMobile ? 4 : 4}>
                  <TextField
                    required
                    fullWidth
                    id="reps"
                    label="Reps"
                    type="number"
                    inputProps={{ min: 1 }}
                    value={reps}
                    onChange={(e) => setReps(e.target.value)}
                    error={!!errors.reps}
                    helperText={errors.reps}
                    size={isMobile ? "medium" : "small"}
                  />
                </Grid>
                
                <Grid item xs={isMobile ? 4 : 4}>
                  <TextField
                    fullWidth
                    id="weight"
                    label="Weight"
                    type="number"
                    inputProps={{ min: 0, step: 0.5 }}
                    value={weight}
                    onChange={(e) => setWeight(e.target.value)}
                    error={!!errors.weight}
                    helperText={errors.weight}
                    InputProps={{
                      endAdornment: <InputAdornment position="end">kg</InputAdornment>,
                    }}
                    size={isMobile ? "medium" : "small"}
                  />
                </Grid>
              </Grid>
            )}
          
          {/* Fields are now handled in the grid containers below */}
          
            {/* Cardio Distance Fields */}
            {exerciseType === 'cardio_distance' && (
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={isMobile ? 12 : 4} sm={4}>
                  <TextField
                    required
                    fullWidth
                    id="distance"
                    label="Distance"
                    type="number"
                    inputProps={{ min: 0, step: 0.1 }}
                    value={distance}
                    onChange={(e) => setDistance(e.target.value)}
                    error={!!errors.distance}
                    helperText={errors.distance}
                    size={isMobile ? "medium" : "small"}
                    sx={{ mb: isMobile ? 2 : 0 }}
                  />
                </Grid>
                
                <Grid item xs={isMobile ? 6 : 4} sm={4}>
                  <FormControl fullWidth>
                    <InputLabel id="distance-unit-label">Unit</InputLabel>
                    <Select
                      labelId="distance-unit-label"
                      id="distance-unit"
                      value={distanceUnit}
                      label="Unit"
                      onChange={(e) => setDistanceUnit(e.target.value)}
                      size={isMobile ? "medium" : "small"}
                    >
                      <MenuItem value="km">Kilometers</MenuItem>
                      <MenuItem value="mi">Miles</MenuItem>
                      <MenuItem value="m">Meters</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
                
                <Grid item xs={isMobile ? 6 : 4} sm={4}>
                  <TextField
                    fullWidth
                    id="duration"
                    label="Duration (MM:SS)"
                    placeholder="e.g., 30:00"
                    value={duration ? formatDuration(duration) : ''}
                    onChange={(e) => setDuration(parseTimeToSeconds(e.target.value))}
                    error={!!errors.duration}
                    helperText={errors.duration}
                    size={isMobile ? "medium" : "small"}
                  />
                </Grid>
              </Grid>
            )}
            
            {/* Cardio Time Fields */}
            {exerciseType === 'cardio_time' && (
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={isMobile ? 6 : 4} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="duration"
                    label="Duration (MM:SS)"
                    placeholder="e.g., 30:00"
                    value={duration ? formatDuration(duration) : ''}
                    onChange={(e) => setDuration(parseTimeToSeconds(e.target.value))}
                    error={!!errors.duration}
                    helperText={errors.duration}
                    size={isMobile ? "medium" : "small"}
                  />
                </Grid>
                
                <Grid item xs={isMobile ? 6 : 4} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="intensity-label">Intensity</InputLabel>
                    <Select
                      labelId="intensity-label"
                      id="intensity"
                      value={intensity}
                      label="Intensity"
                      onChange={(e) => setIntensity(e.target.value)}
                      size={isMobile ? "medium" : "small"}
                    >
                      <MenuItem value="low">Low</MenuItem>
                      <MenuItem value="medium">Medium</MenuItem>
                      <MenuItem value="high">High</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
            )}
            
            {/* Time Based Fields */}
            {exerciseType === 'time_based' && (
              <Grid container spacing={2} sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    required
                    fullWidth
                    id="duration"
                    label="Duration (MM:SS)"
                    placeholder="e.g., 01:30"
                    value={duration ? formatDuration(duration) : ''}
                    onChange={(e) => setDuration(parseTimeToSeconds(e.target.value))}
                    error={!!errors.duration}
                    helperText={errors.duration}
                    size={isMobile ? "medium" : "small"}
                  />
                </Grid>
              </Grid>
            )}
            
            <Grid item xs={12} sx={{ mt: isMobile ? 3 : 2 }}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                fullWidth={isMobile}
                size={isMobile ? "large" : "medium"}
                sx={isMobile ? { py: 1.5 } : {}}
              >
                Add Exercise
              </Button>
            </Grid>
          </Grid>
          </Box>
        </Paper>
      </Box>
  );
};

export default ExerciseForm;
