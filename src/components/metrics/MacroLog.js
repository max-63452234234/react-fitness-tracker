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
import { supabase } from '../../index.js';
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
 */
const MacroLog = () => {
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
  const [userId, setUserId] = useState(null);
  const [stats, setStats] = useState({
    avgCalories: 0,
    avgProtein: 0,
    avgCarbs: 0,
    avgFat: 0
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
          .from('macro_logs')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false });
          
        if (error) throw error;
        
        setEntries(data || []);
        
        // Calculate average stats
        if (data && data.length > 0) {
          const sumCalories = data.reduce((sum, entry) => sum + entry.calories, 0);
          const sumProtein = data.reduce((sum, entry) => sum + entry.protein, 0);
          const sumCarbs = data.reduce((sum, entry) => sum + entry.carbs, 0);
          const sumFat = data.reduce((sum, entry) => sum + entry.fat, 0);
          
          setStats({
            avgCalories: (sumCalories / data.length).toFixed(0),
            avgProtein: (sumProtein / data.length).toFixed(1),
            avgCarbs: (sumCarbs / data.length).toFixed(1),
            avgFat: (sumFat / data.length).toFixed(1)
          });
        }
      } catch (error) {
        console.error('Error fetching macro entries:', error.message);
        setError('Error loading nutrition data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
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
        date: entry.date.split('T')[0],
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) {
      setError('Please fill in all fields with valid numbers');
      return;
    }
    
    try {
      setError(null);
      
      const macroData = {
        date: formData.date,
        calories: parseFloat(formData.calories),
        protein: parseFloat(formData.protein),
        carbs: parseFloat(formData.carbs),
        fat: parseFloat(formData.fat)
      };
      
      if (editMode && selectedEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('macro_logs')
          .update(macroData)
          .eq('id', selectedEntry.id);
          
        if (error) throw error;
        
        // Update entry in state
        setEntries(entries.map(entry => 
          entry.id === selectedEntry.id 
            ? { ...entry, ...macroData }
            : entry
        ));
      } else {
        // Add new entry
        const { data, error } = await supabase
          .from('macro_logs')
          .insert([{ 
            user_id: userId,
            ...macroData
          }])
          .select();
          
        if (error) throw error;
        
        // Add new entry to state
        setEntries([data[0], ...entries]);
      }
      
      handleCloseForm();
      
      // Recalculate averages
      const allEntries = editMode 
        ? entries.map(entry => 
            entry.id === selectedEntry?.id 
              ? { ...entry, ...macroData }
              : entry
          )
        : [...entries, { ...macroData }];
      
      if (allEntries.length > 0) {
        const sumCalories = allEntries.reduce((sum, entry) => sum + entry.calories, 0);
        const sumProtein = allEntries.reduce((sum, entry) => sum + entry.protein, 0);
        const sumCarbs = allEntries.reduce((sum, entry) => sum + entry.carbs, 0);
        const sumFat = allEntries.reduce((sum, entry) => sum + entry.fat, 0);
        
        setStats({
          avgCalories: (sumCalories / allEntries.length).toFixed(0),
          avgProtein: (sumProtein / allEntries.length).toFixed(1),
          avgCarbs: (sumCarbs / allEntries.length).toFixed(1),
          avgFat: (sumFat / allEntries.length).toFixed(1)
        });
      }
    } catch (error) {
      console.error('Error saving macro entry:', error.message);
      setError('Failed to save nutrition data. Please try again.');
    }
  };
  
  const handleDelete = async (entryId) => {
    if (!window.confirm('Are you sure you want to delete this nutrition entry?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('macro_logs')
        .delete()
        .eq('id', entryId);
        
      if (error) throw error;
      
      // Remove entry from state
      const updatedEntries = entries.filter(entry => entry.id !== entryId);
      setEntries(updatedEntries);
      
      // Recalculate averages if there are still entries
      if (updatedEntries.length > 0) {
        const sumCalories = updatedEntries.reduce((sum, entry) => sum + entry.calories, 0);
        const sumProtein = updatedEntries.reduce((sum, entry) => sum + entry.protein, 0);
        const sumCarbs = updatedEntries.reduce((sum, entry) => sum + entry.carbs, 0);
        const sumFat = updatedEntries.reduce((sum, entry) => sum + entry.fat, 0);
        
        setStats({
          avgCalories: (sumCalories / updatedEntries.length).toFixed(0),
          avgProtein: (sumProtein / updatedEntries.length).toFixed(1),
          avgCarbs: (sumCarbs / updatedEntries.length).toFixed(1),
          avgFat: (sumFat / updatedEntries.length).toFixed(1)
        });
      } else {
        setStats({
          avgCalories: 0,
          avgProtein: 0,
          avgCarbs: 0,
          avgFat: 0
        });
      }
    } catch (error) {
      console.error('Error deleting macro entry:', error.message);
      setError('Failed to delete entry. Please try again.');
    }
  };
  
  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString();
  };
  
  // Prepare chart data for the most recent entry
  const prepareChartData = () => {
    if (entries.length === 0) return null;
    
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
      legend: {
        position: 'top',
      },
      title: {
        display: true,
        text: 'Macronutrient Distribution (Most Recent Entry)',
      },
    },
  };
  
  // Calculate calories from macros (for display purposes)
  const calculateTotalCalories = (p, c, f) => {
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
          >
            Log Nutrition
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
                    <Typography variant="body2" color="text.secondary">
                      Protein
                    </Typography>
                    <Typography variant="body1">
                      {stats.avgProtein}g
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Carbs
                    </Typography>
                    <Typography variant="body1">
                      {stats.avgCarbs}g
                    </Typography>
                  </Grid>
                  <Grid item xs={4}>
                    <Typography variant="body2" color="text.secondary">
                      Fat
                    </Typography>
                    <Typography variant="body1">
                      {stats.avgFat}g
                    </Typography>
                  </Grid>
                </Grid>
              </CardContent>
            </Card>
          </Grid>
          
          {entries.length > 0 && (
            <Grid item xs={12} md={9}>
              <Card>
                <CardContent>
                  <Bar 
                    data={prepareChartData()} 
                    options={chartOptions} 
                    height={entries.length > 0 ? 80 : 0}
                  />
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
      
      {/* Macro Log Table */}
      {entries.length === 0 ? (
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
      
      {/* Macro Form Dialog */}
      <Dialog 
        open={openForm} 
        onClose={handleCloseForm}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          {editMode ? 'Edit Nutrition Entry' : 'Add Nutrition Entry'}
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
                  name="date"
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={handleChange}
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
                  margin="normal"
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
                  margin="normal"
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
                  margin="normal"
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
                        parseFloat(formData.protein), 
                        parseFloat(formData.carbs), 
                        parseFloat(formData.fat)
                      )
                    } kcal
                  </Alert>
                </Grid>
              )}
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

export default MacroLog;
