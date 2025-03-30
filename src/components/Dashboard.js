import React, { useState, useEffect } from 'react';
import {
  Grid,
  Paper,
  Typography,
  Box,
  Button,
  Card,
  CardContent,
  CardActions,
  List,
  ListItem,
  ListItemText,
  Divider,
  CircularProgress,
  IconButton,
  Alert,
  AlertTitle,
  // Chip // Removed unused import
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
// import { supabase } from '../index.js'; // REMOVED Supabase import
import { format } from 'date-fns';

/**
 * Dashboard component
 * Shows overview of user's fitness tracking data
 * @param {Object} props - Component props
 * @param {Object} props.currentUser - Current user object (e.g., { id: userId })
 */
const Dashboard = ({ currentUser }) => { // Accept currentUser prop
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [weightEntries, setWeightEntries] = useState([]);
  const [macroEntries, setMacroEntries] = useState([]);
  const [habits, setHabits] = useState([]); // State for habits
  const [habitLogs, setHabitLogs] = useState([]); // State for logs
  const [showWelcome, setShowWelcome] = useState(localStorage.getItem('hideWelcome') !== 'true');
  const [loadingHabitUpdate, setLoadingHabitUpdate] = useState(false);
  const [error, setError] = useState(null); // Add error state

  useEffect(() => {
    const fetchDashboardData = async () => {
      if (!currentUser || !currentUser.id) {
        console.log("Dashboard: No current user found.");
        setLoading(false);
        return; // Don't fetch if no user
      }

      try {
        setLoading(true);
        setError(null); // Clear previous errors
        const userId = currentUser.id; // Use ID from prop
        const today = new Date().toISOString().split('T')[0];

        // Use Promise.all to fetch data concurrently
        const [
          profileRes,
          workoutsRes,
          weightRes,
          macroRes,
          habitsRes, // Fetch habits
          habitLogsRes
        ] = await Promise.all([
          // Fetch user profile data (Example endpoint)
          // fetch(`/api/profiles/${userId}`),
          Promise.resolve(null), // Placeholder for profile fetch

          // Fetch recent workouts (Example endpoint)
          // fetch(`/api/workouts?userId=${userId}&limit=5&sort=date:desc`),
          Promise.resolve(null), // Placeholder for workouts fetch

          // Fetch recent weight entries (Example endpoint)
          // fetch(`/api/weight-logs?userId=${userId}&limit=5&sort=date:desc`),
          Promise.resolve(null), // Placeholder for weight fetch

          // Fetch recent macro entries (Example endpoint)
          // fetch(`/api/macro-logs?userId=${userId}&limit=5&sort=date:desc`),
          Promise.resolve(null), // Placeholder for macro fetch

          // Fetch habits
          fetch(`http://localhost:3002/api/habits?userId=${userId}`), // Fetch habits

          // Fetch today's habit logs
          fetch(`http://localhost:3002/api/habit-logs?userId=${userId}&date=${today}`)
        ]);

        // Process Profile (Placeholder)
        console.log("TODO: Process profile data for user:", userId);
        setProfile(null);

        // Process Workouts (Placeholder)
        console.log("TODO: Process recent workouts for user:", userId);
        setRecentWorkouts([]);

        // Process Weight Logs (Placeholder)
        console.log("TODO: Process recent weight logs for user:", userId);
        setWeightEntries([]);

        // Process Macro Logs (Placeholder)
        console.log("TODO: Process recent macro logs for user:", userId);
        setMacroEntries([]);

        // Process Habits
        if (habitsRes && habitsRes.ok) {
          const habitsData = await habitsRes.json();
          setHabits(habitsData.data || []); // Update habits state
        } else {
          console.error("Failed to fetch habits:", habitsRes?.statusText);
          setHabits([]);
        }

        // Process Habit Logs
        if (habitLogsRes && habitLogsRes.ok) {
          const habitLogsData = await habitLogsRes.json();
          setHabitLogs(habitLogsData.data || []);
        } else {
          console.error("Failed to fetch habit logs:", habitLogsRes?.statusText);
          setHabitLogs([]);
        }

      } catch (error) {
        console.error('Error fetching dashboard data:', error);
        setError(`Failed to load dashboard data: ${error.message}`);
        // Set empty state on error
        setProfile(null);
        setRecentWorkouts([]);
        setWeightEntries([]);
        setMacroEntries([]);
        setHabits([]);
        setHabitLogs([]);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, [currentUser]); // Re-fetch if currentUser changes

  // Function to handle habit tracking directly from dashboard
  const handleToggleHabit = async (habit) => {
    if (!currentUser || !currentUser.id || loadingHabitUpdate) return;

    setError(null); // Clear previous errors
    setLoadingHabitUpdate(true);
    const todayDate = new Date().toISOString().split('T')[0];
    const userId = currentUser.id;

    // Store the current state in case we need to revert on error
    const originalLogs = [...habitLogs];

    // Optimistic UI Update
    const existingLogIndex = habitLogs.findIndex(log => log.habit_id === habit.id && log.date === todayDate);
    let optimisticLog;
    if (existingLogIndex > -1) {
        optimisticLog = { ...habitLogs[existingLogIndex], count: habitLogs[existingLogIndex].count + 1, completed: 1 };
        setHabitLogs(prevLogs => {
            const newLogs = [...prevLogs];
            newLogs[existingLogIndex] = optimisticLog;
            return newLogs;
        });
    } else {
        optimisticLog = {
            id: `temp-${Date.now()}`, // Temporary ID
            habit_id: habit.id,
            date: todayDate,
            completed: 1,
            count: 1,
            notes: ''
        };
        setHabitLogs(prevLogs => [...prevLogs, optimisticLog]);
    }


    try {
      // Call the backend POST endpoint to create/update the log
      const response = await fetch(`http://localhost:3002/api/habit-logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          // Send habit_id, date, and userId (needed until JWT is implemented)
          body: JSON.stringify({ habit_id: habit.id, date: todayDate, userId: userId })
      });

      if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const updatedLog = await response.json(); // Backend returns the updated/created log

      // Update the state with the confirmed data from the backend
      // Replace the temporary/optimistic log with the real one
      setHabitLogs(prevLogs => {
          const newLogs = prevLogs.filter(log => log.id !== optimisticLog.id); // Remove optimistic/temp log
          return [...newLogs, updatedLog.data]; // Add confirmed log
      });

    } catch (error) {
      console.error('Error updating habit:', error);
      setError(`Failed to save habit: ${error.message}. Please try again.`);
      // Revert optimistic update on error
      setHabitLogs(originalLogs);
    } finally {
      setLoadingHabitUpdate(false);
    }
  };

  // Function to hide welcome message permanently
  const handleHideWelcome = () => {
    localStorage.setItem('hideWelcome', 'true');
    setShowWelcome(false);
  };

  // Function to get habit count for today
  const getHabitCount = (habitId) => {
    const todayDate = new Date().toISOString().split('T')[0];
    const log = habitLogs.find(log => log.habit_id === habitId && log.date === todayDate);
    return log ? log.count : 0;
  };

  // Render Loading state
  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>

      {/* Display general errors */}
       {error && (
         <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>
           {error}
         </Alert>
       )}

      <Grid container spacing={3}>
        {/* Welcome Card - Only shows if not dismissed */}
        {showWelcome && (
          <Grid item xs={12}>
            <Alert
              severity="info"
              sx={{ mb: 2 }}
              action={
                <IconButton
                  aria-label="close"
                  color="inherit"
                  size="small"
                  onClick={handleHideWelcome}
                >
                  <CloseIcon fontSize="inherit" />
                </IconButton>
              }
            >
              {/* Updated to not rely on profile state initially */}
              <AlertTitle>Welcome{currentUser?.id ? '!' : ''}</AlertTitle>
              Track your fitness journey, monitor your progress, and achieve your goals with Fitness Tracker.
            </Alert>
          </Grid>
        )}

        {/* Quick Habit Tracking Widget - First on screen */}
        {habits.length === 0 && !loading && (
             <Grid item xs={12}>
                 <Card><CardContent><Typography color="text.secondary">No habits found. Add some in the Habit Tracker!</Typography></CardContent></Card>
             </Grid>
        )}
        {habits.length > 0 && (
          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Today's Habits ({format(new Date(), 'EEEE, MMM d')})
                </Typography>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  {habits.map(habit => (
                    <Grid item key={habit.id} sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                      <Box
                        onClick={() => handleToggleHabit(habit)} // Updated handler
                        sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          p: 1,
                          border: '2px solid',
                          borderColor: getHabitCount(habit.id) > 0 ? 'transparent' : 'divider',
                          borderRadius: 3,
                          width: '70px',
                          height: '70px',
                          cursor: loadingHabitUpdate ? 'default' : 'pointer', // Change cursor when loading
                          position: 'relative',
                          backgroundColor: getHabitCount(habit.id) > 0
                            ? (getHabitCount(habit.id) >= (habit.target_per_day || 1) ? 'success.main' : (habit.color || 'primary.light')) // Use habit color or default
                            : '#f5f5f5',
                          transition: 'all 0.15s ease-in-out',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                          opacity: loadingHabitUpdate ? 0.7 : 1, // Dim when loading
                          '&:hover': {
                            transform: loadingHabitUpdate ? 'none' : 'translateY(-3px)',
                            boxShadow: loadingHabitUpdate ? '0 2px 6px rgba(0,0,0,0.05)' : '0 4px 12px rgba(0,0,0,0.1)'
                          },
                          '&:active': {
                            transform: loadingHabitUpdate ? 'none' : 'scale(0.95)'
                          }
                        }}
                      >
                        {/* Display loading indicator inside the box if updating this specific habit */}
                        {loadingHabitUpdate && <CircularProgress size={24} sx={{ color: 'white', position: 'absolute' }} />}
                        <Box sx={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          bgcolor: getHabitCount(habit.id) > 0 ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                          color: getHabitCount(habit.id) > 0 ? 'white' : 'text.secondary',
                          opacity: loadingHabitUpdate ? 0.5 : 1 // Dim content when loading
                        }}>
                          <Typography sx={{ fontSize: '18px', fontWeight: 'medium' }}>
                            {getHabitCount(habit.id)}
                          </Typography>
                        </Box>

                        {habit.tracking_type === 'multiple' && habit.target_per_day > 1 && (
                          <Typography
                            variant="caption"
                            sx={{
                              position: 'absolute',
                              bottom: 2,
                              right: 4,
                              color: getHabitCount(habit.id) > 0 ? 'white' : 'text.secondary',
                              opacity: loadingHabitUpdate ? 0.5 : 0.8 // Dim content when loading
                            }}
                          >
                            /{habit.target_per_day}
                          </Typography>
                        )}
                      </Box>

                      <Typography
                        variant="caption"
                        sx={{
                          textAlign: 'center',
                          fontWeight: 'medium',
                          mt: 1,
                          maxWidth: '85px',
                          minHeight: '32px',
                          color: 'text.secondary',
                          display: '-webkit-box',
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden',
                          lineHeight: '1.2',
                          width: '100%'
                        }}
                      >
                        {habit.name}
                      </Typography>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
              <CardActions>
                <Button
                  component={Link}
                  to="/habits"
                  size="small"
                  color="primary"
                  sx={{
                    borderRadius: 3,
                    px: 2,
                    ml: 1,
                    '&:hover': {
                      backgroundColor: 'rgba(33, 150, 243, 0.08)'
                    }
                  }}
                >
                  Go to Habit Tracker
                </Button>
              </CardActions>
            </Card>
          </Grid>
        )}

        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Button
                  variant="contained"
                  component={Link}
                  to="/workouts"
                  color="primary"
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    backgroundImage: 'linear-gradient(to right, #1976d2, #2196f3)',
                    boxShadow: '0 4px 10px rgba(33, 150, 243, 0.3)'
                  }}
                >
                  Log Workout
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  component={Link}
                  to="/habits"
                  color="primary"
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    backgroundImage: 'linear-gradient(to right, #1976d2, #2196f3)',
                    boxShadow: '0 4px 10px rgba(33, 150, 243, 0.3)'
                  }}
                >
                  Track Habits
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  component={Link}
                  to="/weight"
                  color="primary"
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    backgroundImage: 'linear-gradient(to right, #1976d2, #2196f3)',
                    boxShadow: '0 4px 10px rgba(33, 150, 243, 0.3)'
                  }}
                >
                  Log Weight
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="contained"
                  component={Link}
                  to="/macros"
                  color="primary"
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    backgroundImage: 'linear-gradient(to right, #1976d2, #2196f3)',
                    boxShadow: '0 4px 10px rgba(33, 150, 243, 0.3)'
                  }}
                >
                  Log Nutrition
                </Button>
              </Grid>
              <Grid item>
                <Button
                  variant="outlined"
                  component={Link}
                  to="/progress"
                  color="primary"
                  sx={{
                    borderRadius: 3,
                    px: 3,
                    borderWidth: 1,
                    '&:hover': {
                      borderWidth: 1,
                      boxShadow: '0 2px 8px rgba(33, 150, 243, 0.2)'
                    }
                  }}
                >
                  View Progress
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>

        {/* Stats Cards (Data is currently placeholder) */}
        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Recent Workouts
              </Typography>
              {recentWorkouts.length > 0 ? (
                <List>
                  {recentWorkouts.map((workout) => (
                    <React.Fragment key={workout.id}>
                      <ListItem>
                        <ListItemText
                          primary={new Date(workout.date).toLocaleDateString()} // Assuming date format is compatible
                          secondary={workout.notes || 'No notes'}
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  (Workouts not loaded)
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button
                component={Link}
                to="/workouts"
                size="small"
                color="primary"
                sx={{
                  borderRadius: 3,
                  px: 2,
                  ml: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(33, 150, 243, 0.08)'
                  }
                }}
              >
                View All Workouts
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Weight Tracking
              </Typography>
              {weightEntries.length > 0 ? (
                <List>
                  {weightEntries.map((entry) => (
                    <React.Fragment key={entry.id}>
                      <ListItem>
                        <ListItemText
                          primary={`${entry.weight} kg`} // Assuming weight unit
                          secondary={new Date(entry.date).toLocaleDateString()} // Assuming date format
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  (Weight logs not loaded)
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button
                component={Link}
                to="/weight"
                size="small"
                color="primary"
                sx={{
                  borderRadius: 3,
                  px: 2,
                  ml: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(33, 150, 243, 0.08)'
                  }
                }}
              >
                Track Weight
              </Button>
            </CardActions>
          </Card>
        </Grid>

        <Grid item xs={12} md={4}>
          <Card sx={{ height: '100%' }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>
                Nutrition
              </Typography>
              {macroEntries.length > 0 ? (
                <List>
                  {macroEntries.map((entry) => (
                    <React.Fragment key={entry.id}>
                      <ListItem>
                        <ListItemText
                          primary={`${entry.calories} calories`}
                          secondary={`P: ${entry.protein}g | C: ${entry.carbs}g | F: ${entry.fat}g - ${new Date(entry.date).toLocaleDateString()}`} // Assuming date format
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  (Nutrition logs not loaded)
                </Typography>
              )}
            </CardContent>
            <CardActions>
              <Button
                component={Link}
                to="/macros"
                size="small"
                color="primary"
                sx={{
                  borderRadius: 3,
                  px: 2,
                  ml: 1,
                  '&:hover': {
                    backgroundColor: 'rgba(33, 150, 243, 0.08)'
                  }
                }}
              >
                Track Nutrition
              </Button>
            </CardActions>
          </Card>
        </Grid>

      </Grid>
    </Box>
  );
};

export default Dashboard;
