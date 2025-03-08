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
  Chip
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { Link } from 'react-router-dom';
import { supabase } from '../index.js';
import { format } from 'date-fns';

/**
 * Dashboard component
 * Shows overview of user's fitness tracking data
 */
const Dashboard = () => {
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [recentWorkouts, setRecentWorkouts] = useState([]);
  const [weightEntries, setWeightEntries] = useState([]);
  const [macroEntries, setMacroEntries] = useState([]);
  const [habits, setHabits] = useState([]);
  const [habitLogs, setHabitLogs] = useState([]);
  const [showWelcome, setShowWelcome] = useState(localStorage.getItem('hideWelcome') !== 'true');
  const [loadingHabitUpdate, setLoadingHabitUpdate] = useState(false);

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;

        // Fetch user profile data
        const { data: profileData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', user.id)
          .single();
          
        if (profileData) {
          setProfile(profileData);
        }
        
        // Fetch recent workouts
        const { data: workoutsData } = await supabase
          .from('workouts')
          .select('id, date, notes')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(5);
          
        if (workoutsData) {
          setRecentWorkouts(workoutsData);
        }
        
        // Fetch recent weight entries
        const { data: weightData } = await supabase
          .from('weight_logs')
          .select('id, date, weight')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(5);
          
        if (weightData) {
          setWeightEntries(weightData);
        }
        
        // Fetch recent macro entries
        const { data: macroData } = await supabase
          .from('macro_logs')
          .select('id, date, calories, protein, carbs, fat')
          .eq('user_id', user.id)
          .order('date', { ascending: false })
          .limit(5);
          
        if (macroData) {
          setMacroEntries(macroData);
        }
        
        // Fetch habits
        const { data: habitsData } = await supabase
          .from('habits')
          .select('*')
          .eq('user_id', user.id)
          .order('name');
          
        if (habitsData) {
          setHabits(habitsData);
        }
        
        // Fetch today's habit logs
        const today = new Date().toISOString().split('T')[0];
        const { data: habitLogsData } = await supabase
          .from('habit_logs')
          .select('*')
          .eq('date', today);
          
        if (habitLogsData) {
          setHabitLogs(habitLogsData);
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  // Function to handle habit tracking directly from dashboard
  const handleToggleHabit = async (habit) => {
    try {
      setLoadingHabitUpdate(true);
      const todayDate = new Date().toISOString().split('T')[0];
      
      // Check if a log exists for this habit today
      const existingLog = habitLogs.find(log => 
        log.habit_id === habit.id && log.date === todayDate
      );
      
      if (existingLog) {
        // Always increment count
        const newCount = existingLog.count + 1;
        
        const { error } = await supabase
          .from('habit_logs')
          .update({ 
            completed: true,
            count: newCount
          })
          .eq('id', existingLog.id);
          
        if (error) throw error;
        
        // Update log in state
        setHabitLogs(habitLogs.map(log => 
          log.id === existingLog.id 
            ? { 
                ...log, 
                completed: true,
                count: newCount
              } 
            : log
        ));
      } else {
        // Create a new log if it doesn't exist
        const { data, error } = await supabase
          .from('habit_logs')
          .insert([{
            habit_id: habit.id,
            date: todayDate,
            completed: true,
            count: 1,
            notes: ''
          }])
          .select();
          
        if (error) throw error;
        
        if (data && data[0]) {
          // Add new log to state
          setHabitLogs([...habitLogs, data[0]]);
        }
      }
    } catch (error) {
      console.error('Error updating habit:', error);
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

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
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
              <AlertTitle>Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}!</AlertTitle>
              Track your fitness journey, monitor your progress, and achieve your goals with Fitness Tracker.
            </Alert>
          </Grid>
        )}
        
        {/* Quick Habit Tracking Widget - First on screen */}
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
                        onClick={() => handleToggleHabit(habit)}
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
                          cursor: 'pointer',
                          position: 'relative',
                          backgroundColor: getHabitCount(habit.id) > 0 
                            ? (getHabitCount(habit.id) >= (habit.target_per_day || 1) ? 'success.main' : habit.color) 
                            : '#f5f5f5',
                          transition: 'all 0.15s ease-in-out',
                          boxShadow: '0 2px 6px rgba(0,0,0,0.05)',
                          '&:hover': {
                            transform: 'translateY(-3px)',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
                          },
                          '&:active': {
                            transform: 'scale(0.95)'
                          }
                        }}
                      >
                        <Box sx={{ 
                          display: 'flex', 
                          alignItems: 'center', 
                          justifyContent: 'center', 
                          width: '40px',
                          height: '40px',
                          borderRadius: '50%',
                          bgcolor: getHabitCount(habit.id) > 0 ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.05)',
                          color: getHabitCount(habit.id) > 0 ? 'white' : 'text.secondary'
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
                              opacity: 0.8
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
                          maxWidth: '80px',
                          color: 'text.secondary',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
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
        
        {/* Stats Cards */}
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
                          primary={new Date(workout.date).toLocaleDateString()}
                          secondary={workout.notes || 'No notes'}
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No recent workouts found.
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
                          primary={`${entry.weight} kg`}
                          secondary={new Date(entry.date).toLocaleDateString()}
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No weight entries found.
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
                          secondary={`P: ${entry.protein}g | C: ${entry.carbs}g | F: ${entry.fat}g - ${new Date(entry.date).toLocaleDateString()}`}
                        />
                      </ListItem>
                      <Divider component="li" />
                    </React.Fragment>
                  ))}
                </List>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  No nutrition entries found.
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
