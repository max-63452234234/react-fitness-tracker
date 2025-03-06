import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import { supabase } from '../../index.js';

// Import components
import TemplateList from './TemplateList';
import TemplateForm from './forms/TemplateForm';
import ExerciseFormDialog from './forms/ExerciseFormDialog';

/**
 * WorkoutTemplates component
 * Allows users to create, edit, and use workout templates
 */
const WorkoutTemplates = () => {
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [userId, setUserId] = useState(null);
  
  // Template form state
  const [openTemplateForm, setOpenTemplateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');
  
  // Exercise form state
  const [openExerciseForm, setOpenExerciseForm] = useState(false);
  const [templateExercises, setTemplateExercises] = useState([]);
  const [currentExercise, setCurrentExercise] = useState({
    name: '',
    sets: '',
    reps: '',
    weight: ''
  });
  
  // Common exercises
  const [commonExercises, setCommonExercises] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [exercisesByCategory, setExercisesByCategory] = useState({});
  
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        
        // Get current user
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) return;
        setUserId(user.id);
        
        // Fetch templates
        const { data: templateData, error: templateError } = await supabase
          .from('workout_templates')
          .select('*')
          .eq('user_id', user.id)
          .order('name');
          
        if (templateError) throw templateError;
        setTemplates(templateData || []);
        
        // Fetch common exercises
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('common_exercises')
          .select('*')
          .order('name');
          
        if (exerciseError) throw exerciseError;
        setCommonExercises(exerciseData || []);
        
        // Group exercises by category
        const uniqueCategories = [...new Set(exerciseData.map(ex => ex.category))];
        setCategories(uniqueCategories);
        
        const exerciseGroups = {};
        uniqueCategories.forEach(category => {
          exerciseGroups[category] = exerciseData.filter(ex => ex.category === category);
        });
        setExercisesByCategory(exerciseGroups);
        
      } catch (error) {
        console.error('Error fetching data:', error.message);
        setError('Failed to load data. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, []);
  
  const handleOpenTemplateForm = (template = null) => {
    if (template) {
      setSelectedTemplate(template);
      setTemplateName(template.name);
      setTemplateDescription(template.description || '');
      setEditMode(true);
    } else {
      setSelectedTemplate(null);
      setTemplateName('');
      setTemplateDescription('');
      setEditMode(false);
    }
    setOpenTemplateForm(true);
  };
  
  const handleCloseTemplateForm = () => {
    setOpenTemplateForm(false);
    setSelectedTemplate(null);
    setTemplateName('');
    setTemplateDescription('');
    setEditMode(false);
  };
  
  const handleOpenExerciseForm = async (template) => {
    try {
      setSelectedTemplate(template);
      setLoading(true);
      
      // Fetch exercises for this template
      const { data, error } = await supabase
        .from('template_exercises')
        .select('*')
        .eq('template_id', template.id)
        .order('order_index');
        
      if (error) throw error;
      
      setTemplateExercises(data || []);
      setOpenExerciseForm(true);
    } catch (error) {
      console.error('Error fetching template exercises:', error.message);
      setError('Failed to load template exercises. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  const handleCloseExerciseForm = () => {
    setOpenExerciseForm(false);
    setSelectedTemplate(null);
    setTemplateExercises([]);
    setCurrentExercise({
      name: '',
      sets: '',
      reps: '',
      weight: ''
    });
    setSelectedCategory('');
  };
  
  const handleSaveTemplate = async () => {
    if (!templateName.trim()) {
      setError('Please enter a template name');
      return;
    }
    
    try {
      if (editMode) {
        // Update existing template
        const { error } = await supabase
          .from('workout_templates')
          .update({
            name: templateName.trim(),
            description: templateDescription.trim()
          })
          .eq('id', selectedTemplate.id);
          
        if (error) throw error;
        
        // Update template in state
        setTemplates(templates.map(t => 
          t.id === selectedTemplate.id 
            ? { ...t, name: templateName.trim(), description: templateDescription.trim() } 
            : t
        ));
      } else {
        // Create new template
        const { data, error } = await supabase
          .from('workout_templates')
          .insert([{
            user_id: userId,
            name: templateName.trim(),
            description: templateDescription.trim()
          }])
          .select();
          
        if (error) throw error;
        
        // Add new template to state
        setTemplates([...templates, data[0]]);
      }
      
      handleCloseTemplateForm();
    } catch (error) {
      console.error('Error saving template:', error.message);
      setError('Failed to save template. Please try again.');
    }
  };
  
  const handleDeleteTemplate = async (id) => {
    if (!window.confirm('Are you sure you want to delete this template? This will delete all exercises in this template.')) {
      return;
    }
    
    try {
      const { error } = await supabase
        .from('workout_templates')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Remove template from state
      setTemplates(templates.filter(t => t.id !== id));
    } catch (error) {
      console.error('Error deleting template:', error.message);
      setError('Failed to delete template. Please try again.');
    }
  };
  
  const handleExerciseChange = (e) => {
    const { name, value } = e.target;
    setCurrentExercise(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  const handleSelectCommonExercise = (exerciseName) => {
    setCurrentExercise(prev => ({
      ...prev,
      name: exerciseName
    }));
  };
  
  const handleAddExercise = async (exerciseData) => {
    // Basic validation
    if (!exerciseData.name.trim()) {
      setError('Exercise name is required');
      return;
    }
    
    // Validate based on exercise type
    if (exerciseData.exercise_type === 'weight_based' && 
        (!exerciseData.sets || !exerciseData.reps)) {
      setError('Sets and reps are required for weight-based exercises');
      return;
    } else if ((exerciseData.exercise_type === 'cardio_time' || 
               exerciseData.exercise_type === 'time_based') && 
               !exerciseData.duration) {
      setError('Duration is required for time-based exercises');
      return;
    } else if (exerciseData.exercise_type === 'cardio_distance' && 
              (!exerciseData.distance || !exerciseData.distance_unit)) {
      setError('Distance and unit are required for distance-based exercises');
      return;
    }
    
    try {
      const orderIndex = templateExercises.length;
      
      // Prepare exercise data based on type
      const exerciseToInsert = { 
        template_id: selectedTemplate.id,
        name: exerciseData.name.trim(),
        exercise_type: exerciseData.exercise_type,
        order_index: orderIndex,
        // Always include sets and reps as they're required by the database schema
        sets: exerciseData.sets || 1,
        reps: exerciseData.reps || 1
      };
      
      // Add type-specific fields
      if (exerciseData.exercise_type === 'weight_based') {
        exerciseToInsert.weight = exerciseData.weight || 0;
      } else if (exerciseData.exercise_type === 'cardio_distance') {
        exerciseToInsert.distance = exerciseData.distance;
        exerciseToInsert.distance_unit = exerciseData.distance_unit;
        if (exerciseData.duration) {
          exerciseToInsert.duration = exerciseData.duration;
        }
      } else if (exerciseData.exercise_type === 'cardio_time' || 
                exerciseData.exercise_type === 'time_based') {
        // Make sure duration is a number
        exerciseToInsert.duration = typeof exerciseData.duration === 'number' 
          ? exerciseData.duration 
          : parseInt(exerciseData.duration) || 0;
        if (exerciseData.intensity) {
          exerciseToInsert.intensity = exerciseData.intensity;
        }
      }
      
      const { data, error } = await supabase
        .from('template_exercises')
        .insert([exerciseToInsert])
        .select();
        
      if (error) throw error;
      
      // Add to state
      setTemplateExercises([...templateExercises, data[0]]);
      
      // Reset form
      setCurrentExercise({
        name: '',
        sets: '',
        reps: '',
        weight: ''
      });
    } catch (error) {
      console.error('Error adding exercise:', error.message);
      setError('Failed to add exercise. Please try again.');
    }
  };
  
  const handleDeleteExercise = async (id) => {
    try {
      const { error } = await supabase
        .from('template_exercises')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update exercise orders
      const remainingExercises = templateExercises.filter(e => e.id !== id);
      const updatedExercises = remainingExercises.map((exercise, index) => ({
        ...exercise,
        order_index: index
      }));
      
      // Update order indexes in database
      for (const exercise of updatedExercises) {
        await supabase
          .from('template_exercises')
          .update({ order_index: exercise.order_index })
          .eq('id', exercise.id);
      }
      
      // Update state
      setTemplateExercises(updatedExercises);
    } catch (error) {
      console.error('Error deleting exercise:', error.message);
      setError('Failed to delete exercise. Please try again.');
    }
  };
  
  const handleUseTemplate = async (template) => {
    try {
      // Fetch exercises for this template
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('template_exercises')
        .select('*')
        .eq('template_id', template.id)
        .order('order_index');
        
      if (exerciseError) throw exerciseError;
      
      // Create a new workout
      const today = new Date().toISOString().split('T')[0];
      const { data: workoutData, error: workoutError } = await supabase
        .from('workouts')
        .insert([{
          user_id: userId,
          date: today,
          notes: `Created from template: ${template.name}`
        }])
        .select();
        
      if (workoutError) throw workoutError;
      
      // Add exercises to workout
      const workoutId = workoutData[0].id;
      const exercisesToInsert = exerciseData.map(e => {
        // Create base exercise data
        const exercise = {
          workout_id: workoutId,
          name: e.name,
          exercise_type: e.exercise_type || 'weight_based' // Default to weight_based for backwards compatibility
        };
        
        // Add type-specific fields
        if (!e.exercise_type || e.exercise_type === 'weight_based') {
          exercise.sets = e.sets;
          exercise.reps = e.reps;
          exercise.weight = e.weight;
        } else if (e.exercise_type === 'cardio_distance') {
          exercise.distance = e.distance;
          exercise.distance_unit = e.distance_unit;
          exercise.duration = e.duration;
        } else if (e.exercise_type === 'cardio_time' || e.exercise_type === 'time_based') {
          exercise.duration = e.duration;
          if (e.intensity) {
            exercise.intensity = e.intensity;
          }
        }
        
        return exercise;
      });
      
      if (exercisesToInsert.length > 0) {
        const { error: insertError } = await supabase
          .from('exercises')
          .insert(exercisesToInsert);
          
        if (insertError) throw insertError;
      }
      
      // Redirect to workouts page
      window.location.href = '/workouts';
    } catch (error) {
      console.error('Error using template:', error.message);
      setError('Failed to create workout from template. Please try again.');
    }
  };
  
  const handleDuplicateTemplate = async (template) => {
    try {
      // Create a new template
      const { data: newTemplate, error: templateError } = await supabase
        .from('workout_templates')
        .insert([{
          user_id: userId,
          name: `${template.name} (Copy)`,
          description: template.description
        }])
        .select();
        
      if (templateError) throw templateError;
      
      // Fetch exercises from original template
      const { data: exerciseData, error: exerciseError } = await supabase
        .from('template_exercises')
        .select('*')
        .eq('template_id', template.id)
        .order('order_index');
        
      if (exerciseError) throw exerciseError;
      
      // Add exercises to new template
      if (exerciseData.length > 0) {
        const exercisesToInsert = exerciseData.map(e => ({
          template_id: newTemplate[0].id,
          name: e.name,
          sets: e.sets,
          reps: e.reps,
          weight: e.weight,
          order_index: e.order_index
        }));
        
        const { error: insertError } = await supabase
          .from('template_exercises')
          .insert(exercisesToInsert);
          
        if (insertError) throw insertError;
      }
      
      // Add new template to state
      setTemplates([...templates, newTemplate[0]]);
    } catch (error) {
      console.error('Error duplicating template:', error.message);
      setError('Failed to duplicate template. Please try again.');
    }
  };

  if (loading && templates.length === 0) {
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
            Workout Templates
          </Typography>
        </Grid>
        <Grid item>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            onClick={() => handleOpenTemplateForm()}
          >
            Create Template
          </Button>
        </Grid>
      </Grid>
      
      {error && (
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      )}
      
      {/* Template List */}
      <TemplateList 
        templates={templates} 
        handleOpenExerciseForm={handleOpenExerciseForm}
        handleUseTemplate={handleUseTemplate}
        handleDuplicateTemplate={handleDuplicateTemplate}
        handleOpenTemplateForm={handleOpenTemplateForm}
        handleDeleteTemplate={handleDeleteTemplate}
      />
      
      {/* Template Form Dialog */}
      <TemplateForm 
        open={openTemplateForm}
        onClose={handleCloseTemplateForm}
        templateName={templateName}
        setTemplateName={setTemplateName}
        templateDescription={templateDescription}
        setTemplateDescription={setTemplateDescription}
        editMode={editMode}
        handleSaveTemplate={handleSaveTemplate}
      />
      
      {/* Exercise Form Dialog */}
      <ExerciseFormDialog 
        open={openExerciseForm}
        onClose={handleCloseExerciseForm}
        loading={loading}
        selectedTemplate={selectedTemplate}
        templateExercises={templateExercises}
        currentExercise={currentExercise}
        handleExerciseChange={handleExerciseChange}
        handleAddExercise={handleAddExercise}
        handleDeleteExercise={handleDeleteExercise}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories}
        exercisesByCategory={exercisesByCategory}
        handleSelectCommonExercise={handleSelectCommonExercise}
      />
    </Box>
  );
};

export default WorkoutTemplates;
