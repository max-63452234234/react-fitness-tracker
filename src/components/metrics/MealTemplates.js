import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Paper,
  Grid,
  CircularProgress,
  Alert,
  TextField,
  Button,
  Card,
  CardContent,
  CardActions,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import AddIcon from '@mui/icons-material/Add';
// import { supabase } from '../../index.js'; // REMOVED Supabase import

/**
 * MealTemplates component
 * Allows users to create and use meal templates for faster logging
 * @param {Object} props - Component props
 * @param {Object} props.currentUser - Current user object (e.g., { id: userId })
 */
const MealTemplates = ({ currentUser }) => { // Accept currentUser prop
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [userId, setUserId] = useState(null); // Use currentUser.id

  // Form state
  const [openForm, setOpenForm] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  const [calories, setCalories] = useState('');
  const [protein, setProtein] = useState('');
  const [carbs, setCarbs] = useState('');
  const [fat, setFat] = useState('');
  const [editMode, setEditMode] = useState(false);
  const [currentTemplate, setCurrentTemplate] = useState(null);

  // Fetch initial data
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!currentUser || !currentUser.id) {
        console.log("MealTemplates: No current user found.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const userId = currentUser.id;

        // --- Fetch meal templates from backend ---
        const response = await fetch(`http://localhost:3002/api/meal-templates?userId=${userId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTemplates(data.data || []);

      } catch (error) {
        console.error('Error fetching meal templates:', error.message);
        setError(`Failed to load meal templates: ${error.message}. Please try again.`);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [currentUser]); // Re-fetch if user changes

  const handleOpenForm = (template = null) => {
    setError(null); // Clear error when opening form
    if (template) {
      // Edit mode
      setCurrentTemplate(template);
      setTemplateName(template.name);
      setTemplateDescription(template.description || '');
      setCalories(template.calories.toString());
      setProtein(template.protein.toString());
      setCarbs(template.carbs.toString());
      setFat(template.fat.toString());
      setEditMode(true);
    } else {
      // Create mode
      setCurrentTemplate(null);
      setTemplateName('');
      setTemplateDescription('');
      setCalories('');
      setProtein('');
      setCarbs('');
      setFat('');
      setEditMode(false);
    }
    setOpenForm(true);
  };

  const handleCloseForm = () => {
    setOpenForm(false);
    setError(null); // Clear error on close
  };

  // Handle Add/Update Submit
  const handleSubmit = async () => {
     if (!currentUser?.id) {
         setError('User not logged in.');
         return;
     }
     setError(null);

    // Validate form
    if (!templateName || !calories || !protein || !carbs || !fat ||
        isNaN(parseInt(calories)) || isNaN(parseFloat(protein)) ||
        isNaN(parseFloat(carbs)) || isNaN(parseFloat(fat))) {
      setError('Please fill all fields with valid numbers.');
      return;
    }

    const mealData = {
      userId: currentUser.id, // Pass userId for backend check
      name: templateName,
      description: templateDescription,
      calories: parseInt(calories),
      protein: parseFloat(protein),
      carbs: parseFloat(carbs),
      fat: parseFloat(fat),
    };

    try {
      let response;
      let updatedTemplateData;

      if (editMode && currentTemplate) {
        // Update existing template
        response = await fetch(`http://localhost:3002/api/meal-templates/${currentTemplate.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mealData)
        });
      } else {
        // Create new template
        response = await fetch(`http://localhost:3002/api/meal-templates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(mealData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      updatedTemplateData = await response.json(); // Backend returns the created/updated template

      // Update state
      if (editMode) {
        setTemplates(templates.map(template =>
          template.id === currentTemplate.id ? updatedTemplateData.data : template
        ));
      } else {
        setTemplates([...templates, updatedTemplateData.data]);
      }

      handleCloseForm();
    } catch (error) {
      console.error('Error saving meal template:', error.message);
      setError(`Failed to save meal template: ${error.message}. Please try again.`);
    }
  };

  // Handle Delete
  const handleDelete = async (id) => {
    if (!currentUser?.id) return;

    if (!window.confirm('Are you sure you want to delete this meal template?')) {
      return;
    }
    setError(null);

    try {
      const response = await fetch(`http://localhost:3002/api/meal-templates/${id}`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          // Pass userId in body until JWT is implemented
          body: JSON.stringify({ userId: currentUser.id })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Remove from state
      setTemplates(templates.filter(template => template.id !== id));

    } catch (error) {
      console.error('Error deleting meal template:', error.message);
      setError(`Failed to delete meal template: ${error.message}. Please try again.`);
    }
  };

  // Handle using a template to log macros for today
  const handleUseTemplate = async (template) => {
    if (!currentUser?.id) return;
    setError(null);

    try {
      const today = new Date().toISOString().split('T')[0];

      // --- Create a new macro log entry using backend API ---
      const response = await fetch(`http://localhost:3002/api/macro-logs`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
              userId: currentUser.id,
              date: today,
              calories: template.calories,
              protein: template.protein,
              carbs: template.carbs,
              fat: template.fat
          })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      // Optionally show a success message (alert might be disruptive)
      console.log(`Logged ${template.name} for today!`);
      // Consider using a Snackbar for less intrusive feedback

    } catch (error) {
      console.error('Error using meal template:', error.message);
      setError(`Failed to log meal using template: ${error.message}. Please try again.`);
    }
  };

  // Show loading state
  if (loading) { // Simplified loading check
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
        <CircularProgress />
      </Box>
    );
  }

  return (
    <Box sx={{ flexGrow: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Meal Templates
        </Typography>

        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenForm()}
          disabled={!currentUser} // Disable if not logged in
        >
          Add Meal Template
        </Button>
      </Box>

      {error && !openForm && ( // Only show general error if form not open
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
          {error}
        </Alert>
      )}

      {templates.length === 0 && !loading ? (
        <Paper sx={{ p: 3, textAlign: 'center' }}>
          <Typography variant="body1">
            You haven't created any meal templates yet. Create meal templates to quickly log your regular meals.
          </Typography>
        </Paper>
      ) : (
        <Grid container spacing={3}>
          {templates.map(template => (
            <Grid item xs={12} sm={6} md={4} key={template.id}>
              <Card>
                <CardContent>
                  <Typography variant="h6" gutterBottom>
                    {template.name}
                  </Typography>

                  {template.description && (
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {template.description}
                    </Typography>
                  )}

                  <List dense>
                    <ListItem>
                      <ListItemText primary="Calories" secondary={`${template.calories} kcal`} />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText primary="Protein" secondary={`${template.protein}g`} />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText primary="Carbs" secondary={`${template.carbs}g`} />
                    </ListItem>
                    <Divider component="li" />
                    <ListItem>
                      <ListItemText primary="Fat" secondary={`${template.fat}g`} />
                    </ListItem>
                  </List>
                </CardContent>

                <CardActions>
                  <Button
                    size="small"
                    color="primary"
                    onClick={() => handleUseTemplate(template)}
                    disabled={!currentUser}
                  >
                    Use Template
                  </Button>
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton
                    size="small"
                    onClick={() => handleOpenForm(template)}
                    disabled={!currentUser}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton
                    size="small"
                    color="error"
                    onClick={() => handleDelete(template.id)}
                    disabled={!currentUser}
                  >
                    <DeleteIcon fontSize="small" />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Template Form Dialog */}
      <Dialog open={openForm} onClose={handleCloseForm} maxWidth="sm" fullWidth>
        <DialogTitle>{editMode ? 'Edit Meal Template' : 'Create Meal Template'}</DialogTitle>
        <DialogContent>
           {/* Display form-specific error */}
           {error && openForm && (
             <Alert severity="error" sx={{ mb: 2 }}>
               {error}
             </Alert>
           )}
          <TextField
            margin="dense" // Use dense margin in dialog
            label="Name"
            fullWidth
            required
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
          />

          <TextField
            margin="dense"
            label="Description (Optional)"
            fullWidth
            multiline
            rows={2}
            value={templateDescription}
            onChange={e => setTemplateDescription(e.target.value)}
          />

          <TextField
            margin="dense"
            label="Calories"
            type="number"
            fullWidth
            required
            value={calories}
            onChange={e => setCalories(e.target.value)}
            InputProps={{ inputProps: { min: 0 } }}
          />

          <Grid container spacing={2}>
            <Grid item xs={4}>
              <TextField
                margin="dense"
                label="Protein (g)"
                type="number"
                fullWidth
                required
                value={protein}
                onChange={e => setProtein(e.target.value)}
                InputProps={{ inputProps: { min: 0, step: 0.1 } }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                margin="dense"
                label="Carbs (g)"
                type="number"
                fullWidth
                required
                value={carbs}
                onChange={e => setCarbs(e.target.value)}
                InputProps={{ inputProps: { min: 0, step: 0.1 } }}
              />
            </Grid>
            <Grid item xs={4}>
              <TextField
                margin="dense"
                label="Fat (g)"
                type="number"
                fullWidth
                required
                value={fat}
                onChange={e => setFat(e.target.value)}
                InputProps={{ inputProps: { min: 0, step: 0.1 } }}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseForm}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained" color="primary">
            {editMode ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MealTemplates;
