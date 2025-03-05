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
  CircularProgress
} from '@mui/material';
import { Link } from 'react-router-dom';
import { supabase } from '../index.js';

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

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Dashboard
      </Typography>
      
      <Grid container spacing={3}>
        {/* Welcome Card */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Welcome{profile?.full_name ? `, ${profile.full_name}` : ''}!
            </Typography>
            <Typography variant="body1">
              Track your fitness journey, monitor your progress, and achieve your goals with Fitness Tracker.
            </Typography>
          </Paper>
        </Grid>
        
        {/* Quick Stats */}
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
              >
                Track Nutrition
              </Button>
            </CardActions>
          </Card>
        </Grid>
        
        {/* Quick Actions */}
        <Grid item xs={12}>
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>
              Quick Actions
            </Typography>
            <Grid container spacing={2}>
              <Grid item>
                <Button 
                  variant="contained" 
                  component={Link} 
                  to="/workouts"
                >
                  Log Workout
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  variant="contained" 
                  component={Link} 
                  to="/weight"
                >
                  Log Weight
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  variant="contained" 
                  component={Link} 
                  to="/macros"
                >
                  Log Nutrition
                </Button>
              </Grid>
              <Grid item>
                <Button 
                  variant="outlined" 
                  component={Link} 
                  to="/progress"
                >
                  View Progress
                </Button>
              </Grid>
            </Grid>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
