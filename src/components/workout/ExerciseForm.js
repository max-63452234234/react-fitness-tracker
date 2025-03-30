import React, { useState, useMemo, useCallback } from 'react'; // Removed useEffect
import {
  Grid,
  TextField,
  Button,
  Box,
  // Typography, // Removed unused
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Paper,
  useMediaQuery,
  useTheme,
  Tabs,
  Tab,
  Autocomplete,
  IconButton,
  Stack,
  // Removed CircularProgress import
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import DirectionsRunIcon from '@mui/icons-material/DirectionsRun';
import TimerIcon from '@mui/icons-material/Timer';
import StraightenIcon from '@mui/icons-material/Straighten';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import RemoveCircleOutlineIcon from '@mui/icons-material/RemoveCircleOutline';

// REMOVED stepperAdornment helper function

/**
 * ExerciseForm component
 * Mobile-friendly form for adding exercises to a workout with Autocomplete and steppers
 * @param {Function} props.onAddExercise - Callback function when an exercise is added
 * @param {boolean} props.disabled - Whether the form fields are disabled
 * @param {Array} props.commonExercises - List of common exercises for Autocomplete
 */
const ExerciseForm = ({ onAddExercise, commonExercises = [], disabled = false }) => { // Restored commonExercises prop
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [activeTab, setActiveTab] = useState(0);
  const [name, setName] = useState('');
  const [autoCompleteValue, setAutoCompleteValue] = useState(null);
  const [exerciseType, setExerciseType] = useState('weight_based');

  // Fields
  const [sets, setSets] = useState('');
  const [reps, setReps] = useState('');
  const [weight, setWeight] = useState('');
  const [distance, setDistance] = useState('');
  const [distanceUnit, setDistanceUnit] = useState('km');
  const [duration, setDuration] = useState(''); // Store as seconds internally (string)
  const [intensity, setIntensity] = useState('');
  const [errors, setErrors] = useState({});
  // Removed API state variables

  // console.log("ExerciseForm rendering..."); // Keep log for debugging if needed

  // Process commonExercises prop for Autocomplete options
  const autocompleteOptions = useMemo(() =>
    commonExercises.map(ex => ({ label: ex.name, id: ex.id, category: ex.category })),
    [commonExercises]
  );

  // REMOVED API useEffect hook

  const validate = () => {
    const newErrors = {}; // Define newErrors locally
    if (!name || !name.trim()) { newErrors.name = 'Exercise name is required'; }
    if (exerciseType === 'weight_based') {
      if (!sets || isNaN(sets) || parseInt(sets) <= 0) { newErrors.sets = 'Enter valid sets'; }
      if (!reps || isNaN(reps) || parseInt(reps) <= 0) { newErrors.reps = 'Enter valid reps'; }
      if (weight && (isNaN(weight) || parseFloat(weight) < 0)) { newErrors.weight = 'Enter valid weight'; }
    } else if (exerciseType === 'cardio_distance') {
      if (!distance || isNaN(distance) || parseFloat(distance) <= 0) { newErrors.distance = 'Enter valid distance'; }
      if (!distanceUnit) { newErrors.distanceUnit = 'Select unit'; }
      const durationNum = parseInt(duration);
      if (duration && (isNaN(durationNum) || durationNum < 0)) { newErrors.duration = 'Enter valid duration'; }
    } else if (exerciseType === 'cardio_time' || exerciseType === 'time_based') {
      const durationNum = parseInt(duration);
      if (isNaN(durationNum) || durationNum <= 0) { newErrors.duration = 'Enter valid duration (> 0)'; }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validate()) return;
    const exerciseData = { name: name.trim(), exercise_type: exerciseType };
    if (exerciseType === 'weight_based') {
      exerciseData.sets = parseInt(sets); exerciseData.reps = parseInt(reps); exerciseData.weight = weight ? parseFloat(weight) : 0;
    } else if (exerciseType === 'cardio_distance') {
      exerciseData.distance = parseFloat(distance); exerciseData.distance_unit = distanceUnit; exerciseData.duration = duration ? parseInt(duration) : null;
    } else if (exerciseType === 'cardio_time') {
      exerciseData.duration = parseInt(duration); exerciseData.intensity = intensity || null;
    } else if (exerciseType === 'time_based') {
      exerciseData.duration = parseInt(duration);
    }
    onAddExercise(exerciseData);
    // Reset form
    setName(''); setAutoCompleteValue(null);
    setSets(''); setReps(''); setWeight(''); setDistance(''); setDuration(''); setIntensity(''); setErrors({});
  };

  // --- Specific Stepper Handlers (Memoized - Refactored) ---
  const incrementSets = useCallback(() => {
    setSets(prev => String(Math.max(1, (parseInt(prev) || 0) + 1)));
  }, []);

  const decrementSets = useCallback(() => {
    setSets(prev => String(Math.max(1, (parseInt(prev) || 1) - 1))); // Ensure min 1 even when decrementing from empty
  }, []);

  const incrementReps = useCallback(() => {
    setReps(prev => String(Math.max(1, (parseInt(prev) || 0) + 1)));
  }, []);

  const decrementReps = useCallback(() => {
    setReps(prev => String(Math.max(1, (parseInt(prev) || 1) - 1))); // Ensure min 1
  }, []);

  const incrementWeight = useCallback(() => {
    setWeight(prev => {
        const newValue = Math.max(0, (parseFloat(prev) || 0) + 0.5);
        return parseFloat(newValue.toFixed(1)).toString(); // Handle precision
    });
  }, []);

  const decrementWeight = useCallback(() => {
    setWeight(prev => {
        const newValue = Math.max(0, (parseFloat(prev) || 0) - 0.5);
        return parseFloat(newValue.toFixed(1)).toString(); // Handle precision
    });
  }, []);

  const incrementDistance = useCallback(() => {
    setDistance(prev => {
        const newValue = Math.max(0, (parseFloat(prev) || 0) + 0.1);
        return parseFloat(newValue.toFixed(1)).toString(); // Handle precision
    });
  }, []);

  const decrementDistance = useCallback(() => {
    setDistance(prev => {
        const newValue = Math.max(0, (parseFloat(prev) || 0) - 0.1);
        return parseFloat(newValue.toFixed(1)).toString(); // Handle precision
    });
  }, []);

  const handleDurationStep = useCallback((secondsToAdd) => {
      setDuration(prev => {
          const currentSeconds = parseInt(prev) || 0;
          const newSeconds = Math.max(0, currentSeconds + secondsToAdd);
          return newSeconds.toString();
      });
  }, []);

  // --- Duration Formatting/Parsing ---
  const formatDurationDisplay = (totalSeconds) => {
    if (!totalSeconds && totalSeconds !== 0) return '';
    const valueAsNumber = parseInt(totalSeconds);
    if (isNaN(valueAsNumber)) return '';
    const minutes = Math.floor(valueAsNumber / 60);
    const remainingSeconds = valueAsNumber % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const parseTimeToSeconds = (timeStr) => {
    if (!timeStr) return '';
    let totalSeconds = 0;
    if (timeStr.includes(':')) {
      const parts = timeStr.split(':');
      const minutes = parseInt(parts[0]) || 0; const seconds = parseInt(parts[1]) || 0;
      totalSeconds = minutes * 60 + seconds;
    } else {
      const minutes = parseInt(timeStr);
      if (!isNaN(minutes)) { totalSeconds = minutes * 60; } else { return ''; }
    }
    return totalSeconds.toString(); // Return as string
  };

  // Wrap in useCallback
  const handleDurationChange = useCallback((e) => {
      const inputStr = e.target.value;
      if (/^[0-9:]*$/.test(inputStr)) {
          const secondsValue = parseTimeToSeconds(inputStr);
          setDuration(secondsValue);
      }
  }, []);

  // --- Autocomplete Handlers (Original) ---
  const handleAutocompleteInputChange = useCallback((event, newInputValue) => {
      // Update the name state directly when user types
      setName(newInputValue);
  }, []); // Depends only on setName which is stable

  const handleAutocompleteChange = useCallback((event, newValue) => {
      // Handles selection from list or pressing Enter
      setAutoCompleteValue(newValue); // Update selected value state
      if (typeof newValue === 'string') {
          setName(newValue); // User typed and pressed Enter
      } else if (newValue && newValue.label) {
          setName(newValue.label); // User selected from list
      } else {
          // Handles clearing the input
          setAutoCompleteValue(null);
          // Keep name as potentially typed value unless explicitly cleared elsewhere if needed
      }
  }, []); // Depends on setAutoCompleteValue and setName which are stable


  // --- Tab Handling ---
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
    // Set exercise type based on the new tab index
    switch(newValue) {
      case 0: setExerciseType('weight_based'); break;
      case 1: setExerciseType('cardio_distance'); break;
      case 2: setExerciseType('cardio_time'); break;
      case 3: setExerciseType('time_based'); break;
      default: setExerciseType('weight_based');
    }
  };

  // --- Render ---
  return (
      <Paper elevation={isMobile ? 0 : 1} sx={{ p: isMobile ? 1 : 2, border: isMobile ? 'none' : `1px solid ${theme.palette.divider}`, mt: 2 }}>
        <Box component="form" onSubmit={handleSubmit} noValidate>
          <Grid container spacing={isMobile ? 2 : 2}>
            {/* Autocomplete (Reverted) */}
            <Grid item xs={12}>
              <Autocomplete
                freeSolo // Allow custom input
                id="exercise-name-autocomplete"
                options={autocompleteOptions.sort((a, b) => { // Ensure options are sorted for grouping
                    // Sort primarily by body_region, then category
                    const regionCompare = (a.body_region || 'Other').localeCompare(b.body_region || 'Other');
                    if (regionCompare !== 0) return regionCompare;
                    return (a.category || '').localeCompare(b.category || '');
                })}
                groupBy={(option) => option.body_region ? `${option.body_region} - ${option.category}` : `Other - ${option.category}`} // Group by region then category
                getOptionLabel={(option) => (typeof option === 'string' ? option : option.label || "")}
                // filterOptions is default
                value={autoCompleteValue} // Controlled value for selected item
                // Use original handlers
                onInputChange={handleAutocompleteInputChange}
                onChange={handleAutocompleteChange}
                // Removed loading prop
                renderInput={(params) => (
                  <TextField
                    {...params}
                    required
                    label="Exercise Name"
                    placeholder="e.g., Bench Press or select" // Original placeholder
                    error={!!errors.name}
                    helperText={errors.name}
                    size={isMobile ? "medium" : "small"}
                    margin="dense"
                    // Removed loading indicator from InputProps
                  />
                )}
                disabled={disabled}
                sx={{ mb: isMobile ? 1 : 2 }}
              />
            </Grid>

            {/* Tabs or Select for Exercise Type */}
            {isMobile ? ( <Grid item xs={12}> <Tabs value={activeTab} onChange={handleTabChange} variant="fullWidth" indicatorColor="primary" textColor="primary" aria-label="exercise type tabs" sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }} disabled={disabled}> <Tab icon={<FitnessCenterIcon />} label="Weights" disabled={disabled}/> <Tab icon={<StraightenIcon />} label="Distance" disabled={disabled}/> <Tab icon={<DirectionsRunIcon />} label="Cardio" disabled={disabled}/> <Tab icon={<TimerIcon />} label="Time" disabled={disabled}/> </Tabs> </Grid>
            ) : ( <Grid item xs={12}> <FormControl fullWidth sx={{ mb: 2 }} size={isMobile ? "medium" : "small"} disabled={disabled}> <InputLabel id="exercise-type-label">Exercise Type</InputLabel> <Select labelId="exercise-type-label" id="exercise-type" value={exerciseType} label="Exercise Type" onChange={(e) => setExerciseType(e.target.value)}> <MenuItem value="weight_based">Weight Based</MenuItem> <MenuItem value="cardio_distance">Cardio (Distance)</MenuItem> <MenuItem value="cardio_time">Cardio (Time)</MenuItem> <MenuItem value="time_based">Other (Time)</MenuItem> </Select> </FormControl> </Grid> )}

            {/* --- Fields based on exercise type --- */}
            {/* Weight Based Fields */}
            {exerciseType === 'weight_based' && (
              <Grid item xs={12}>
                <Grid container spacing={1}>
                  <Grid item xs={4}>
                    <TextField required fullWidth id="sets" label="Sets" type="number"
                      value={sets} onChange={(e) => setSets(e.target.value)} error={!!errors.sets} helperText={errors.sets}
                      size={isMobile ? "medium" : "small"} disabled={disabled} margin="dense"
                      InputProps={{ // Define InputProps directly
                          inputProps: { min: 1, step: 1 }, // Keep inputProps for native behavior
                          startAdornment: ( <InputAdornment position="start"> <IconButton onClick={decrementSets} edge="start" size="small" disabled={disabled} aria-label="decrease sets"> <RemoveCircleOutlineIcon fontSize="small" /> </IconButton> </InputAdornment> ),
                          endAdornment: ( <InputAdornment position="end"> <IconButton onClick={incrementSets} edge="end" size="small" disabled={disabled} aria-label="increase sets"> <AddCircleOutlineIcon fontSize="small" /> </IconButton> </InputAdornment> ),
                      }} />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField required fullWidth id="reps" label="Reps" type="number"
                      value={reps} onChange={(e) => setReps(e.target.value)} error={!!errors.reps} helperText={errors.reps}
                      size={isMobile ? "medium" : "small"} disabled={disabled} margin="dense"
                      InputProps={{ // Define InputProps directly
                          inputProps: { min: 1, step: 1 },
                          startAdornment: ( <InputAdornment position="start"> <IconButton onClick={decrementReps} edge="start" size="small" disabled={disabled} aria-label="decrease reps"> <RemoveCircleOutlineIcon fontSize="small" /> </IconButton> </InputAdornment> ),
                          endAdornment: ( <InputAdornment position="end"> <IconButton onClick={incrementReps} edge="end" size="small" disabled={disabled} aria-label="increase reps"> <AddCircleOutlineIcon fontSize="small" /> </IconButton> </InputAdornment> ),
                      }} />
                  </Grid>
                  <Grid item xs={4}>
                    <TextField fullWidth id="weight" label="Weight" type="number"
                      value={weight} onChange={(e) => setWeight(e.target.value)} error={!!errors.weight} helperText={errors.weight}
                      size={isMobile ? "medium" : "small"} disabled={disabled} margin="dense"
                      InputProps={{ // Define InputProps directly
                          inputProps: { min: 0, step: 0.5 },
                          startAdornment: ( <InputAdornment position="start"> <IconButton onClick={decrementWeight} edge="start" size="small" disabled={disabled} aria-label="decrease weight"> <RemoveCircleOutlineIcon fontSize="small" /> </IconButton> </InputAdornment> ),
                          endAdornment: ( <> <IconButton onClick={incrementWeight} edge="end" size="small" disabled={disabled} aria-label="increase weight"> <AddCircleOutlineIcon fontSize="small" /> </IconButton> <InputAdornment position="end">kg</InputAdornment> </> ),
                      }} />
                  </Grid>
                </Grid>
              </Grid>
            )}

            {/* Cardio Distance Fields */}
            {exerciseType === 'cardio_distance' && (
              <Grid item xs={12}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={12} sm={5}>
                    <TextField required fullWidth id="distance" label="Distance" type="number"
                      value={distance} onChange={(e) => setDistance(e.target.value)} error={!!errors.distance} helperText={errors.distance}
                      size={isMobile ? "medium" : "small"} disabled={disabled} margin="dense"
                      InputProps={{ // Define InputProps directly
                          inputProps: { min: 0, step: 0.1 },
                          startAdornment: ( <InputAdornment position="start"> <IconButton onClick={decrementDistance} edge="start" size="small" disabled={disabled} aria-label="decrease distance"> <RemoveCircleOutlineIcon fontSize="small" /> </IconButton> </InputAdornment> ),
                          endAdornment: ( <InputAdornment position="end"> <IconButton onClick={incrementDistance} edge="end" size="small" disabled={disabled} aria-label="increase distance"> <AddCircleOutlineIcon fontSize="small" /> </IconButton> </InputAdornment> ),
                      }} />
                  </Grid>
                  <Grid item xs={6} sm={3}>
                    <FormControl fullWidth size={isMobile ? "medium" : "small"} disabled={disabled} margin="dense">
                      <InputLabel id="distance-unit-label">Unit</InputLabel>
                      <Select labelId="distance-unit-label" id="distance-unit" value={distanceUnit} label="Unit" onChange={(e) => setDistanceUnit(e.target.value)}>
                        <MenuItem value="km">km</MenuItem> <MenuItem value="mi">mi</MenuItem> <MenuItem value="m">m</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={6} sm={4}>
                     <Stack direction="row" spacing={0.5} alignItems="center">
                         <TextField fullWidth id="duration-dist" label="Time (MM:SS)" placeholder="Optional"
                           value={formatDurationDisplay(duration)} onChange={handleDurationChange}
                           error={!!errors.duration} helperText={errors.duration}
                           size={isMobile ? "medium" : "small"} disabled={disabled} margin="dense"/>
                         <IconButton onClick={() => handleDurationStep(-30)} size="small" disabled={disabled} aria-label="decrease duration 30s"><RemoveCircleOutlineIcon fontSize="inherit"/></IconButton>
                         <IconButton onClick={() => handleDurationStep(30)} size="small" disabled={disabled} aria-label="increase duration 30s"><AddCircleOutlineIcon fontSize="inherit"/></IconButton>
                     </Stack>
                  </Grid>
                </Grid>
              </Grid>
            )}

            {/* Cardio Time Fields */}
            {exerciseType === 'cardio_time' && (
              <Grid item xs={12}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={6} sm={6}>
                     <Stack direction="row" spacing={0.5} alignItems="center">
                         <TextField required fullWidth id="duration-time" label="Duration (MM:SS)" placeholder="e.g., 30:00"
                           value={formatDurationDisplay(duration)} onChange={handleDurationChange}
                           error={!!errors.duration} helperText={errors.duration}
                           size={isMobile ? "medium" : "small"} disabled={disabled} margin="dense"/>
                         <IconButton onClick={() => handleDurationStep(-60)} size="small" disabled={disabled} aria-label="decrease duration 1 min"><RemoveCircleOutlineIcon fontSize="inherit"/></IconButton>
                         <IconButton onClick={() => handleDurationStep(60)} size="small" disabled={disabled} aria-label="increase duration 1 min"><AddCircleOutlineIcon fontSize="inherit"/></IconButton>
                     </Stack>
                  </Grid>
                  <Grid item xs={6} sm={6}>
                    <FormControl fullWidth size={isMobile ? "medium" : "small"} disabled={disabled} margin="dense">
                      <InputLabel id="intensity-label">Intensity</InputLabel>
                      <Select labelId="intensity-label" id="intensity" value={intensity} label="Intensity" onChange={(e) => setIntensity(e.target.value)}>
                        <MenuItem value=""><em>Optional</em></MenuItem> <MenuItem value="low">Low</MenuItem> <MenuItem value="medium">Medium</MenuItem> <MenuItem value="high">High</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                </Grid>
              </Grid>
            )}

            {/* Time Based Fields */}
            {exerciseType === 'time_based' && (
              <Grid item xs={12}>
                <Grid container spacing={1} alignItems="center">
                  <Grid item xs={12} sm={6}>
                     <Stack direction="row" spacing={0.5} alignItems="center">
                         <TextField required fullWidth id="duration-other" label="Duration (MM:SS)" placeholder="e.g., 01:30"
                           value={formatDurationDisplay(duration)} onChange={handleDurationChange}
                           error={!!errors.duration} helperText={errors.duration}
                           size={isMobile ? "medium" : "small"} disabled={disabled} margin="dense"/>
                         <IconButton onClick={() => handleDurationStep(-30)} size="small" disabled={disabled} aria-label="decrease duration 30s"><RemoveCircleOutlineIcon fontSize="inherit"/></IconButton>
                         <IconButton onClick={() => handleDurationStep(30)} size="small" disabled={disabled} aria-label="increase duration 30s"><AddCircleOutlineIcon fontSize="inherit"/></IconButton>
                     </Stack>
                  </Grid>
                </Grid>
              </Grid>
            )}

            <Grid item xs={12} sx={{ mt: 2 }}>
              <Button type="submit" variant="contained" color="primary" startIcon={<AddIcon />}
                fullWidth={isMobile} size={isMobile ? "large" : "medium"} sx={isMobile ? { py: 1.5 } : {}}
                disabled={disabled}
              >
                Add Exercise to Workout
              </Button>
            </Grid>
          </Grid>
        </Box>
      </Paper>
  );
};

export default ExerciseForm;
