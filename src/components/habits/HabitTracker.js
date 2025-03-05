import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  CircularProgress,
  Alert,
  ToggleButton,
  ToggleButtonGroup,
  Tooltip
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DateRangeIcon from '@mui/icons-material/DateRange';
import CalendarViewMonthIcon from '@mui/icons-material/CalendarViewMonth';
import { supabase } from '../../index.js';
import { 
  format, 
  startOfWeek, 
  endOfWeek, 
  addDays, 
  subDays,
  startOfMonth, 
  endOfMonth, 
  addMonths, 
  addYears,
  startOfYear,
  endOfYear,
  getMonth,
  getYear
} from 'date-fns';

// Import components
import WeekView from './views/WeekView';
import MonthView from './views/MonthView';
import YearView from './views/YearView';
import HabitForm from './HabitForm';
import NoteEditor from './NoteEditor';

// Import utilities
import { 
  calculateYearlyCompletionRates,
  isHabitCompleted as checkHabitCompleted,
  getHabitNote as getHabitNoteText,
  colorOptions
} from './utils/habitUtils';

/**
 * HabitTracker component
 * Main component for tracking daily habits with different views
 */
const HabitTracker = () => {
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  
  // Form state
  const [openForm, setOpenForm] = useState(false);
  const [habitName, setHabitName] = useState('');
  const [habitDescription, setHabitDescription] = useState('');
  const [habitColor, setHabitColor] = useState('#2196f3');
  const [habitTrackingType, setHabitTrackingType] = useState('daily');
  const [targetPerDay, setTargetPerDay] = useState(1);
  const [selectedHabit, setSelectedHabit] = useState(null);
  const [editMode, setEditMode] = useState(false);
  
  // View state
  const [viewType, setViewType] = useState('week');
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dateRange, setDateRange] = useState([]);
  
  // Track the currently edited cell
  const [editingCell, setEditingCell] = useState(null);
  const [noteText, setNoteText] = useState('');
  
  // For month view
  const [weeks, setWeeks] = useState([]);
  
  // For year view
  const [habitCompletionRates, setHabitCompletionRates] = useState({});
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        
        // Fetch habits
        const { data: habitsData, error: habitsError } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id)
          .order('name');
          
        if (habitsError) throw habitsError;
        setHabits(habitsData || []);
        
        // Fetch recent habit logs (last 90 days)
        const today = new Date();
        const ninetyDaysAgo = subDays(today, 90);
        
        const { data: logsData, error: logsError } = await supabase
          .from('habit_logs')
          .select('*')
          .gte('date', ninetyDaysAgo.toISOString().split('T')[0])
          .order('date', { ascending: false });
          
        if (logsError) throw logsError;
        setHabitLogs(logsData || []);
        
      } catch (error) {
        console.error('Error fetching habits data:', error.message);
        setError('Failed to load habits. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  // Update date range when view type or current date changes
  useEffect(() => {
    updateDateRange();
  }, [viewType, currentDate]);
  
  // Update habit completion rates for year view
  useEffect(() => {
    if (viewType === 'year' && habits.length > 0) {
      const rates = calculateYearlyCompletionRates(habits, habitLogs, currentDate);
      setHabitCompletionRates(rates);
    }
  }, [viewType, habits, habitLogs, currentDate]);
  
  const updateDateRange = () => {
    let range = [];
    
    if (viewType === 'week') {
      const start = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
      const end = endOfWeek(currentDate, { weekStartsOn: 1 });
      
      let day = start;
      while (day <= end) {
        range.push(new Date(day));
        day = addDays(day, 1);
      }
      
      setDateRange(range);
    } else if (viewType === 'month') {
      const start = startOfMonth(currentDate);
      const end = endOfMonth(currentDate);
      
      // Group dates by weeks for the month view
      const weekGroups = [];
      let currentWeek = [];
      
      // Find the first day of the month
      const firstDay = startOfMonth(currentDate);
      // Find the first day of the week (Monday) that contains the first day of the month
      let weekStart = startOfWeek(firstDay, { weekStartsOn: 1 });
      
      // Find the last day of the month
      const lastDay = endOfMonth(currentDate);
      
      // Loop until we've processed all days in the month
      while (weekStart <= lastDay) {
        currentWeek = [];
        
        // Add the 7 days of this week
        for (let i = 0; i < 7; i++) {
          const day = addDays(weekStart, i);
          currentWeek.push(day);
        }
        
        weekGroups.push(currentWeek);
        weekStart = addDays(weekStart, 7);
      }
      
      setWeeks(weekGroups);
    } else if (viewType === 'year') {
      // For year view, we add first day of each month
      for (let month = 0; month < 12; month++) {
        range.push(new Date(getYear(currentDate), month, 1));
      }
      
      setDateRange(range);
    }
  };
  
  const handleOpenForm = (habit = null) => {
    if (habit) {
      setSelectedHabit(habit);
      setHabitName(habit.name);
      setHabitDescription(habit.description || '');
      setHabitColor(habit.color || '#2196f3');
      setHabitTrackingType(habit.tracking_type || 'daily');
      setTargetPerDay(habit.target_per_day || 1);
      setEditMode(true);
    } else {
      setSelectedHabit(null);
      setHabitName('');
      setHabitDescription('');
      setHabitColor('#2196f3');
      setEditMode(false);
    }
    setOpenForm(true);
  };
  
  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedHabit(null);
    setHabitName('');
    setHabitDescription('');
    setHabitColor('#2196f3');
    setHabitTrackingType('daily');
    setTargetPerDay(1);
    setEditMode(false);
  };
  
  const handleSaveHabit = async () => {
    if (!habitName.trim()) {
      setError('Please enter a habit name');
      return;
    }
    
    try {
      if (editMode) {
        // Update existing habit
        const { error } = await supabase
          .from('habits')
          .update({
            name: habitName.trim(),
            description: habitDescription.trim(),
            color: habitColor,
            tracking_type: habitTrackingType,
            target_per_day: habitTrackingType === 'multiple' ? targetPerDay : 1
          })
          .eq('id', selectedHabit.id);
          
        if (error) throw error;
        
        // Update habit in state
        setHabits(habits.map(h => 
          h.id === selectedHabit.id 
            ? { 
                ...h, 
                name: habitName.trim(), 
                description: habitDescription.trim(), 
                color: habitColor,
                tracking_type: habitTrackingType,
                target_per_day: habitTrackingType === 'multiple' ? targetPerDay : 1
              } 
            : h
        ));
      } else {
        // Create new habit
        const { data, error } = await supabase
          .from('habits')
          .insert([{
            user_id: userId,
            name: habitName.trim(),
            description: habitDescription.trim(),
            color: habitColor,
            tracking_type: habitTrackingType,
            target_per_day: habitTrackingType === 'multiple' ? targetPerDay : 1
          }])
          .select();
          
        if (error) throw error;
        
        // Add new habit to state
        setHabits([...habits, data[0]]);
      }
      
      handleCloseForm();
    } catch (error) {
      console.error('Error saving habit:', error.message);
      setError('Failed to save habit. Please try again.');
    }
  };
  
  const handleDeleteHabit = async (id) => {
    if (!window.confirm('Are you sure you want to delete this habit? This will delete all logs for this habit.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('habits')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Remove habit from state
      setHabits(habits.filter(h => h.id !== id));
      
      // Remove associated logs
      setHabitLogs(habitLogs.filter(log => log.habit_id !== id));
    } catch (error) {
      console.error('Error deleting habit:', error.message);
      setError('Failed to delete habit. Please try again.');
    }
  };
  
  const handleToggleHabitLog = async (habit, date) => {
    try {
      const dateStr = format(date, 'yyyy-MM-dd');
      
      // Check if a log exists for this habit and date
      const existingLog = habitLogs.find(log => 
        log.habit_id === habit.id && log.date === dateStr
      );
      
      if (habit.tracking_type === 'daily') {
        // For daily tracking type - toggle completion
        if (existingLog) {
          // Toggle the completion status if the log exists
          const { error } = await supabase
            .from('habit_logs')
            .update({ completed: !existingLog.completed })
            .eq('id', existingLog.id);
            
          if (error) throw error;
          
          // Update log in state
          setHabitLogs(habitLogs.map(log => 
            log.id === existingLog.id 
              ? { ...log, completed: !existingLog.completed } 
              : log
          ));
        } else {
          // Create a new log if it doesn't exist
          const { data, error } = await supabase
            .from('habit_logs')
            .insert([{
              habit_id: habit.id,
              date: dateStr,
              completed: true, // Default to completed when created
              count: 1,
              notes: ''
            }])
            .select();
            
          if (error) {
            console.error('Error creating habit log:', error);
            throw error;
          }
          
          if (data && data[0]) {
            // Add new log to state
            setHabitLogs([...habitLogs, data[0]]);
          } else {
            console.error('No data returned from insert operation');
            throw new Error('Failed to create habit log');
          }
        }
      } else {
        // For multiple tracking type - increment count without limit
        if (existingLog) {
          // Always increment count, even beyond target (allow exceeding target)
          const newCount = existingLog.count + 1;
          
          const { error } = await supabase
            .from('habit_logs')
            .update({ 
              count: newCount,
              completed: newCount >= (habit.target_per_day || 1) // Mark as completed if count reaches target
            })
            .eq('id', existingLog.id);
            
          if (error) throw error;
          
          // Update log in state
          setHabitLogs(habitLogs.map(log => 
            log.id === existingLog.id 
              ? { 
                  ...log, 
                  count: newCount,
                  completed: true // Always mark as completed for visual feedback
                } 
              : log
          ));
          
          setError(null); // Clear any previous errors
        } else {
          // Create a new log if it doesn't exist
          const { data, error } = await supabase
            .from('habit_logs')
            .insert([{
              habit_id: habit.id,
              date: dateStr,
              completed: true, // Always mark as completed for visual feedback
              count: 1, // Start with 1 count
              notes: ''
            }])
            .select();
            
          if (error) {
            console.error('Error creating habit log:', error);
            throw error;
          }
          
          if (data && data[0]) {
            // Add new log to state
            setHabitLogs([...habitLogs, data[0]]);
          } else {
            console.error('No data returned from insert operation');
            throw new Error('Failed to create habit log');
          }
        }
      }
    } catch (error) {
      console.error('Error toggling habit log:', error.message);
      setError('Failed to update habit log. Please try again.');
    }
  };
  
  const handleViewChange = (event, newView) => {
    if (newView !== null) {
      setViewType(newView);
    }
  };
  
  const handlePreviousPeriod = () => {
    if (viewType === 'week') {
      setCurrentDate(subDays(currentDate, 7));
    } else if (viewType === 'month') {
      setCurrentDate(addMonths(currentDate, -1));
    } else if (viewType === 'year') {
      setCurrentDate(addYears(currentDate, -1));
    }
  };
  
  const handleNextPeriod = () => {
    if (viewType === 'week') {
      setCurrentDate(addDays(currentDate, 7));
    } else if (viewType === 'month') {
      setCurrentDate(addMonths(currentDate, 1));
    } else if (viewType === 'year') {
      setCurrentDate(addYears(currentDate, 1));
    }
  };
  
  const handleToday = () => {
    setCurrentDate(new Date());
  };
  
  // Wrapper functions for the utilities
  const isHabitCompleted = (habit, date) => {
    return checkHabitCompleted(habit, date, habitLogs);
  };
  
  const getHabitNote = (habit, date) => {
    return getHabitNoteText(habit, date, habitLogs);
  };
  
  const openNoteEditor = (habit, date) => {
    const dateStr = format(date, 'yyyy-MM-dd');
    setEditingCell({ habitId: habit.id, date: dateStr });
    setNoteText(getHabitNote(habit, date));
  };
  
  const handleNoteChange = (e) => {
    setNoteText(e.target.value);
  };
  
  const saveNote = async () => {
    if (!editingCell) return;
    
    try {
      const { habitId, date } = editingCell;
      
      // Check if a log exists for this habit and date
      const existingLog = habitLogs.find(log => 
        log.habit_id === habitId && log.date === date
      );
      
      if (existingLog) {
        // Update existing log
        const { error } = await supabase
          .from('habit_logs')
          .update({ notes: noteText })
          .eq('id', existingLog.id);
          
        if (error) throw error;
        
        // Update log in state
        setHabitLogs(habitLogs.map(log => 
          log.id === existingLog.id 
            ? { ...log, notes: noteText } 
            : log
        ));
      } else {
        // Create a new log
        const { data, error } = await supabase
          .from('habit_logs')
          .insert([{
            habit_id: habitId,
            date: date,
            completed: false,
            notes: noteText
          }])
          .select();
          
        if (error) throw error;
        
        // Add new log to state
        setHabitLogs([...habitLogs, data[0]]);
      }
      
      // Close note editor
      setEditingCell(null);
      setNoteText('');
    } catch (error) {
      console.error('Error saving note:', error.message);
      setError('Failed to save note. Please try again.');
    }
  };
  
  const closeNoteEditor = () => {
    setEditingCell(null);
    setNoteText('');
  };

  // Render loading state
  if (loading && habits.length === 0) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs>
          <Typography variant="h4" component="h1">
            Habit Tracker
          </Typography>
        </Grid>
        <Grid item>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
          >
            Add Habit
          </Button>
        </Grid>
      </Grid>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {habits.length === 0 ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            You haven't added any habits yet. Click "Add Habit" to start tracking your habits.
          </Typography>
        </Paper>
      ) : (
        <>
          <Box sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <Box sx={{ display: 'flex', alignItems: 'center' }}>
              <Button onClick={handlePreviousPeriod} sx={{ mr: 1 }}>
                Prev
              </Button>
              <Button variant="outlined" onClick={handleToday} sx={{ mr: 1 }}>
                Today
              </Button>
              <Button onClick={handleNextPeriod} sx={{ mr: 3 }}>
                Next
              </Button>
              
              <Typography variant="h6">
                {viewType === 'week' && `Week of ${format(dateRange[0] || currentDate, 'dd MMM yyyy')}`}
                {viewType === 'month' && format(currentDate, 'MMMM yyyy')}
                {viewType === 'year' && format(currentDate, 'yyyy')}
              </Typography>
            </Box>
            
            <ToggleButtonGroup
              value={viewType}
              exclusive
              onChange={handleViewChange}
              aria-label="view type"
            >
              <ToggleButton value="week" aria-label="week view">
                <DateRangeIcon />
              </ToggleButton>
              <ToggleButton value="month" aria-label="month view">
                <CalendarViewMonthIcon />
              </ToggleButton>
              <ToggleButton value="year" aria-label="year view">
                <Tooltip title="Year View">
                  <span>Y</span>
                </Tooltip>
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>
          
          {viewType === 'week' && (
            <WeekView
              habits={habits}
              dateRange={dateRange}
              isHabitCompleted={isHabitCompleted}
              getHabitNote={getHabitNote}
              handleToggleHabitLog={handleToggleHabitLog}
              openNoteEditor={openNoteEditor}
              handleDeleteHabit={handleDeleteHabit}
              habitLogs={habitLogs}
            />
          )}
          
          {viewType === 'month' && (
            <MonthView
              habits={habits}
              weeks={weeks}
              currentDate={currentDate}
              isHabitCompleted={isHabitCompleted}
              handleToggleHabitLog={handleToggleHabitLog}
            />
          )}
          
          {viewType === 'year' && (
            <YearView
              habits={habits}
              currentDate={currentDate}
              habitCompletionRates={habitCompletionRates}
              setCurrentDate={setCurrentDate}
              setViewType={setViewType}
            />
          )}
        </>
      )}
      
      {/* Habit Form */}
      <HabitForm
        open={openForm}
        onClose={handleCloseForm}
        habitName={habitName}
        setHabitName={setHabitName}
        habitDescription={habitDescription}
        setHabitDescription={setHabitDescription}
        habitColor={habitColor}
        setHabitColor={setHabitColor}
        habitTrackingType={habitTrackingType}
        setHabitTrackingType={setHabitTrackingType}
        targetPerDay={targetPerDay}
        setTargetPerDay={setTargetPerDay}
        editMode={editMode}
        handleSaveHabit={handleSaveHabit}
        colorOptions={colorOptions}
      />
      
      {/* Note Editor */}
      <NoteEditor
        editingCell={editingCell}
        noteText={noteText}
        handleNoteChange={handleNoteChange}
        saveNote={saveNote}
        closeNoteEditor={closeNoteEditor}
        habits={habits}
      />
    </Box>
  );
};

export default HabitTracker;
