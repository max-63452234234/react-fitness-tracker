import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Box,
  Typography,
  FormControlLabel,
  Radio,
  RadioGroup,
  Slider
} from '@mui/material';

/**
 * Form component for creating or editing habits
 */
const HabitForm = ({
  open,
  onClose,
  habitName,
  setHabitName,
  habitDescription,
  setHabitDescription,
  habitColor,
  setHabitColor,
  habitTrackingType = 'daily',
  setHabitTrackingType,
  targetPerDay = 1,
  setTargetPerDay,
  editMode,
  handleSaveHabit,
  colorOptions
}) => {
  // Local state for tracking type radio buttons
  const [localTrackingType, setLocalTrackingType] = useState(habitTrackingType);
  const [localTargetPerDay, setLocalTargetPerDay] = useState(targetPerDay);
  
  // Update local state when props change
  useEffect(() => {
    setLocalTrackingType(habitTrackingType);
    setLocalTargetPerDay(targetPerDay);
  }, [habitTrackingType, targetPerDay]);
  
  // Update parent state when form is submitted
  const handleSubmit = () => {
    if (setHabitTrackingType) setHabitTrackingType(localTrackingType);
    if (setTargetPerDay) setTargetPerDay(localTargetPerDay);
    handleSaveHabit();
  };
  
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editMode ? 'Edit Habit' : 'Add Habit'}
      </DialogTitle>
      <DialogContent>
        <TextField
          margin="normal"
          required
          fullWidth
          id="habitName"
          label="Habit Name"
          value={habitName}
          onChange={(e) => setHabitName(e.target.value)}
          placeholder="e.g., Exercise, Meditation, Reading, etc."
        />
        
        <TextField
          margin="normal"
          fullWidth
          id="habitDescription"
          label="Description (Optional)"
          value={habitDescription}
          onChange={(e) => setHabitDescription(e.target.value)}
          placeholder="Describe your habit..."
          multiline
          rows={2}
        />
        
        <FormControl fullWidth margin="normal">
          <InputLabel id="color-select-label">Color</InputLabel>
          <Select
            labelId="color-select-label"
            id="color-select"
            value={habitColor}
            label="Color"
            onChange={(e) => setHabitColor(e.target.value)}
          >
            {colorOptions.map(option => (
              <MenuItem key={option.value} value={option.value}>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <Box 
                    sx={{ 
                      width: 16, 
                      height: 16, 
                      borderRadius: '50%', 
                      bgcolor: option.value,
                      mr: 1 
                    }} 
                  />
                  {option.label}
                </Box>
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        
        {/* Tracking Type Section */}
        <Box sx={{ mt: 3 }}>
          <Typography variant="subtitle1" gutterBottom>
            Tracking Method
          </Typography>
          
          <RadioGroup
            aria-label="tracking-type"
            name="tracking-type"
            value={localTrackingType}
            onChange={(e) => setLocalTrackingType(e.target.value)}
          >
            <FormControlLabel 
              value="daily" 
              control={<Radio />} 
              label="Daily Completion (once per day)" 
            />
            <FormControlLabel 
              value="multiple" 
              control={<Radio />} 
              label="Multiple Times Per Day" 
            />
          </RadioGroup>
          
          {localTrackingType === 'multiple' && (
            <Box sx={{ mt: 2, px: 2 }}>
              <Typography id="target-per-day-slider" gutterBottom>
                Target Times Per Day: {localTargetPerDay}
              </Typography>
              <Slider
                value={localTargetPerDay}
                onChange={(e, newValue) => setLocalTargetPerDay(newValue)}
                aria-labelledby="target-per-day-slider"
                valueLabelDisplay="auto"
                step={1}
                marks
                min={1}
                max={10}
              />
            </Box>
          )}
        </Box>
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSubmit} variant="contained" color="primary">
          {editMode ? 'Update' : 'Save'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default HabitForm;
