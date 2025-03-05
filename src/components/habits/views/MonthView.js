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

/**
 * Monthly view for habit tracking
 */
const MonthView = ({
  habits,
  weeks,
  currentDate,
  isHabitCompleted,
  handleToggleHabitLog
}) => {
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Habit</TableCell>
            <TableCell colSpan={7} align="center">
              {format(currentDate, 'MMMM yyyy')}
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell></TableCell>
            <TableCell align="center">Mon</TableCell>
            <TableCell align="center">Tue</TableCell>
            <TableCell align="center">Wed</TableCell>
            <TableCell align="center">Thu</TableCell>
            <TableCell align="center">Fri</TableCell>
            <TableCell align="center">Sat</TableCell>
            <TableCell align="center">Sun</TableCell>
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
                            width: 12, 
                            height: 12, 
                            borderRadius: '50%', 
                            bgcolor: habit.color || '#2196f3',
                            mr: 1 
                          }} 
                        />
                        {habit.name}
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
                          <Typography variant="caption">{format(day, 'd')}</Typography>
                          <IconButton 
                            onClick={() => handleToggleHabitLog(habit, day)}
                            color={isHabitCompleted(habit, day) ? 'success' : 'default'}
                            size="small"
                            sx={{ p: 0.5 }}
                            disabled={!isCurrentMonth}
                          >
                            {isHabitCompleted(habit, day) ? 
                              <CheckCircleIcon fontSize="small" /> : 
                              <CancelIcon sx={{ opacity: 0.3 }} fontSize="small" />
                            }
                          </IconButton>
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
