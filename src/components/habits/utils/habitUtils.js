import { format, getYear } from 'date-fns';

/**
 * Calculate habit completion rates for each month in a year
 * 
 * @param {Array} habits - List of habit objects
 * @param {Array} habitLogs - List of habit log entries
 * @param {Date} currentDate - Current date to get year from
 * @returns {Object} - Object mapping habit IDs to monthly completion data
 */
export const calculateYearlyCompletionRates = (habits, habitLogs, currentDate) => {
  const months = [
    'Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 
    'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
  ];
  
  const year = getYear(currentDate);
  const habitCompletionRates = {};
  
  habits.forEach(habit => {
    habitCompletionRates[habit.id] = months.map((_, index) => {
      const month = index;
      
      // Count days in month
      const daysInMonth = new Date(year, month + 1, 0).getDate();
      
      // Count completed days
      let completedDays = 0;
      
      for (let day = 1; day <= daysInMonth; day++) {
        const date = new Date(year, month, day);
        const dateStr = format(date, 'yyyy-MM-dd');
        
        const log = habitLogs.find(log => 
          log.habit_id === habit.id && log.date === dateStr && log.completed
        );
        
        if (log) {
          completedDays++;
        }
      }
      
      // Calculate completion percentage
      return {
        month: months[month],
        daysInMonth,
        completedDays,
        percentage: daysInMonth > 0 ? (completedDays / daysInMonth) * 100 : 0
      };
    });
  });
  
  return habitCompletionRates;
};

/**
 * Get completion color based on percentage
 * 
 * @param {number} percentage - Completion percentage
 * @returns {string} - Color code in hex
 */
export const getCompletionColor = (percentage) => {
  if (percentage === 0) return '#eee';
  if (percentage < 25) return '#ffcdd2';
  if (percentage < 50) return '#ffecb3';
  if (percentage < 75) return '#c8e6c9';
  return '#81c784';
};

/**
 * Check if a habit is completed on a specific date
 * 
 * @param {Object} habit - Habit object
 * @param {Date} date - Date to check
 * @param {Array} habitLogs - List of habit log entries
 * @returns {boolean} - Whether the habit is completed on the date
 */
export const isHabitCompleted = (habit, date, habitLogs) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const log = habitLogs.find(log => 
    log.habit_id === habit.id && log.date === dateStr
  );
  return log && log.completed;
};

/**
 * Get note for a habit on a specific date
 * 
 * @param {Object} habit - Habit object
 * @param {Date} date - Date to check
 * @param {Array} habitLogs - List of habit log entries
 * @returns {string} - Note text or empty string
 */
export const getHabitNote = (habit, date, habitLogs) => {
  const dateStr = format(date, 'yyyy-MM-dd');
  const log = habitLogs.find(log => 
    log.habit_id === habit.id && log.date === dateStr
  );
  return log ? log.notes || '' : '';
};

/**
 * Available color options for habits
 */
export const colorOptions = [
  { value: '#2196f3', label: 'Blue' },
  { value: '#4caf50', label: 'Green' },
  { value: '#f44336', label: 'Red' },
  { value: '#ff9800', label: 'Orange' },
  { value: '#9c27b0', label: 'Purple' },
  { value: '#795548', label: 'Brown' },
  { value: '#607d8b', label: 'Gray' },
  { value: '#e91e63', label: 'Pink' }
];
