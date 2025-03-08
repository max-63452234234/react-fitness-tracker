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
  Paper
} from '@mui/material';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import CancelIcon from '@mui/icons-material/Cancel';
import { format, getMonth, isToday } from 'date-fns';
import { getHabitCount } from '../utils/habitUtils';

/**
 * Monthly view for habit tracking
 */
const MonthView = ({
  habits,
  weeks,
  currentDate,
  isHabitCompleted,
  handleToggleHabitLog,
  habitLogs = []
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>
              <Typography variant="h6" sx={{ fontWeight: 'bold' }}>Habit</Typography>
            </TableCell>
            <TableCell colSpan={7} align="center">
              <Typography variant="h5" sx={{ fontWeight: 'bold' }}>
                {format(currentDate, 'MMMM yyyy')}
              </Typography>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell></TableCell>
            <TableCell align="center"><Typography variant="body1" sx={{ fontWeight: 'medium' }}>Mon</Typography></TableCell>
            <TableCell align="center"><Typography variant="body1" sx={{ fontWeight: 'medium' }}>Tue</Typography></TableCell>
            <TableCell align="center"><Typography variant="body1" sx={{ fontWeight: 'medium' }}>Wed</Typography></TableCell>
            <TableCell align="center"><Typography variant="body1" sx={{ fontWeight: 'medium' }}>Thu</Typography></TableCell>
            <TableCell align="center"><Typography variant="body1" sx={{ fontWeight: 'medium' }}>Fri</Typography></TableCell>
            <TableCell align="center"><Typography variant="body1" sx={{ fontWeight: 'medium' }}>Sat</Typography></TableCell>
            <TableCell align="center"><Typography variant="body1" sx={{ fontWeight: 'medium' }}>Sun</Typography></TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {habits.map(habit => (
            <React.Fragment key={habit.id}>
              {weeks.map((week, weekIndex) => (
                <TableRow key={`${habit.id}-week-${weekIndex}`}>
                  {weekIndex === 0 && (
                    <TableCell rowSpan={weeks.length} sx={{ verticalAlign: 'top', pt: 2 }}>
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
                    </TableCell>
                  )}
                  {week.map(day => {
                    const isCurrentMonth = getMonth(day) === getMonth(currentDate);
                    return (
                      <TableCell 
                        key={day.toString()} 
                        align="center"
                        sx={{
                          ...(isToday(day) && { bgcolor: 'primary.light', color: 'white' }),
                          ...(!isCurrentMonth && { opacity: 0.4 }),
                          p: 1
                        }}
                      >
                        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                          <Typography variant="body2" sx={{ fontWeight: 'bold' }}>
                            {format(day, 'd')}
                          </Typography>
                          
                          <Box
                            onClick={() => isCurrentMonth && handleToggleHabitLog(habit, day)}
                            sx={{
                              display: 'flex',
                              justifyContent: 'center',
                              alignItems: 'center',
                              width: '35px',
                              height: '35px',
                              backgroundColor: getHabitCount(habit, day, habitLogs) > 0
                                ? (getHabitCount(habit, day, habitLogs) >= (habit.target_per_day || 1) ? 'success.main' : habit.color)
                                : 'transparent',
                              color: getHabitCount(habit, day, habitLogs) > 0 ? 'white' : 'text.secondary',
                              cursor: isCurrentMonth ? 'pointer' : 'default',
                              opacity: isCurrentMonth ? 1 : 0.4,
                              border: '1px solid',
                              borderColor: getHabitCount(habit, day, habitLogs) > 0 ? 'transparent' : 'divider',
                              borderRadius: 2,
                              boxShadow: getHabitCount(habit, day, habitLogs) > 0 ? '0 2px 4px rgba(0,0,0,0.1)' : 'none',
                              mt: 0.5,
                              transition: 'all 0.15s ease-in-out',
                              '&:hover': isCurrentMonth ? {
                                transform: 'translateY(-2px)',
                                boxShadow: '0 3px 6px rgba(0,0,0,0.1)'
                              } : {}
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
                              {getHabitCount(habit, day, habitLogs) || '0'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                    );
                  })}
                </TableRow>
              ))}
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default MonthView;
