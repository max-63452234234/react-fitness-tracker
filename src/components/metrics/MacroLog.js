import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  CircularProgress,
  IconButton,
  Alert,
  Card,
  CardContent,
  Divider
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
// import { supabase } from '../../index.js'; // REMOVED Supabase import
import { Bar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

/**
 * MacroLog component for tracking user macronutrients
 * Allows users to log daily calories, protein, carbs, and fat
 * @param {Object} props - Component props
 * @param {Object} props.currentUser - Current user object (e.g., { id: userId })
 */
const MacroLog = ({ currentUser }) => { // Accept currentUser prop
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [formData, setFormData] = useState({
    date: new Date().toISOString().split('T')[0],
    calories: '',
    protein: '',
    carbs: '',
    fat: ''
  });
  const [editMode, setEditMode] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [error, setError] = useState(null);
  // const [userId, setUserId] = useState(null); // Use currentUser.id
  const [stats, setStats] = useState({
    avgCalories: 0,
    avgProtein: 0,
    avgCarbs: 0,
    avgFat: 0
  });

  // Function to calculate stats
  const calculateStats = (currentEntries) => {
      if (currentEntries && currentEntries.length > 0) {
        const sumCalories = currentEntries.reduce((sum, entry) => sum + entry.calories, 0);
        const sumProtein = currentEntries.reduce((sum, entry) => sum + entry.protein, 0);
        const sumCarbs = currentEntries.reduce((sum, entry) => sum + entry.carbs, 0);
        const sumFat = currentEntries.reduce((sum, entry) => sum + entry.fat, 0);

        setStats({
          avgCalories: (sumCalories / currentEntries.length).toFixed(0),
          avgProtein: (sumProtein / currentEntries.length).toFixed(1),
          avgCarbs: (sumCarbs / currentEntries.length).toFixed(1),
          avgFat: (sumFat / currentEntries.length).toFixed(1)
        });
      } else {
         setStats({ avgCalories: 0, avgProtein: 0, avgCarbs: 0, avgFat: 0 });
      }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !currentUser.id) {
        console.log("MacroLog: No current user found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userId = currentUser.id;

        // --- Fetch macro logs from backend API ---
        const response = await fetch(`http://localhost:3002/api/macro-logs?userId=${userId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const fetchedEntries = data.data || [];
        setEntries(fetchedEntries);
        calculateStats(fetchedEntries); // Calculate stats

      } catch (error) {
        console.error('Error fetching macro entries:', error.message);
        setError(`Error loading nutrition data: ${error.message}. Please try again.`);
        setEntries([]);
        calculateStats([]); // Reset stats
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]); // Re-fetch if user changes

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleOpenForm = (entry = null) => {
    if (entry) {
      setSelectedEntry(entry);
      setFormData({
        date: entry.date.split('T')[0], // Assuming YYYY-MM-DD
        calories: entry.calories.toString(),
        protein: entry.protein.toString(),
        carbs: entry.carbs.toString(),
        fat: entry.fat.toString()
      });
      setEditMode(true);
    } else {
      setSelectedEntry(null);
      setFormData({
        date: new Date().toISOString().split('T')[0],
        calories: '',
        protein: '',
        carbs: '',
        fat: ''
      });
      setEditMode(false);
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedEntry(null);
    setEditMode(false);
    setError(null); // Clear form error on close
  };

  const validate = () => {
    const { date, calories, protein, carbs, fat } = formData;

    if (!date) return false;
    if (!calories || isNaN(calories) || parseFloat(calories) < 0) return false;
    if (!protein || isNaN(protein) || parseFloat(protein) < 0) return false;
    if (!carbs || isNaN(carbs) || parseFloat(carbs) < 0) return false;
    if (!fat || isNaN(fat) || parseFloat(fat) < 0) return false;

    return true;
  };

  // Handle Add/Update Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);

    if (!currentUser?.id) {
        setError('User not logged in.');
        return;
    }
    if (!validate()) {
      setError('Please fill in all fields with valid numbers');
      return;
    }

    const macroData = {
      userId: currentUser.id, // Include userId for backend check (until JWT)
      date: formData.date,
      calories: parseInt(formData.calories),
      protein: parseFloat(formData.protein),
      carbs: parseFloat(formData.carbs),
      fat: parseFloat(formData.fat)
    };

    try {
      let response;
      let updatedEntryData;

      if (editMode && selectedEntry) {
        // Update existing entry
        response = await fetch(`http://localhost:3002/api/macro-logs/${selectedEntry.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(macroData)
        });
      } else {
        // Add new entry
        response = await fetch(`http://localhost:3002/api/macro-logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(macroData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      updatedEntryData = await response.json(); // Backend returns the created/updated entry

      // Update state
      let newEntries;
      if (editMode) {
        newEntries = entries.map(entry =>
          entry.id === selectedEntry.id ? updatedEntryData.data : entry
        );
      } else {
        // Add new entry and re-sort by date descending for display
        newEntries = [...entries, updatedEntryData.data].sort((a, b) => new Date(b.date) - new Date(a.date));
      }
      setEntries(newEntries);
      calculateStats(newEntries); // Recalculate stats
      handleCloseForm();

    } catch (error) {
      console.error('Error saving macro entry:', error.message);
      setError(`Failed to save nutrition data: ${error.message}. Please try again.`);
    }
  };

  // Handle Delete
  const handleDelete = async (entryId) => {
    if (!currentUser?.id) return;

    if (!window.confirm('Are you sure you want to delete this nutrition entry?')) {
      return;
    }
    setError(null);

    try {
      const response = await fetch(`http://localhost:3002/api/macro-logs/${entryId}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          // Pass userId in body until JWT is implemented
          body: JSON.stringify({ userId: currentUser.id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Remove entry from state
      const updatedEntries = entries.filter(entry => entry.id !== entryId);
      setEntries(updatedEntries);
      calculateStats(updatedEntries); // Recalculate stats

    } catch (error) {
      console.error('Error deleting macro entry:', error.message);
      setError(`Failed to delete entry: ${error.message}. Please try again.`);
    }
  };

  const formatDate = (dateString) => {
     try {
         const date = new Date(dateString + 'T00:00:00'); // Add time part to avoid timezone issues
         if (isNaN(date.getTime())) return "Invalid Date";
         return date.toLocaleDateString();
     } catch (e) {
         return "Invalid Date";
     }
  };

  // Prepare chart data for the most recent entry
  const prepareChartData = () => {
    if (entries.length === 0) return null;

    // Find the most recent entry (assuming entries are sorted desc by default fetch)
    const mostRecent = entries[0];

    return {
      labels: ['Protein', 'Carbs', 'Fat'],
      datasets: [
        {
          label: 'Grams',
          data: [mostRecent.protein, mostRecent.carbs, mostRecent.fat],
          backgroundColor: [
            'rgba(54, 162, 235, 0.6)',
            'rgba(75, 192, 192, 0.6)',
            'rgba(255, 159, 64, 0.6)',
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
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Macronutrient Distribution (Most Recent Entry)' },
    },
    scales: { // Added scales config for clarity
        y: {
            beginAtZero: true,
            title: { display: true, text: 'Grams' }
        }
    }
  };

  // Calculate calories from macros (for display purposes)
  const calculateTotalCalories = (p, c, f) => {
    if (isNaN(p) || isNaN(c) || isNaN(f)) return 0;
    return (p * 4 + c * 4 + f * 9).toFixed(0);
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
      <Grid container spacing={2} alignItems="center" sx={{ mb: 3 }}>
        <Grid item xs>
          <Typography variant="h4" component="h1">
            Nutrition Tracking
          </Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
            disabled={!currentUser} // Disable if not logged in
          >
            Log Nutrition
          </Button>
        </Grid>
      </Grid>

      {error && !openForm && ( // Only show general error if form is not open
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      {entries.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                  Average Daily
                </Typography>
                <Typography variant="h4" component="div" color="primary">
                  {stats.avgCalories} kcal
                </Typography>
                <Divider sx={{ my: 1 }} />
                <Grid container spacing={2}>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Protein</Typography>
                    <Typography variant="body1">{stats.avgProtein}g</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Carbs</Typography>
                    <Typography variant="body1">{stats.avgCarbs}g</Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">Fat</Typography>
                    <Typography variant="body1">{stats.avgFat}g</Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>

          {entries.length > 0 && (
            <Grid item xs={12} md={9}>
              <Card>
                <CardContent>
                  {prepareChartData() ? (
                     <Bar data={prepareChartData()} options={chartOptions} height={80} />
                  ) : (
                     <Typography>No data for chart.</Typography>
                  )}
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Macro Log Table */}
      {entries.length === 0 && !loading ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            You haven't logged any nutrition entries yet. Click "Log Nutrition" to get started!
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Calories</TableCell>
                <TableCell>Protein (g)</TableCell>
                <TableCell>Carbs (g)</TableCell>
                <TableCell>Fat (g)</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Entries are already sorted desc by fetch */}
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.date)}</TableCell>
                  <TableCell>{entry.calories}</TableCell>
                  <TableCell>{entry.protein}</TableCell>
                  <TableCell>{entry.carbs}</TableCell>
                  <TableCell>{entry.fat}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      size="small"
                      color="primary"
                      onClick={() => handleOpenForm(entry)}
                      sx={{ mr: 1 }}
                      disabled={!currentUser}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton
                      size="small"
                      color="error"
                      onClick={() => handleDelete(entry.id)}
                      disabled={!currentUser}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Macro Form Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Nutrition Entry' : 'Add Nutrition Entry'}</DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
             {/* Display form-specific error */}
             {error && openForm && (
               <Alert severity="error" sx={{ mb: 2 }}>
                 {error}
               </Alert>
             )}
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  required
                  fullWidth
                  id="date"
                  name="date"
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense"
                  required
                  fullWidth
                  id="calories"
                  name="calories"
                  label="Calories"
                  type="number"
                  inputProps={{ min: 0 }}
                  value={formData.calories}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  margin="dense"
                  required
                  fullWidth
                  id="protein"
                  name="protein"
                  label="Protein (g)"
                  type="number"
                  inputProps={{ min: 0, step: 0.1 }}
                  value={formData.protein}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  margin="dense"
                  required
                  fullWidth
                  id="carbs"
                  name="carbs"
                  label="Carbs (g)"
                  type="number"
                  inputProps={{ min: 0, step: 0.1 }}
                  value={formData.carbs}
                  onChange={handleChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <TextField
                  margin="dense"
                  required
                  fullWidth
                  id="fat"
                  name="fat"
                  label="Fat (g)"
                  type="number"
                  inputProps={{ min: 0, step: 0.1 }}
                  value={formData.fat}
                  onChange={handleChange}
                />
              </Grid>

              {/* Show calculated calories from macros */}
              {formData.protein && formData.carbs && formData.fat && (
                <Grid item xs={12}>
                  <Alert severity="info">
                    Calculated calories from macros: {
                      calculateTotalCalories(
                        parseFloat(formData.protein) || 0,
                        parseFloat(formData.carbs) || 0,
                        parseFloat(formData.fat) || 0
                      )
                    } kcal
                  </Alert>
                </Grid>
              )}
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseForm}>Cancel</Button>
            <Button type="submit" variant="contained" color="primary">
              {editMode ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default MacroLog;
