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
  CardContent
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
// import { supabase } from '../../index.js'; // REMOVED Supabase import
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

/**
 * WeightLog component for tracking user weight over time
 * @param {Object} props - Component props
 * @param {Object} props.currentUser - Current user object (e.g., { id: userId })
 */
const WeightLog = ({ currentUser }) => { // Accept currentUser prop
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [error, setError] = useState(null);
  // const [userId, setUserId] = useState(null); // Use currentUser.id
  const [stats, setStats] = useState({
    current: 0,
    average: 0,
    lowest: 0,
    highest: 0,
    change: 0,
  });

  // Function to calculate stats from entries
  const calculateStats = (currentEntries) => {
      if (currentEntries && currentEntries.length > 0) {
        const sortedEntries = [...currentEntries].sort((a, b) =>
          new Date(a.date) - new Date(b.date)
        );
        const weights = sortedEntries.map(entry => entry.weight);
        const current = weights[weights.length - 1];
        const lowest = Math.min(...weights);
        const highest = Math.max(...weights);
        const sum = weights.reduce((acc, w) => acc + w, 0);
        const average = sum / weights.length;
        const first = weights[0];
        const change = current - first;

        setStats({
          current,
          average: average.toFixed(1),
          lowest,
          highest,
          change: change.toFixed(1)
        });
      } else {
        // Reset stats if no entries
        setStats({ current: 0, average: 0, lowest: 0, highest: 0, change: 0 });
      }
  };

  // Fetch initial data
  useEffect(() => {
    const fetchData = async () => {
      if (!currentUser || !currentUser.id) {
        console.log("WeightLog: No current user found.");
        setLoading(false);
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const userId = currentUser.id;

        // --- Fetch weight logs from backend API ---
        const response = await fetch(`http://localhost:3002/api/weight-logs?userId=${userId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        const fetchedEntries = data.data || [];
        setEntries(fetchedEntries);
        calculateStats(fetchedEntries); // Calculate stats after fetching

      } catch (error) {
        console.error('Error fetching weight entries:', error.message);
        setError(`Error loading weight data: ${error.message}. Please try again.`);
        setEntries([]);
        calculateStats([]); // Reset stats on error
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [currentUser]); // Re-fetch if user changes

  const handleOpenForm = (entry = null) => {
    if (entry) {
      setSelectedEntry(entry);
      setDate(entry.date.split('T')[0]); // Assuming date is YYYY-MM-DD
      setWeight(entry.weight.toString());
      setEditMode(true);
    } else {
      setSelectedEntry(null);
      setDate(new Date().toISOString().split('T')[0]);
      setWeight('');
      setEditMode(false);
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setSelectedEntry(null);
    setEditMode(false);
    setError(null); // Clear form-specific errors on close
  };

  // Handle Add/Update Submit
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null); // Clear previous errors

    if (!currentUser?.id) {
        setError('User not logged in.');
        return;
    }
    if (!date || !weight || isNaN(weight) || parseFloat(weight) <= 0) {
      setError('Please enter a valid date and weight');
      return;
    }

    const entryData = {
        userId: currentUser.id, // Include userId for backend check (until JWT)
        date: date,
        weight: parseFloat(weight)
    };

    try {
      let response;
      let updatedEntryData;

      if (editMode && selectedEntry) {
        // Update existing entry
        response = await fetch(`http://localhost:3002/api/weight-logs/${selectedEntry.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entryData) // Send full data including userId
        });
      } else {
        // Add new entry
        response = await fetch(`http://localhost:3002/api/weight-logs`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(entryData)
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
      console.error('Error saving weight entry:', error.message);
      setError(`Failed to save weight entry: ${error.message}. Please try again.`);
    }
  };

  // Handle Delete
  const handleDelete = async (entryId) => {
    if (!currentUser?.id) return;

    if (!window.confirm('Are you sure you want to delete this weight entry?')) {
      return;
    }
    setError(null);

    try {
      const response = await fetch(`http://localhost:3002/api/weight-logs/${entryId}`, {
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
      console.error('Error deleting weight entry:', error.message);
      setError(`Failed to delete weight entry: ${error.message}. Please try again.`);
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

  // Prepare chart data
  const prepareChartData = () => {
    const sortedEntries = [...entries]
      .sort((a, b) => new Date(a.date) - new Date(b.date));

    const dates = sortedEntries.map(entry => formatDate(entry.date));
    const weights = sortedEntries.map(entry => entry.weight);

    return {
      labels: dates,
      datasets: [
        {
          label: 'Weight (kg)',
          data: weights,
          borderColor: '#2196f3',
          backgroundColor: 'rgba(33, 150, 243, 0.1)',
          fill: true,
          tension: 0.4,
        }
      ]
    };
  };

  const chartOptions = {
    responsive: true,
    plugins: {
      legend: { position: 'top' },
      title: { display: true, text: 'Weight Progress Over Time' },
    },
    scales: {
      y: {
        title: { display: true, text: 'Weight (kg)' },
        min: entries.length > 0 ? Math.floor(stats.lowest * 0.95) : undefined, // Use undefined for auto-min if no entries
        beginAtZero: false // Don't force y-axis to start at 0
      }
    }
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
            Weight Tracking
          </Typography>
        </Grid>
        <Grid item>
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => handleOpenForm()}
            disabled={!currentUser} // Disable if not logged in
          >
            Log Weight
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {/* Stats Cards */}
      {entries.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={4} md={2}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Current</Typography>
                <Typography variant="h5" component="div">{stats.current} kg</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Average</Typography>
                <Typography variant="h5" component="div">{stats.average} kg</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Lowest</Typography>
                <Typography variant="h5" component="div">{stats.lowest} kg</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={6} sm={4} md={2}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Highest</Typography>
                <Typography variant="h5" component="div">{stats.highest} kg</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">Change</Typography>
                <Typography
                  variant="h5"
                  component="div"
                  color={parseFloat(stats.change) < 0 ? 'success.main' : parseFloat(stats.change) > 0 ? 'error.main' : 'text.primary'}
                >
                  {stats.change > 0 ? '+' : ''}{stats.change} kg
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </Grid>
      )}

      {/* Chart */}
      {entries.length > 0 && (
        <Paper sx={{ p: 3, mb: 4 }}>
          <Line data={prepareChartData()} options={chartOptions} />
        </Paper>
      )}

      {/* Weight Log Table */}
      {entries.length === 0 && !loading ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            You haven't logged any weight entries yet. Click "Log Weight" to get started!
          </Typography>
        </Paper>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Date</TableCell>
                <TableCell>Weight (kg)</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {/* Display entries sorted by date descending */}
              {entries.sort((a, b) => new Date(b.date) - new Date(a.date)).map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.date)}</TableCell>
                  <TableCell>{entry.weight} kg</TableCell>
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

      {/* Weight Form Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm}>
        <DialogTitle>{editMode ? 'Edit Weight Entry' : 'Add Weight Entry'}</DialogTitle>
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
                  margin="dense" // Changed margin
                  required
                  fullWidth
                  id="date"
                  label="Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{ shrink: true }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="dense" // Changed margin
                  required
                  fullWidth
                  id="weight"
                  label="Weight (kg)"
                  type="number"
                  inputProps={{ min: 0, step: 0.1 }}
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                />
              </Grid>
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

export default WeightLog;
