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
  Tooltip,
  Badge,
  Chip,
  LinearProgress
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import TodayIcon from '@mui/icons-material/Today';
import DeleteIcon from '@mui/icons-material/Delete';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import { format, isToday } from 'date-fns';
import { getHabitCount as getCount } from '../utils/habitUtils';

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
  handleDeleteHabit,
  handleDecrementHabitCount,
  habitLogs = []
}) => {
  // For backward compatibility
  const getHabitCount = getCount;
  
  // Call the parent component's handler for decrementing
  const handleDecrement = (habit, date) => {
    if (getCount(habit, date, habitLogs) > 0) {
      handleDecrementHabitCount(habit, date);
    }
  };
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Habit</Typography>
            </TableCell>
            {dateRange.map(date => (
              <TableCell key={date.toString()} align="center" 
                sx={isToday(date) ? { bgcolor: 'primary.light', color: 'white' } : {}}>
                <Typography variant="body1" sx={{ fontWeight: 'medium' }}>{format(date, 'EEE')}</Typography>
                <Typography variant="h6">{format(date, 'd MMM')}</Typography>
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
                        width: 16, 
                        height: 16, 
                        borderRadius: '50%', 
                        bgcolor: habit.color || '#2196f3',
                        mr: 1 
                      }} 
                    />
                    <Typography variant="body1" sx={{ fontWeight: 'medium' }}>
                      {habit.name}
                    </Typography>
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
                    {habit.tracking_type === 'multiple' ? (
                      <>
                        {/* Multiple tracking type UI */}
                        <Box sx={{ width: '100%', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          {/* Simple square counter with habit color */}
                          <Box
                            onClick={() => handleToggleHabitLog(habit, date)}
                            sx={{
                              width: '60px',
                              height: '60px',
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              backgroundColor: getCount(habit, date, habitLogs) >= (habit.target_per_day || 1) 
                                ? 'success.main' 
                                : (getCount(habit, date, habitLogs) > 0 ? habit.color : '#f5f5f5'),
                              color: getCount(habit, date, habitLogs) > 0 ? 'white' : 'text.secondary',
                              border: '2px solid',
                              borderColor: getCount(habit, date, habitLogs) > 0 ? 'transparent' : 'divider',
                              cursor: 'pointer',
                              userSelect: 'none',
                              transition: 'all 0.15s ease-in-out',
                              '&:hover': {
                                transform: 'scale(1.05)',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                              },
                              '&:active': {
                                transform: 'scale(0.95)'
                              }
                            }}
                          >
                            <Typography 
                              variant="body1" 
                              component="span"
                              align="center" 
                              sx={{ 
                                fontWeight: 'medium',
                                fontSize: '14px'
                              }}
                            >
                              {getCount(habit, date, habitLogs) || 0}
                            </Typography>
                          </Box>
                          
                          {/* Right-click to decrement option */}
                          <Box 
                            component="div"
                            sx={{ 
                              mt: 1, 
                              color: 'text.secondary',
                              fontSize: '0.9rem',
                              fontWeight: 'medium',
                              cursor: 'pointer' 
                            }}
                            onClick={(e) => {
                              if (getCount(habit, date, habitLogs) > 0) {
                                handleDecrement(habit, date);
                              }
                            }}
                          >
                            {getCount(habit, date, habitLogs) > 0 ? 'click to -1' : ''}
                          </Box>
                        </Box>
                      </>
                    ) : (
                      <>
                        {/* Daily tracking type UI - using counter just like multiple habits */}
                        <Box
                          onClick={() => handleToggleHabitLog(habit, date)}
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '60px',
                            height: '60px',
                            border: '2px solid',
                            borderColor: isHabitCompleted(habit, date) ? 'transparent' : 'divider',
                            backgroundColor: isHabitCompleted(habit, date)
                              ? habit.color || 'success.main'
                              : '#f5f5f5',
                            color: isHabitCompleted(habit, date) ? 'white' : 'text.secondary',
                            cursor: 'pointer',
                            transition: 'all 0.15s ease-in-out',
                            '&:hover': {
                              transform: 'scale(1.05)',
                              boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
                            },
                            '&:active': {
                              transform: 'scale(0.95)'
                            }
                          }}
                        >
                          <Typography 
                            variant="body1" 
                            component="span"
                            align="center" 
                            sx={{ 
                              fontWeight: 'medium',
                              fontSize: '14px'
                            }}
                          >
                            {getCount(habit, date, habitLogs) || 0}
                          </Typography>
                        </Box>
                      </>
                    )}
                    
                    {/* Notes feature removed as requested */}
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
