import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback, removed useMemo
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
// import { supabase } from '../../index.js'; // REMOVED Supabase import
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
  // startOfYear, // Removed unused
  // endOfYear, // Removed unused
  // getMonth, // Removed unused
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
  // getHabitCount, // Removed unused
  colorOptions
} from './utils/habitUtils';

/**
 * HabitTracker component
 * Main component for tracking daily habits with different views
 * @param {Object} props - Component props
 * @param {Object} props.currentUser - Current user object (e.g., { id: userId })
 */
const HabitTracker = ({ currentUser }) => { // Accept currentUser prop
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [userId, setUserId] = useState(null); // Use currentUser.id

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

  // Fetch initial data (habits and all logs)
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !currentUser.id) {
        console.log("HabitTracker: No current user found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userId = currentUser.id;

        // Fetch habits and all logs concurrently
        const [habitsRes, logsRes] = await Promise.all([
          fetch(`http://localhost:3002/api/habits?userId=${userId}`),
          fetch(`http://localhost:3002/api/habit-logs/all?userId=${userId}`) // Fetch all logs
        ]);

        // Process habits
        if (!habitsRes.ok) {
          const errData = await habitsRes.json();
          throw new Error(errData.error || `Failed to fetch habits: ${habitsRes.statusText}`);
        }
        const habitsData = await habitsRes.json();
        setHabits(habitsData.data || []);

        // Process logs
        if (!logsRes.ok) {
          const errData = await logsRes.json();
          throw new Error(errData.error || `Failed to fetch habit logs: ${logsRes.statusText}`);
        }
        const logsData = await logsRes.json();
        setHabitLogs(logsData.data || []);

      } catch (error) {
        console.error('Error fetching habits data:', error.message);
        setError(`Failed to load habits data: ${error.message}. Please try again.`);
        setHabits([]);
        setHabitLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]); // Re-fetch if user changes

  // Update date range when view type or current date changes
  const updateDateRange = useCallback(() => { // Wrap in useCallback
    let range = [];

    if (viewType === 'week') {
      const weekStart = startOfWeek(currentDate, { weekStartsOn: 1 }); // Start from Monday
      const weekEnd = endOfWeek(currentDate, { weekStartsOn: 1 });

      let day = weekStart;
      while (day <= weekEnd) {
        range.push(new Date(day));
        day = addDays(day, 1);
      }

      setDateRange(range);
    } else if (viewType === 'month') {
      const firstDay = startOfMonth(currentDate);
      let weekStart = startOfWeek(firstDay, { weekStartsOn: 1 });
      const lastDay = endOfMonth(currentDate);
      const weekGroups = [];
      while (weekStart <= lastDay) {
        let currentWeek = [];
        for (let i = 0; i < 7; i++) {
          const day = addDays(weekStart, i);
          currentWeek.push(day);
        }
        weekGroups.push(currentWeek);
        weekStart = addDays(weekStart, 7);
      }
      setWeeks(weekGroups);

    } else if (viewType === 'year') {
       for (let month = 0; month < 12; month++) {
         range.push(new Date(getYear(currentDate), month, 1));
       }
       setDateRange(range);
    }
  }, [viewType, currentDate]); // Add dependencies

  useEffect(() => {
    updateDateRange();
  }, [updateDateRange]); // Add updateDateRange to dependency array

  // Update habit completion rates for year view
  useEffect(() => {
    if (viewType === 'year' && habits.length > 0) {
      const rates = calculateYearlyCompletionRates(habits, habitLogs, currentDate);
      setHabitCompletionRates(rates);
    }
  }, [viewType, habits, habitLogs, currentDate]);

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
      setHabitTrackingType('daily'); // Reset to default
      setTargetPerDay(1); // Reset to default
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

  // Save Habit (Create or Update)
  const handleSaveHabit = async () => {
    if (!habitName.trim() || !currentUser?.id) {
      setError('Habit name is required.');
      return;
    }
    setError(null);

    const habitData = {
      userId: currentUser.id, // Pass userId
      name: habitName.trim(),
      description: habitDescription.trim(),
      color: habitColor,
      tracking_type: habitTrackingType,
      target_per_day: habitTrackingType === 'multiple' ? targetPerDay : null // Use null if not multiple
    };

    try {
      let response;
      let updatedHabitData;

      if (editMode && selectedHabit) {
        // Update existing habit
        response = await fetch(`http://localhost:3002/api/habits/${selectedHabit.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(habitData)
        });
      } else {
        // Create new habit
        response = await fetch(`http://localhost:3002/api/habits`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(habitData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      updatedHabitData = await response.json(); // Backend returns the created/updated habit

      // Update state
      if (editMode) {
        setHabits(habits.map(h => (h.id === selectedHabit.id ? updatedHabitData.data : h)));
      } else {
        setHabits([...habits, updatedHabitData.data]);
      }

      handleCloseForm();
    } catch (error) {
      console.error('Error saving habit:', error.message);
      setError(`Failed to save habit: ${error.message}. Please try again.`);
    }
  };

  // Delete Habit
  const handleDeleteHabit = async (id) => {
     if (!currentUser?.id) return;

     if (!window.confirm('Are you sure you want to delete this habit? This will delete all logs for this habit.')) {
       return;
     }
     setError(null);

     try {
       const response = await fetch(`http://localhost:3002/api/habits/${id}`, {
         method: 'DELETE',
         headers: { 'Content-Type': 'application/json' },
         // Pass userId in body until JWT is implemented
         body: JSON.stringify({ userId: currentUser.id })
       });

       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
       }

       // Remove habit and its logs from state
       setHabits(habits.filter(h => h.id !== id));
       setHabitLogs(habitLogs.filter(log => log.habit_id !== id));

     } catch (error) {
       console.error('Error deleting habit:', error.message);
       setError(`Failed to delete habit: ${error.message}. Please try again.`);
     }
   };

  // Toggle Habit Log (Increment Count)
  const handleToggleHabitLog = async (habit, date) => {
    if (!currentUser?.id) return;
    setError(null);
    const dateStr = format(date, 'yyyy-MM-dd');

    // Optimistic UI update logic can go here if desired

    try {
        const response = await fetch(`http://localhost:3002/api/habit-logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ habit_id: habit.id, date: dateStr, userId: currentUser.id })
        });

        if (!response.ok) {
            const errorData = await response.json();
            throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const updatedLog = await response.json();

        // Update state with confirmed data
        setHabitLogs(prevLogs => {
            const existingLogIndex = prevLogs.findIndex(log => log.id === updatedLog.data.id || (log.habit_id === updatedLog.data.habit_id && log.date === updatedLog.data.date));
            if (existingLogIndex > -1) {
                const newLogs = [...prevLogs];
                newLogs[existingLogIndex] = updatedLog.data;
                return newLogs;
            } else {
                return [...prevLogs, updatedLog.data];
            }
        });
    } catch (error) {
        console.error('Error toggling habit log:', error.message);
        setError(`Failed to update habit log: ${error.message}. Please try again.`);
        // TODO: Revert optimistic update if implemented
    }
  };

  // Decrement Habit Count
  const handleDecrementHabitCount = async (habit, date) => {
    // --- TODO: Implement Decrement Logic ---
    console.log("TODO: Implement handleDecrementHabitCount");
    setError('Decrementing habit count is not yet implemented.');
  };

  // Save Note
  const saveNote = async () => {
    // --- TODO: Implement Save Note Logic ---
    console.log("TODO: Implement saveNote");
    setError('Saving notes is not yet implemented.');
    closeNoteEditor(); // Close editor for now
  };


  // --- Helper Functions (No changes needed below) ---

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
            disabled={!currentUser} // Disable if not logged in
          >
            Add Habit
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {habits.length === 0 && !loading ? (
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
              handleDeleteHabit={handleDeleteHabit} // Pass delete handler
              handleEditHabit={handleOpenForm} // Pass edit handler
              handleDecrementHabitCount={handleDecrementHabitCount}
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
              habitLogs={habitLogs}
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