import React from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  IconButton,
  Paper,
  Tooltip
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TodayIcon from '@mui/icons-material/Today';
import DeleteIcon from '@mui/icons-material/Delete';
import { format, isToday } from 'date-fns';

/**
 * Weekly view for habit tracking
 */
const WeekView = ({ 
  habits, 
  dateRange, 
  isHabitCompleted, 
  getHabitNote, 
  handleToggleHabitLog, 
  openNoteEditor,
  handleDeleteHabit
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Habit</TableCell>
            {dateRange.map(date => (
              <TableCell key={date.toString()} align="center" 
                sx={isToday(date) ? { bgcolor: 'primary.light', color: 'white' } : {}}>
                <Typography variant="body2">{format(date, 'EEE')}</Typography>
                <Typography variant="subtitle2">{format(date, 'd MMM')}</Typography>
              </TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {habits.map(habit => (
            <TableRow key={habit.id}>
              <TableCell>
                <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Box 
                      sx={{ 
                        width: 12, 
                        height: 12, 
                        borderRadius: '50%', 
                        bgcolor: habit.color || '#2196f3',
                        mr: 1 
                      }} 
                    />
                    {habit.name}
                  </Box>
                  <Tooltip title="Delete habit">
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDeleteHabit(habit.id)}
                    >
                      <DeleteIcon fontSize="small" />
                    </IconButton>
                  </Tooltip>
                </Box>
              </TableCell>
              {dateRange.map(date => (
                <TableCell key={date.toString()} align="center">
                  <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                    <IconButton 
                      onClick={() => handleToggleHabitLog(habit, date)}
                      color={isHabitCompleted(habit, date) ? 'success' : 'default'}
                      sx={{ p: 1 }}
                    >
                      {isHabitCompleted(habit, date) ? 
                        <CheckCircleIcon /> : 
                        <CancelIcon sx={{ opacity: 0.3 }} />
                      }
                    </IconButton>
                    <Tooltip title={getHabitNote(habit, date) || 'Add note'}>
                      <IconButton 
                        size="small" 
                        onClick={() => openNoteEditor(habit, date)}
                        sx={getHabitNote(habit, date) ? { color: 'text.secondary' } : { opacity: 0.3 }}
                      >
                        <TodayIcon fontSize="small" />
                      </IconButton>
                    </Tooltip>
                  </Box>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default WeekView;
