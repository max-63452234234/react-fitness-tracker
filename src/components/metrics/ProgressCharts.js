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
  FormControl, // Keep
  InputLabel, // Keep
  Select, // Keep
  MenuItem, // Keep
  ToggleButtonGroup, // Added for metric selection
  ToggleButton // Added for metric selection
} from '@mui/material';
// import { supabase } from '../../index.js'; // REMOVED Supabase import
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
import { format } from 'date-fns'; // Removed unused date-fns imports

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

// Define available metrics for exercise progress
const exerciseMetrics = [
    { key: 'maxWeight', label: 'Max Weight (kg)' },
    { key: 'totalVolume', label: 'Total Volume (kg)' },
    { key: 'estimatedOneRepMax', label: 'Est. 1RM (kg)' },
    // Add more metrics like maxDuration, maxDistance later if needed
];

/**
 * ProgressCharts component
 * Shows visualizations of user's fitness progress over time
 * @param {Object} props - Component props
 * @param {Object} props.currentUser - Current user object (e.g., { id: userId })
 */
const ProgressCharts = ({ currentUser }) => {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [weightData, setWeightData] = useState([]);
  const [macroData, setMacroData] = useState([]);
  const [tabValue, setTabValue] = useState(0); // 0: Weight, 1: Nutrition, 2: Exercise
  const [timeRange, setTimeRange] = useState('30'); // days

  // State for Exercise Progress
  const [exerciseNames, setExerciseNames] = useState([]);
  const [selectedExercise, setSelectedExercise] = useState('');
  const [exerciseProgressData, setExerciseProgressData] = useState([]);
  const [loadingExerciseProgress, setLoadingExerciseProgress] = useState(false);
  const [selectedMetric, setSelectedMetric] = useState('maxWeight'); // State for selected metric

  // Fetch initial data (Weight, Macros, Exercise Names)
  useEffect(() => {
    const fetchInitialData = async () => {
      if (!currentUser || !currentUser.id) {
        console.log("ProgressCharts: No current user found.");
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);
      const userId = currentUser.id;

      try {
        const [weightRes, macroRes, exerciseNamesRes] = await Promise.all([
          fetch(`http://localhost:3002/api/weight-logs?userId=${userId}`),
          fetch(`http://localhost:3002/api/macro-logs?userId=${userId}`),
          fetch(`http://localhost:3002/api/exercises/names?userId=${userId}`) // Fetch exercise names
        ]);

        // Process Weight Data
        if (!weightRes.ok) console.error('Failed to fetch weight data');
        const weightJson = await weightRes.json().catch(() => ({ data: [] }));
        setWeightData((weightJson.data || []).sort((a, b) => new Date(a.date) - new Date(b.date)));

        // Process Macro Data
        if (!macroRes.ok) console.error('Failed to fetch macro data');
        const macroJson = await macroRes.json().catch(() => ({ data: [] }));
        setMacroData((macroJson.data || []).sort((a, b) => new Date(a.date) - new Date(b.date)));

        // Process Exercise Names
        if (!exerciseNamesRes.ok) console.error('Failed to fetch exercise names');
        const exerciseNamesJson = await exerciseNamesRes.json().catch(() => ({ data: [] }));
        setExerciseNames(exerciseNamesJson.data || []);
        // Optionally select the first exercise by default
        // if (exerciseNamesJson.data && exerciseNamesJson.data.length > 0) {
        //   setSelectedExercise(exerciseNamesJson.data[0]);
        // }

      } catch (error) {
        console.error('Error fetching initial progress data:', error.message);
        setError(`Error loading initial data: ${error.message}. Please try again.`);
        setWeightData([]);
        setMacroData([]);
        setExerciseNames([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, [currentUser]); // Re-fetch if user changes

  // Fetch Exercise Progress Data when selectedExercise or timeRange changes
  useEffect(() => {
    const fetchExerciseProgress = async () => {
      if (!currentUser?.id || !selectedExercise) {
        setExerciseProgressData([]); // Clear data if no exercise selected
        return;
      }

      setLoadingExerciseProgress(true);
      setError(null); // Clear general error, specific error handled below
      try {
        const response = await fetch(`http://localhost:3002/api/progress/exercise?userId=${currentUser.id}&exerciseName=${encodeURIComponent(selectedExercise)}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();

        // Filter data based on timeRange client-side
        const endDate = new Date();
        const startDate = new Date();
        if (timeRange === '365') {
            startDate.setFullYear(endDate.getFullYear() - 1);
        } else {
            startDate.setDate(endDate.getDate() - parseInt(timeRange));
        }
        const startDateStr = format(startDate, 'yyyy-MM-dd');
        const endDateStr = format(endDate, 'yyyy-MM-dd');

        const filteredData = (data.data || []).filter(entry =>
            entry.date >= startDateStr && entry.date <= endDateStr
        );
        setExerciseProgressData(filteredData);

      } catch (err) {
        console.error(`Error fetching progress for ${selectedExercise}:`, err);
        setError(`Failed to load progress for ${selectedExercise}: ${err.message}`);
        setExerciseProgressData([]);
      } finally {
        setLoadingExerciseProgress(false);
      }
    };

    fetchExerciseProgress();
  }, [selectedExercise, timeRange, currentUser]); // Re-fetch if selection or range changes

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleTimeRangeChange = (event) => {
    setTimeRange(event.target.value);
  };

   const handleExerciseChange = (event) => {
    setSelectedExercise(event.target.value);
  };

  const handleMetricChange = (event, newMetric) => {
    if (newMetric !== null) { // Prevent unselecting all buttons
        setSelectedMetric(newMetric);
    }
  };

  const formatDate = (dateString) => {
     try {
         const date = new Date(dateString.includes('T') ? dateString : dateString + 'T00:00:00');
         if (isNaN(date.getTime())) return "Invalid Date";
         return date.toLocaleDateString();
     } catch (e) {
         return "Invalid Date";
     }
  };

  // --- Chart Data and Options ---

  // Weight progress chart options (condensed)
  const weightChartOptions = {
    responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Weight Progress' }, tooltip: { mode: 'index', intersect: false }, }, scales: { y: { title: { display: true, text: 'Weight (kg)' }, beginAtZero: false } }
  };
  // Weight progress chart data
  const weightChartData = {
    labels: weightData.map(entry => formatDate(entry.date)),
    datasets: [{ label: 'Weight (kg)', data: weightData.map(entry => entry.weight), fill: true, backgroundColor: 'rgba(75, 192, 192, 0.2)', borderColor: 'rgba(75, 192, 192, 1)', tension: 0.4, }]
  };


  // Macro trends chart options (condensed)
   const macroChartOptions = {
    responsive: true, maintainAspectRatio: false, plugins: { title: { display: true, text: 'Macronutrient Trends' }, tooltip: { mode: 'index', intersect: false }, }, scales: { y: { title: { display: true, text: 'Grams' }, beginAtZero: true } }
  };
  // Macro trends chart data
  const macroChartData = {
    labels: macroData.map(entry => formatDate(entry.date)),
    datasets: [
      { label: 'Protein (g)', data: macroData.map(entry => entry.protein), backgroundColor: 'rgba(54, 162, 235, 0.5)', borderColor: 'rgba(54, 162, 235, 1)', borderWidth: 1, },
      { label: 'Carbs (g)', data: macroData.map(entry => entry.carbs), backgroundColor: 'rgba(75, 192, 192, 0.5)', borderColor: 'rgba(75, 192, 192, 1)', borderWidth: 1, },
      { label: 'Fat (g)', data: macroData.map(entry => entry.fat), backgroundColor: 'rgba(255, 159, 64, 0.5)', borderColor: 'rgba(255, 159, 64, 1)', borderWidth: 1, }
    ]
  };


  // Macro distribution pie chart options (condensed)
  const macroPieOptions = {
    responsive: true, maintainAspectRatio: false, plugins: { legend: { position: 'top' }, title: { display: true, text: 'Average Macro Distribution' }, tooltip: { callbacks: { label: function(context) { const label = context.label || ''; const value = context.raw || 0; const total = context.dataset.data.reduce((a, b) => a + b, 0); if (total === 0) return `${label}: 0g (0%)`; const percentage = Math.round((value / total) * 100); return `${label}: ${value.toFixed(1)}g (${percentage}%)`; } } } },
  };
  // Macro distribution pie chart data
  const calculateAverageMacros = () => {
    if (macroData.length === 0) return { protein: 0, carbs: 0, fat: 0 };
    const totalProtein = macroData.reduce((sum, entry) => sum + entry.protein, 0);
    const totalCarbs = macroData.reduce((sum, entry) => sum + entry.carbs, 0);
    const totalFat = macroData.reduce((sum, entry) => sum + entry.fat, 0);
    return { protein: totalProtein / macroData.length, carbs: totalCarbs / macroData.length, fat: totalFat / macroData.length };
  };
  const averageMacros = calculateAverageMacros();
  const macroPieData = {
    labels: ['Protein', 'Carbs', 'Fat'],
    datasets: [{ data: [averageMacros.protein, averageMacros.carbs, averageMacros.fat], backgroundColor: [ 'rgba(54, 162, 235, 0.7)', 'rgba(75, 192, 192, 0.7)', 'rgba(255, 159, 64, 0.7)', ], borderColor: [ 'rgba(54, 162, 235, 1)', 'rgba(75, 192, 192, 1)', 'rgba(255, 159, 64, 1)', ], borderWidth: 1, }, ],
  };


  // --- Exercise Progress Chart (Dynamic based on selectedMetric) ---
  const selectedMetricConfig = exerciseMetrics.find(m => m.key === selectedMetric) || exerciseMetrics[0];

  const exerciseProgressChartData = {
    labels: exerciseProgressData.map(entry => formatDate(entry.date)),
    datasets: [
      {
        label: selectedMetricConfig.label, // Dynamic label
        data: exerciseProgressData.map(entry => entry[selectedMetric] ?? null), // Use selected metric data, default to null if missing
        fill: false,
        borderColor: 'rgb(255, 99, 132)',
        tension: 0.1,
        // Hide dataset if no data exists for the selected metric for this exercise
        hidden: !exerciseProgressData.some(entry => entry[selectedMetric] !== null && entry[selectedMetric] !== undefined)
      },
    ]
  };

  const exerciseProgressChartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      title: { display: true, text: `Progress for ${selectedExercise || 'Select Exercise'}` },
      tooltip: {
          mode: 'index',
          intersect: false,
          callbacks: {
              label: function(context) {
                  let label = context.dataset.label || '';
                  if (label) {
                      label += ': ';
                  }
                  if (context.parsed.y !== null) {
                      // Add units based on metric - simple example
                      const unit = selectedMetricConfig.label.includes('(kg)') ? ' kg' : ''; // Add more units if needed
                      label += context.parsed.y.toFixed(1) + unit;
                  }
                  return label;
              }
          }
      },
    },
    scales: {
      y: {
        title: { display: true, text: selectedMetricConfig.label }, // Dynamic Y-axis label
        beginAtZero: selectedMetric === 'totalVolume' // Only start at zero for volume
      }
    }
  };


  // --- Render Logic ---
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
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Time range selector */}
      <Paper sx={{ mb: 4, p: 1 }}>
         <FormControl sx={{ m: 1, minWidth: 120 }} size="small">
           <InputLabel id="time-range-label">Time Range</InputLabel>
           <Select
             labelId="time-range-label"
             id="time-range-select"
             value={timeRange}
             label="Time Range"
             onChange={handleTimeRangeChange}
           >
             <MenuItem value="7">7 Days</MenuItem>
             <MenuItem value="30">30 Days</MenuItem>
             <MenuItem value="90">90 Days</MenuItem>
             <MenuItem value="365">1 Year</MenuItem>
           </Select>
         </FormControl>
      </Paper>

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
          <Tab label="Nutrition" disabled={macroData.length === 0} />
          <Tab label="Exercise" disabled={exerciseNames.length === 0} /> {/* Enable Exercise tab */}
        </Tabs>
      </Paper>

      {/* Weight chart */}
      {tabValue === 0 && (
        weightData.length === 0 ? (
            <Alert severity="info">No weight data for selected period.</Alert>
        ) : (
            <Grid container spacing={3}>
              <Grid item xs={12}>
                <Card>
                  <CardContent sx={{ height: '400px' }}>
                    <Line data={weightChartData} options={weightChartOptions} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
        )
      )}

      {/* Nutrition charts */}
      {tabValue === 1 && (
         macroData.length === 0 ? (
             <Alert severity="info">No nutrition data for selected period.</Alert>
         ) : (
            <Grid container spacing={3}>
              <Grid item xs={12} md={8}>
                <Card>
                  <CardContent sx={{ height: '400px' }}>
                    <Bar data={macroChartData} options={macroChartOptions} />
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} md={4}>
                <Card>
                  <CardContent sx={{ height: '400px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Pie data={macroPieData} options={macroPieOptions} />
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
         )
      )}

      {/* Exercise Progress Section */}
      {tabValue === 2 && (
        <Paper sx={{ p: 2 }}>
            <Typography variant="h6" gutterBottom>Exercise Progress</Typography>
            <Grid container spacing={2} alignItems="center" sx={{ mb: 2 }}>
                <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                        <InputLabel id="exercise-select-label">Select Exercise</InputLabel>
                        <Select
                            labelId="exercise-select-label"
                            id="exercise-select"
                            value={selectedExercise}
                            label="Select Exercise"
                            onChange={handleExerciseChange}
                        >
                            <MenuItem value=""><em>Select an exercise</em></MenuItem>
                            {exerciseNames.map((name) => (
                                <MenuItem key={name} value={name}>{name}</MenuItem>
                            ))}
                        </Select>
                    </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                     {/* Metric Selector */}
                     <ToggleButtonGroup
                        color="primary"
                        value={selectedMetric}
                        exclusive
                        onChange={handleMetricChange}
                        aria-label="Select Metric"
                        size="small"
                        fullWidth
                      >
                        {exerciseMetrics.map((metric) => (
                          <ToggleButton key={metric.key} value={metric.key} aria-label={metric.label}>
                            {metric.label.replace(' (kg)', '')} {/* Shorten label for button */}
                          </ToggleButton>
                        ))}
                      </ToggleButtonGroup>
                </Grid>
            </Grid>

            {loadingExerciseProgress ? (
                 <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                 </Box>
            ) : selectedExercise && exerciseProgressData.length === 0 ? (
                 <Alert severity="info">No logged data found for "{selectedExercise}" in the selected time range.</Alert>
            ) : selectedExercise && exerciseProgressData.length > 0 ? (
                 <Card>
                   <CardContent sx={{ height: '400px' }}>
                     <Line data={exerciseProgressChartData} options={exerciseProgressChartOptions} />
                   </CardContent>
                 </Card>
            ) : (
                 <Typography sx={{mt: 2}}>Please select an exercise to view its progress.</Typography>
            )}
        </Paper>
      )}

    </Box>
  );
};

export default ProgressCharts;
