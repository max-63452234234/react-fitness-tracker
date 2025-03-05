import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  Card,
  CardContent,
  Tab,
  Tabs,
  Divider
} from '@mui/material';
import { supabase } from '../../index.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  Title,
  Tooltip,
  Legend,
  Filler
);

/**
 * ProgressCharts component
 * Shows visualizations of user's fitness progress over time
 */
const ProgressCharts = () => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weightData, setWeightData] = useState([]);
  const [workoutData, setWorkoutData] = useState([]);
  const [macroData, setMacroData] = useState([]);
  const [tabValue, setTabValue] = useState(0);
  const [timeRange, setTimeRange] = useState('30'); // days
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        // Calculate date range
        const endDate = new Date();
        const startDate = new Date();
        startDate.setDate(endDate.getDate() - parseInt(timeRange));
        
        // Format dates for Supabase query
        const startDateStr = startDate.toISOString().split('T')[0];
        const endDateStr = endDate.toISOString().split('T')[0];
        
        // Fetch weight data
        const { data: weightEntries, error: weightError } = await supabase
          .from('weight_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', startDateStr)
          .lte('date', endDateStr)
          .order('date', { ascending: true });
          
        if (weightError) throw weightError;
        
        setWeightData(weightEntries || []);
        
        // Fetch workout data
        const { data: workouts, error: workoutError } = await supabase
          .from('workouts')
          .select('id, date, notes')
          .eq('user_id', user.id)
          .gte('date', startDateStr)
          .lte('date', endDateStr)
          .order('date', { ascending: true });
          
        if (workoutError) throw workoutError;
        
        // For each workout, get exercises to calculate volume
        const workoutsWithVolume = await Promise.all(workouts.map(async (workout) => {
          const { data: exercises } = await supabase
            .from('exercises')
            .select('*')
            .eq('workout_id', workout.id);
            
          // Calculate total volume (sets * reps * weight)
          let totalVolume = 0;
          if (exercises) {
            exercises.forEach(exercise => {
              totalVolume += exercise.sets * exercise.reps * (exercise.weight || 1);
            });
          }
          
          return {
            ...workout,
            totalVolume,
            exerciseCount: exercises ? exercises.length : 0
          };
        }));
        
        setWorkoutData(workoutsWithVolume || []);
        
        // Fetch macros data
        const { data: macroEntries, error: macroError } = await supabase
          .from('macro_logs')
          .select('*')
          .eq('user_id', user.id)
          .gte('date', startDateStr)
          .lte('date', endDateStr)
          .order('date', { ascending: true });
          
        if (macroError) throw macroError;
        
        setMacroData(macroEntries || []);
        
      } catch (error) {
        console.error('Error fetching progress data:', error.message);
        setError('Error loading progress data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [timeRange]);
  
  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };
  
  const handleTimeRangeChange = (event, newValue) => {
    setTimeRange(newValue);
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };

  // Weight progress chart
  const weightChartData = {
    labels: weightData.map(entry => formatDate(entry.date)),
    datasets: [
      {
        label: 'Weight (kg)',
        data: weightData.map(entry => entry.weight),
        fill: true,
        backgroundColor: 'rgba(75, 192, 192, 0.2)',
        borderColor: 'rgba(75, 192, 192, 1)',
        tension: 0.4,
      }
    ]
  };
  
  const weightChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Weight Progress'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Weight (kg)'
        },
        min: weightData.length > 0 
          ? Math.floor(Math.min(...weightData.map(d => d.weight)) * 0.95) 
          : undefined,
      }
    }
  };
  
  // Workout volume chart
  const workoutChartData = {
    labels: workoutData.map(entry => formatDate(entry.date)),
    datasets: [
      {
        type: 'bar',
        label: 'Total Volume',
        data: workoutData.map(entry => entry.totalVolume),
        backgroundColor: 'rgba(54, 162, 235, 0.6)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
        yAxisID: 'y'
      },
      {
        type: 'line',
        label: 'Exercises',
        data: workoutData.map(entry => entry.exerciseCount),
        backgroundColor: 'rgba(255, 99, 132, 0.2)',
        borderColor: 'rgba(255, 99, 132, 1)',
        borderWidth: 1,
        yAxisID: 'y1'
      }
    ]
  };
  
  const workoutChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Workout Progress'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        type: 'linear',
        display: true,
        position: 'left',
        title: {
          display: true,
          text: 'Total Volume'
        }
      },
      y1: {
        type: 'linear',
        display: true,
        position: 'right',
        title: {
          display: true,
          text: 'Exercise Count'
        },
        grid: {
          drawOnChartArea: false
        }
      }
    }
  };
  
  // Macro trends chart
  const macroChartData = {
    labels: macroData.map(entry => formatDate(entry.date)),
    datasets: [
      {
        label: 'Protein (g)',
        data: macroData.map(entry => entry.protein),
        backgroundColor: 'rgba(54, 162, 235, 0.5)',
        borderColor: 'rgba(54, 162, 235, 1)',
        borderWidth: 1,
      },
      {
        label: 'Carbs (g)',
        data: macroData.map(entry => entry.carbs),
        backgroundColor: 'rgba(75, 192, 192, 0.5)',
        borderColor: 'rgba(75, 192, 192, 1)',
        borderWidth: 1,
      },
      {
        label: 'Fat (g)',
        data: macroData.map(entry => entry.fat),
        backgroundColor: 'rgba(255, 159, 64, 0.5)',
        borderColor: 'rgba(255, 159, 64, 1)',
        borderWidth: 1,
      }
    ]
  };
  
  const macroChartOptions = {
    responsive: true,
    plugins: {
      title: {
        display: true,
        text: 'Macronutrient Trends'
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Grams'
        }
      }
    }
  };
  
  // Calculate macro distribution for pie chart
  const calculateAverageMacros = () => {
    if (macroData.length === 0) return { protein: 0, carbs: 0, fat: 0 };
    
    const totalProtein = macroData.reduce((sum, entry) => sum + entry.protein, 0);
    const totalCarbs = macroData.reduce((sum, entry) => sum + entry.carbs, 0);
    const totalFat = macroData.reduce((sum, entry) => sum + entry.fat, 0);
    
    return {
      protein: totalProtein / macroData.length,
      carbs: totalCarbs / macroData.length,
      fat: totalFat / macroData.length
    };
  };
  
  const averageMacros = calculateAverageMacros();
  
  const macroPieData = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [
      {
        data: [averageMacros.protein, averageMacros.carbs, averageMacros.fat],
        backgroundColor: [
          'rgba(54, 162, 235, 0.7)',
          'rgba(75, 192, 192, 0.7)',
          'rgba(255, 159, 64, 0.7)',
        ],
        borderColor: [
          'rgba(54, 162, 235, 1)',
          'rgba(75, 192, 192, 1)',
          'rgba(255, 159, 64, 1)',
        ],
        borderWidth: 1,
      },
    ],
  };
  
  const macroPieOptions = {
    responsive: true,
    plugins: {
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Average Macro Distribution'
      },
      tooltip: {
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.raw || 0;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = Math.round((value / total) * 100);
            return `${label}: ${value.toFixed(1)}g (${percentage}%)`;
          }
        }
      }
    },
  };

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
        Progress Charts
      </Typography>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Time range selector */}
      <Paper sx={{ mb: 4 }}>
        <Tabs
          value={timeRange}
          onChange={handleTimeRangeChange}
          indicatorColor="primary"
          textColor="primary"
          centered
        >
          <Tab label="7 Days" value="7" />
          <Tab label="30 Days" value="30" />
          <Tab label="90 Days" value="90" />
          <Tab label="1 Year" value="365" />
        </Tabs>
      </Paper>
      
      {(weightData.length === 0 && workoutData.length === 0 && macroData.length === 0) ? (
        <Alert severity="info" sx={{ mb: 3 }}>
          No data available for the selected time period. Start logging your fitness activities to see progress charts.
        </Alert>
      ) : (
        <>
          {/* Chart type selector */}
          <Paper sx={{ mb: 4 }}>
            <Tabs
              value={tabValue}
              onChange={handleTabChange}
              indicatorColor="primary"
              textColor="primary"
              centered
            >
              <Tab label="Weight" disabled={weightData.length === 0} />
              <Tab label="Workouts" disabled={workoutData.length === 0} />
              <Tab label="Nutrition" disabled={macroData.length === 0} />
            </Tabs>
          </Paper>
          
          {/* Weight chart */}
          {tabValue === 0 && weightData.length > 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Line data={weightChartData} options={weightChartOptions} />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Weight Summary
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Current
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {weightData.length > 0 ? weightData[weightData.length - 1].weight : 0} kg
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Change
                        </Typography>
                        {weightData.length > 1 ? (
                          <Typography
                            variant="h6"
                            color={
                              weightData[weightData.length - 1].weight - weightData[0].weight < 0
                                ? 'success.main'
                                : 'error.main'
                            }
                          >
                            {(weightData[weightData.length - 1].weight - weightData[0].weight).toFixed(1)} kg
                          </Typography>
                        ) : (
                          <Typography variant="h6">0 kg</Typography>
                        )}
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Average
                        </Typography>
                        <Typography variant="h6">
                          {(weightData.reduce((sum, entry) => sum + entry.weight, 0) / weightData.length).toFixed(1)} kg
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Entries
                        </Typography>
                        <Typography variant="h6">
                          {weightData.length}
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {/* Workout chart */}
          {tabValue === 1 && workoutData.length > 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent>
                    <Bar data={workoutChartData} options={workoutChartOptions} />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Workout Summary
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Total Workouts
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {workoutData.length}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Avg. Exercises/Workout
                        </Typography>
                        <Typography variant="h6">
                          {(workoutData.reduce((sum, w) => sum + w.exerciseCount, 0) / workoutData.length).toFixed(1)}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={12}>
                        <Typography variant="body2" color="text.secondary">
                          Weekly Frequency
                        </Typography>
                        <Typography variant="h6">
                          {(workoutData.length / (parseInt(timeRange) / 7)).toFixed(1)} workouts/week
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
          
          {/* Nutrition charts */}
          {tabValue === 2 && macroData.length > 0 && (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent>
                    <Line data={macroChartData} options={macroChartOptions} />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent>
                    <Pie data={macroPieData} options={macroPieOptions} />
                  </CardContent>
                </Card>
              </Grid>
              
              <Grid item xs={12} md={4}>
                <Card sx={{ height: '100%' }}>
                  <CardContent>
                    <Typography variant="h6" gutterBottom>
                      Nutrition Summary
                    </Typography>
                    <Divider sx={{ mb: 2 }} />
                    
                    <Grid container spacing={2}>
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Avg. Calories
                        </Typography>
                        <Typography variant="h6" color="primary">
                          {(macroData.reduce((sum, entry) => sum + entry.calories, 0) / macroData.length).toFixed(0)} kcal
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Entries
                        </Typography>
                        <Typography variant="h6">
                          {macroData.length}
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Protein
                        </Typography>
                        <Typography variant="h6">
                          {averageMacros.protein.toFixed(1)}g
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Carbs
                        </Typography>
                        <Typography variant="h6">
                          {averageMacros.carbs.toFixed(1)}g
                        </Typography>
                      </Grid>
                      
                      <Grid item xs={6}>
                        <Typography variant="body2" color="text.secondary">
                          Fat
                        </Typography>
                        <Typography variant="h6">
                          {averageMacros.fat.toFixed(1)}g
                        </Typography>
                      </Grid>
                    </Grid>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          )}
        </>
      )}
    </Box>
  );
};

export default ProgressCharts;
