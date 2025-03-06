import React from 'react';
import {
  Card,
  CardContent,
  CardActions,
  Typography,
  IconButton,
  Box,
  Chip,
  Collapse,
  List,
  ListItem,
  ListItemText,
  Divider,
  Button
} from '@mui/material';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
import styled from '@emotion/styled';

const ExpandMore = styled(({ expand, ...other }) => {
  return <IconButton {...other} />;
})(({ theme, expand }) => ({
  transform: !expand ? 'rotate(0deg)' : 'rotate(180deg)',
  transition: 'transform 0.3s',
}));

/**
 * Mobile-friendly workout card component
 * Shows workout details in an expandable card format
 * 
 * @param {Object} props - Component props
 * @param {Object} props.workout - Workout data object
 * @param {Array} props.exercises - Array of exercises for this workout
 * @param {Function} props.onEdit - Function to call when edit button is clicked
 * @param {Function} props.onDelete - Function to call when delete button is clicked
 * @param {Function} props.onAddExercise - Function to call when add exercise button is clicked
 * @param {Function} props.onViewExercises - Function to call when expand button is clicked
 * @param {Function} props.formatDate - Function to format date strings
 * @param {Function} props.formatDuration - Function to format duration in seconds to MM:SS
 */
const MobileWorkoutCard = ({
  workout,
  exercises,
  onEdit,
  onDelete,
  onAddExercise,
  formatDate,
  formatDuration,
  expanded,
  onExpand
}) => {
  // Helper function to create details string for different exercise types
  const getExerciseDetails = (exercise) => {
    if (!exercise.exercise_type || exercise.exercise_type === 'weight_based') {
      return `${exercise.sets} × ${exercise.reps} ${exercise.weight ? '@ ' + exercise.weight + ' kg' : ''}`;
    } else if (exercise.exercise_type === 'cardio_distance') {
      return `${exercise.distance} ${exercise.distance_unit} ${exercise.duration ? '• ' + formatDuration(exercise.duration) : ''}`;
    } else if (exercise.exercise_type === 'cardio_time') {
      return `${formatDuration(exercise.duration)} ${exercise.intensity ? '• ' + exercise.intensity + ' intensity' : ''}`;
    } else if (exercise.exercise_type === 'time_based') {
      return formatDuration(exercise.duration);
    }
    return '';
  };

  // Count exercises by type
  const exerciseCounts = exercises.reduce((counts, exercise) => {
    const type = exercise.exercise_type || 'weight_based';
    counts[type] = (counts[type] || 0) + 1;
    return counts;
  }, {});

  return (
    <Card 
      sx={{
        mb: 2,
        border: expanded ? 2 : 1,
        borderColor: expanded ? 'primary.main' : 'divider'
      }}
      elevation={expanded ? 3 : 1}
    >
      <CardContent sx={{ pb: 0 }}>
        <Box display="flex" justifyContent="space-between" alignItems="center">
          <Typography variant="h6">
            {formatDate(workout.date)}
          </Typography>
          <Box>
            <IconButton
              size="small"
              color="primary"
              onClick={() => onEdit(workout)}
              aria-label="edit workout"
            >
              <EditIcon />
            </IconButton>
            <IconButton
              size="small"
              color="error"
              onClick={() => onDelete(workout.id)}
              aria-label="delete workout"
            >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
        
        {workout.notes && (
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {workout.notes}
          </Typography>
        )}
        
        <Box display="flex" flexWrap="wrap" gap={1} mt={2}>
          {Object.entries(exerciseCounts).map(([type, count]) => {
            let label = '';
            let color = 'primary';
            
            switch(type) {
              case 'weight_based':
                label = `${count} Weight`;
                color = 'primary';
                break;
              case 'cardio_distance':
                label = `${count} Distance`;
                color = 'success';
                break;
              case 'cardio_time':
                label = `${count} Cardio`;
                color = 'warning';
                break;
              case 'time_based':
                label = `${count} Timed`;
                color = 'info';
                break;
              default:
                label = `${count} Other`;
            }
            
            return (
              <Chip 
                key={type}
                icon={<FitnessCenterIcon />}
                label={label}
                size="small"
                color={color}
                variant="outlined"
              />
            );
          })}
        </Box>
      </CardContent>
      
      <CardActions disableSpacing>
        <Button
          startIcon={<AddIcon />}
          size="small"
          onClick={() => onAddExercise(workout)}
        >
          Add Exercise
        </Button>
        <Box flexGrow={1} />
        <ExpandMore
          expand={expanded}
          onClick={() => onExpand(workout.id)}
          aria-expanded={expanded}
          aria-label="show exercises"
        >
          <ExpandMoreIcon />
        </ExpandMore>
      </CardActions>
      
      <Collapse in={expanded} timeout="auto" unmountOnExit>
        <CardContent sx={{ pt: 0 }}>
          <Typography variant="subtitle2" gutterBottom sx={{ mt: 1 }}>
            Exercises ({exercises.length})
          </Typography>
          
          {exercises.length > 0 ? (
            <List dense disablePadding>
              {exercises.map((exercise) => (
                <React.Fragment key={exercise.id}>
                  <ListItem 
                    disablePadding
                    sx={{ py: 0.5 }}
                  >
                    <ListItemText
                      primary={exercise.name}
                      secondary={getExerciseDetails(exercise)}
                      primaryTypographyProps={{
                        variant: 'body2',
                        fontWeight: 500
                      }}
                      secondaryTypographyProps={{
                        variant: 'body2'
                      }}
                    />
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          ) : (
            <Typography variant="body2" color="text.secondary" sx={{ py: 2 }}>
              No exercises added yet. Click "Add Exercise" to get started!
            </Typography>
          )}
        </CardContent>
      </Collapse>
    </Card>
  );
};

export default MobileWorkoutCard;
