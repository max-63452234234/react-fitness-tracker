import React from 'react';
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip
} from '@mui/material';
import { getYear } from 'date-fns';

/**
 * Yearly view for habit tracking with completion percentages
 */
const YearView = ({
  habits,
  currentDate,
  habitCompletionRates,
  setCurrentDate,
  setViewType
}) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const year = getYear(currentDate);
  
  const getCompletionColor = (percentage) => {
    if (percentage === 0) return '#eee';
    if (percentage < 25) return '#ffcdd2';
    if (percentage < 50) return '#ffecb3';
    if (percentage < 75) return '#c8e6c9';
    return '#81c784';
  };
  
  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Habit</TableCell>
            {months.map(month => (
              <TableCell key={month} align="center">{month}</TableCell>
            ))}
          </TableRow>
        </TableHead>
        <TableBody>
          {habits.map(habit => (
            <TableRow key={habit.id}>
              <TableCell>
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
              {habitCompletionRates[habit.id]?.map((data, index) => (
                <TableCell 
                  key={index} 
                  align="center"
                  sx={{ 
                    bgcolor: getCompletionColor(data.percentage),
                    p: 2,
                    cursor: 'pointer'
                  }}
                  onClick={() => {
                    setCurrentDate(new Date(year, index, 1));
                    setViewType('month');
                  }}
                >
                  <Tooltip 
                    title={`${data.completedDays}/${data.daysInMonth} days (${Math.round(data.percentage)}%)`}
                    arrow
                  >
                    <Box>
                      {Math.round(data.percentage)}%
                    </Box>
                  </Tooltip>
                </TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default YearView;
