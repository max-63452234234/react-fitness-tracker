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
import { supabase } from '../../index.js';
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
 */
const WeightLog = () => {
  const [entries, setEntries] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openForm, setOpenForm] = useState(false);
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [weight, setWeight] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState(null);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  const [stats, setStats] = useState({
    current: 0,
    average: 0,
    lowest: 0,
    highest: 0,
    change: 0,
  });

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) return;
        
        setUserId(user.id);
        
        const { data, error } = await supabase
          .from('weight_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
          
        if (error) throw error;
        
        setEntries(data || []);
        
        // Calculate stats if there are entries
        if (data && data.length > 0) {
          // Sort by date (ascending)
          const sortedEntries = [...data].sort((a, b) => 
            new Date(a.date) - new Date(b.date)
          );
          
          const weights = sortedEntries.map(entry => entry.weight);
          const current = weights[weights.length - 1];
          const lowest = Math.min(...weights);
          const highest = Math.max(...weights);
          const sum = weights.reduce((acc, weight) => acc + weight, 0);
          const average = sum / weights.length;
          
          // Change over time (last entry minus first entry)
          const first = weights[0];
          const change = current - first;
          
          setStats({
            current,
            average: average.toFixed(1),
            lowest,
            highest,
            change: change.toFixed(1)
          });
        }
      } catch (error) {
        console.error('Error fetching weight entries:', error.message);
        setError('Error loading weight data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleOpenForm = (entry = null) => {
    if (entry) {
      setSelectedEntry(entry);
      setDate(entry.date.split('T')[0]);
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
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!date || !weight || isNaN(weight) || parseFloat(weight) <= 0) {
      setError('Please enter a valid weight');
      return;
    }
    
    try {
      setError(null);
      
      if (editMode && selectedEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('weight_logs')
          .update({ 
            date,
            weight: parseFloat(weight)
          })
          .eq('id', selectedEntry.id);
          
        if (error) throw error;
        
        // Update entry in state
        setEntries(entries.map(entry => 
          entry.id === selectedEntry.id 
            ? { ...entry, date, weight: parseFloat(weight) }
            : entry
        ));
      } else {
        // Add new entry
        const { data, error } = await supabase
          .from('weight_logs')
          .insert([
            { 
              user_id: userId,
              date,
              weight: parseFloat(weight)
            }
          ])
          .select();
          
        if (error) throw error;
        
        // Add new entry to state
        setEntries([data[0], ...entries]);
      }
      
      handleCloseForm();
      
      // Recalculate stats
      const allEntries = [...entries];
      if (!editMode) {
        allEntries.push({ date, weight: parseFloat(weight) });
      } else {
        const index = allEntries.findIndex(e => e.id === selectedEntry.id);
        if (index !== -1) {
          allEntries[index] = { ...allEntries[index], date, weight: parseFloat(weight) };
        }
      }
      
      // Sort by date
      const sortedEntries = allEntries.sort((a, b) => 
        new Date(a.date) - new Date(b.date)
      );
      
      const weights = sortedEntries.map(entry => entry.weight);
      
      if (weights.length > 0) {
        const current = weights[weights.length - 1];
        const lowest = Math.min(...weights);
        const highest = Math.max(...weights);
        const sum = weights.reduce((acc, weight) => acc + weight, 0);
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
      }
    } catch (error) {
      console.error('Error saving weight entry:', error.message);
      setError('Failed to save weight entry. Please try again.');
    }
  };
  
  const handleDelete = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this weight entry?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('weight_logs')
        .delete()
        .eq('id', entryId);
        
      if (error) throw error;
      
      // Remove entry from state
      const updatedEntries = entries.filter(entry => entry.id !== entryId);
      setEntries(updatedEntries);
      
      // Recalculate stats
      if (updatedEntries.length > 0) {
        // Sort by date
        const sortedEntries = [...updatedEntries].sort((a, b) => 
          new Date(a.date) - new Date(b.date)
        );
        
        const weights = sortedEntries.map(entry => entry.weight);
        const current = weights[weights.length - 1];
        const lowest = Math.min(...weights);
        const highest = Math.max(...weights);
        const sum = weights.reduce((acc, weight) => acc + weight, 0);
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
        setStats({
          current: 0,
          average: 0,
          lowest: 0,
          highest: 0,
          change: 0,
        });
      }
    } catch (error) {
      console.error('Error deleting weight entry:', error.message);
      setError('Failed to delete weight entry. Please try again.');
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Prepare chart data
  const prepareChartData = () => {
    // Clone and sort entries by date (ascending)
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
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Weight Progress Over Time',
      },
    },
    scales: {
      y: {
        title: {
          display: true,
          text: 'Weight (kg)'
        },
        min: entries.length > 0 ? Math.floor(stats.lowest * 0.95) : 0,
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
          >
            Log Weight
          </Button>
        </Grid>
      </Grid>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Stats Cards */}
      {entries.length > 0 && (
        <Grid container spacing={3} sx={{ mb: 4 }}>
          <Grid item xs={6} sm={4} md={2}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Current
                </Typography>
                <Typography variant="h5" component="div">
                  {stats.current} kg
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={4} md={2}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Average
                </Typography>
                <Typography variant="h5" component="div">
                  {stats.average} kg
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={4} md={2}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Lowest
                </Typography>
                <Typography variant="h5" component="div">
                  {stats.lowest} kg
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={6} sm={4} md={2}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Highest
                </Typography>
                <Typography variant="h5" component="div">
                  {stats.highest} kg
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          
          <Grid item xs={12} sm={4} md={4}>
            <Card>
              <CardContent>
                <Typography variant="subtitle2" color="text.secondary">
                  Change
                </Typography>
                <Typography 
                  variant="h5" 
                  component="div"
                  color={
                    parseFloat(stats.change) < 0 
                      ? 'success.main' 
                      : parseFloat(stats.change) > 0 
                        ? 'error.main' 
                        : 'text.primary'
                  }
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
      {entries.length === 0 ? (
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
              {entries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell>{formatDate(entry.date)}</TableCell>
                  <TableCell>{entry.weight} kg</TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      color="primary"
                      onClick={() => handleOpenForm(entry)}
                      sx={{ mr: 1 }}
                    >
                      <EditIcon />
                    </IconButton>
                    <IconButton 
                      size="small" 
                      color="error"
                      onClick={() => handleDelete(entry.id)}
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
        <DialogTitle>
          {editMode ? 'Edit Weight Entry' : 'Add Weight Entry'}
        </DialogTitle>
        <Box component="form" onSubmit={handleSubmit}>
          <DialogContent>
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  margin="normal"
                  required
                  fullWidth
                  id="date"
                  label="Date"
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                  InputLabelProps={{
                    shrink: true,
                  }}
                />
              </Grid>
              <Grid item xs={12}>
                <TextField
                  margin="normal"
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
            <Button onClick={handleCloseForm}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="contained" 
              color="primary"
            >
              {editMode ? 'Update' : 'Save'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Box>
  );
};

export default WeightLog;
