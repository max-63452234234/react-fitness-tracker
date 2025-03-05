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
import { supabase } from '../../index.js';

/**
 * MealTemplates component
 * Allows users to create and use meal templates for faster logging
 */
const MealTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  
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
  
  useEffect(() => {
    const fetchTemplates = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        
        // Fetch meal templates
        const { data, error } = await supabase
          .from('meal_templates')
          .select('*')
          .eq('user_id', user.id)
          .order('name');
          
        if (error) throw error;
        
        setTemplates(data || []);
      } catch (error) {
        console.error('Error fetching meal templates:', error.message);
        setError('Failed to load meal templates. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchTemplates();
  }, []);
  
  const handleOpenForm = (template = null) => {
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
  };
  
  const handleSubmit = async () => {
    try {
      // Validate form
      if (!templateName || !calories || !protein || !carbs || !fat) {
        setError('Please fill all required fields');
        return;
      }
      
      const mealData = {
        name: templateName,
        description: templateDescription,
        calories: parseInt(calories),
        protein: parseFloat(protein),
        carbs: parseFloat(carbs),
        fat: parseFloat(fat),
        user_id: userId
      };
      
      if (editMode && currentTemplate) {
        // Update existing template
        const { error } = await supabase
          .from('meal_templates')
          .update(mealData)
          .eq('id', currentTemplate.id);
          
        if (error) throw error;
        
        // Update state
        setTemplates(templates.map(template => 
          template.id === currentTemplate.id 
            ? { ...template, ...mealData } 
            : template
        ));
      } else {
        // Create new template
        const { data, error } = await supabase
          .from('meal_templates')
          .insert([mealData])
          .select();
          
        if (error) throw error;
        
        // Add to state
        setTemplates([...templates, data[0]]);
      }
      
      handleCloseForm();
    } catch (error) {
      console.error('Error saving meal template:', error.message);
      setError('Failed to save meal template. Please try again.');
    }
  };
  
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this meal template?')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('meal_templates')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Remove from state
      setTemplates(templates.filter(template => template.id !== id));
    } catch (error) {
      console.error('Error deleting meal template:', error.message);
      setError('Failed to delete meal template. Please try again.');
    }
  };
  
  const handleUseTemplate = async (template) => {
    try {
      const today = new Date().toISOString().split('T')[0];
      
      // Create a new macro log entry using this template
      const { error } = await supabase
        .from('macro_logs')
        .insert([{
          user_id: userId,
          date: today,
          calories: template.calories,
          protein: template.protein,
          carbs: template.carbs,
          fat: template.fat
        }]);
        
      if (error) throw error;
      
      alert(`Logged ${template.name} for today!`);
    } catch (error) {
      console.error('Error using meal template:', error.message);
      setError('Failed to log meal. Please try again.');
    }
  };
  
  // Show loading state
  if (loading && templates.length === 0) {
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
        >
          Add Meal Template
        </Button>
      </Box>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {templates.length === 0 ? (
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
                  >
                    Use Template
                  </Button>
                  <Box sx={{ flexGrow: 1 }} />
                  <IconButton 
                    size="small" 
                    onClick={() => handleOpenForm(template)}
                  >
                    <EditIcon fontSize="small" />
                  </IconButton>
                  <IconButton 
                    size="small" 
                    color="error"
                    onClick={() => handleDelete(template.id)}
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
        <DialogTitle>
          {editMode ? 'Edit Meal Template' : 'Create Meal Template'}
        </DialogTitle>
        <DialogContent>
          <TextField
            margin="normal"
            label="Name"
            fullWidth
            required
            value={templateName}
            onChange={e => setTemplateName(e.target.value)}
          />
          
          <TextField
            margin="normal"
            label="Description (Optional)"
            fullWidth
            multiline
            rows={2}
            value={templateDescription}
            onChange={e => setTemplateDescription(e.target.value)}
          />
          
          <TextField
            margin="normal"
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
                margin="normal"
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
                margin="normal"
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
                margin="normal"
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
