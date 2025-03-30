import React, { useState, useEffect, useCallback } from 'react'; // Added useCallback
import {
  Box,
  Typography,
  Button,
  Grid,
  CircularProgress,
  Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
// import { supabase } from '../../index.js'; // REMOVED Supabase import
import { useNavigate } from 'react-router-dom'; // Added for navigation

// Import components
import TemplateList from './TemplateList';
import TemplateForm from './forms/TemplateForm';
import ExerciseFormDialog from './forms/ExerciseFormDialog';

/**
 * WorkoutTemplates component
 * Allows users to create, edit, and use workout templates
 * @param {Object} props - Component props
 * @param {Object} props.currentUser - Current user object (e.g., { id: userId })
 */
const WorkoutTemplates = ({ currentUser }) => { // Accept currentUser prop
  const [templates, setTemplates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  // const [userId, setUserId] = useState(null); // Use currentUser.id

  // Template form state
  const [openTemplateForm, setOpenTemplateForm] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState(null);
  const [editMode, setEditMode] = useState(false);
  const [templateName, setTemplateName] = useState('');
  const [templateDescription, setTemplateDescription] = useState('');

  // Exercise form state
  const [openExerciseForm, setOpenExerciseForm] = useState(false);
  const [templateExercises, setTemplateExercises] = useState([]);
  const [loadingExercises, setLoadingExercises] = useState(false); // Separate loading for exercises
  const [currentExercise, setCurrentExercise] = useState({ name: '', sets: '', reps: '', weight: '' }); // Added state for the exercise being added/edited in the dialog

  // Common exercises (Fetching removed, pass empty array for now)
  const [commonExercises, setCommonExercises] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCategory, setSelectedCategory] = useState('');
  const [exercisesByCategory, setExercisesByCategory] = useState({});

  // Fetch initial templates
  useEffect(() => {
    const fetchTemplates = async () => {
      if (!currentUser || !currentUser.id) {
        console.log("WorkoutTemplates: No current user found.");
        setLoading(false);
        return;
      }
      try {
        setLoading(true);
        setError(null);
        const userId = currentUser.id;

        // --- Fetch templates from backend ---
        const response = await fetch(`http://localhost:3002/api/workout-templates?userId=${userId}`);
        if (!response.ok) {
          const errorData = await response.json();
          throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        setTemplates(data.data || []);

        // --- Fetch common exercises ---
        try {
            const commonExResponse = await fetch('http://localhost:3002/api/common-exercises');
            if (!commonExResponse.ok) {
                console.error("Failed to fetch common exercises for template form");
                setCommonExercises([]); // Set empty on failure
            } else {
                const commonExData = await commonExResponse.json();
                setCommonExercises(commonExData.data || []);
                // TODO: Process categories/exercisesByCategory if needed by ExerciseFormDialog
                setCategories([]); // Keep empty for now
                setExercisesByCategory({}); // Keep empty for now
            }
        } catch (commonExError) {
             console.error('Error fetching common exercises:', commonExError.message);
             setCommonExercises([]);
             setCategories([]);
             setExercisesByCategory({});
        }


      } catch (error) {
        console.error('Error fetching templates:', error.message);
        setError(`Failed to load templates: ${error.message}. Please try again.`);
        setTemplates([]);
      } finally {
        setLoading(false);
      }
    };

    fetchTemplates();
  }, [currentUser]); // Re-fetch if user changes

  const handleOpenTemplateForm = (template = null) => {
    setError(null);
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
    setSelectedTemplate(null); // Clear selected template on close
    setTemplateName('');
    setTemplateDescription('');
    setEditMode(false);
    setError(null);
  };

  // Fetch exercises when opening the exercise form
  const handleOpenExerciseForm = async (template) => {
     if (!currentUser?.id) return;
    try {
      setSelectedTemplate(template); // Set the selected template
      setLoadingExercises(true);
      setError(null);
      setTemplateExercises([]); // Clear previous exercises

      // --- Fetch exercises for this template from backend ---
      const response = await fetch(`http://localhost:3002/api/workout-templates/${template.id}/exercises?userId=${currentUser.id}`); // Pass userId for auth check
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setTemplateExercises(data.data || []);
      setOpenExerciseForm(true);

    } catch (error) {
      console.error('Error fetching template exercises:', error.message);
      setError(`Failed to load exercises for ${template.name}: ${error.message}.`);
      setOpenExerciseForm(false); // Don't open form if fetch fails
      setSelectedTemplate(null);
    } finally {
      setLoadingExercises(false);
    }
  };

  const handleCloseExerciseForm = () => {
    setOpenExerciseForm(false);
    setSelectedTemplate(null);
    setTemplateExercises([]);
    setSelectedCategory('');
    setError(null);
  };

  // Handler for changes within the ExerciseFormDialog's fields
  // Wrap in useCallback to stabilize the function reference
  const handleExerciseChange = useCallback((e) => {
      const { name, value } = e.target;
      // Use functional update form of setState
      setCurrentExercise(prev => ({ ...prev, [name]: value }));
  }, []); // Empty dependency array as it only uses setCurrentExercise


  // Save Template (Create or Update)
  const handleSaveTemplate = async () => {
    if (!currentUser?.id) return;
    if (!templateName.trim()) {
      setError('Please enter a template name');
      return;
    }
    setError(null);

    const templateData = {
      userId: currentUser.id,
      name: templateName.trim(),
      description: templateDescription.trim()
    };

    try {
      let response;
      let updatedTemplateData;

      if (editMode && selectedTemplate) {
        // Update existing template
        response = await fetch(`http://localhost:3002/api/workout-templates/${selectedTemplate.id}`, {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(templateData)
        });
      } else {
        // Create new template
        response = await fetch(`http://localhost:3002/api/workout-templates`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(templateData)
        });
      }

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      updatedTemplateData = await response.json();

      // Update state
      if (editMode) {
        setTemplates(templates.map(t =>
          t.id === selectedTemplate.id ? updatedTemplateData.data : t
        ));
      } else {
        setTemplates([...templates, updatedTemplateData.data]);
      }

      handleCloseTemplateForm();
    } catch (error) {
      console.error('Error saving template:', error.message);
      setError(`Failed to save template: ${error.message}. Please try again.`);
    }
  };

  // Delete Template
  const handleDeleteTemplate = async (id) => {
     if (!currentUser?.id) return;

     if (!window.confirm('Are you sure you want to delete this template? This will delete all exercises in this template.')) {
       return;
     }
     setError(null);

     try {
       const response = await fetch(`http://localhost:3002/api/workout-templates/${id}`, {
           method: 'DELETE',
           headers: { 'Content-Type': 'application/json' },
           body: JSON.stringify({ userId: currentUser.id }) // Pass userId until JWT
       });

       if (!response.ok) {
         const errorData = await response.json();
         throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
       }

       // Remove template from state
       setTemplates(templates.filter(t => t.id !== id));

     } catch (error) {
       console.error('Error deleting template:', error.message);
       setError(`Failed to delete template: ${error.message}. Please try again.`);
     }
   };

  // Add Exercise to Template
  const handleAddExercise = async (exerciseData) => {
     if (!currentUser?.id || !selectedTemplate?.id) return;
     setError(null);

     // Basic validation (can be enhanced in ExerciseFormDialog)
     if (!exerciseData.name.trim() || !exerciseData.sets || !exerciseData.reps) {
       setError('Exercise name, sets, and reps are required');
       return;
     }

     const exerciseToInsert = {
         userId: currentUser.id, // Pass for potential backend checks
         name: exerciseData.name.trim(),
         sets: parseInt(exerciseData.sets),
         reps: parseInt(exerciseData.reps),
         weight: exerciseData.weight ? parseFloat(exerciseData.weight) : null,
         order_index: templateExercises.length // Simple ordering for now
         // Note: exercise_type is not currently handled by backend for templates
     };

     try {
         const response = await fetch(`http://localhost:3002/api/workout-templates/${selectedTemplate.id}/exercises`, {
             method: 'POST',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify(exerciseToInsert)
         });

         if (!response.ok) {
             const errorData = await response.json();
             throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
         }

         const newExercise = await response.json();

         // Add to state
         setTemplateExercises([...templateExercises, newExercise.data]);

     } catch (error) {
         console.error('Error adding exercise:', error.message);
         setError(`Failed to add exercise: ${error.message}. Please try again.`);
     }
   };

  // Delete Exercise from Template
  const handleDeleteExercise = async (exerciseId) => {
     if (!currentUser?.id) return;
     setError(null);

     try {
         const response = await fetch(`http://localhost:3002/api/template-exercises/${exerciseId}`, {
             method: 'DELETE',
             headers: { 'Content-Type': 'application/json' },
             body: JSON.stringify({ userId: currentUser.id }) // Pass userId until JWT
         });

         if (!response.ok) {
             const errorData = await response.json();
             throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
         }

         // Update state (and potentially re-order if needed)
         const remainingExercises = templateExercises.filter(e => e.id !== exerciseId);
         // Simple re-ordering based on new array index
         const updatedExercises = remainingExercises.map((ex, index) => ({ ...ex, order_index: index }));
         setTemplateExercises(updatedExercises);

         // TODO: Optionally, could make backend calls here to update order_index
         // for remaining exercises if strict ordering is critical.

     } catch (error) {
         console.error('Error deleting exercise:', error.message);
         setError(`Failed to delete exercise: ${error.message}. Please try again.`);
     }
   };

  const navigate = useNavigate(); // Added hook

  // Use Template to Create Workout
  const handleUseTemplate = async (template) => {
    if (!currentUser?.id || !template?.id) return;
    setError(null);
    // Consider adding a loading state specific to this action if needed
    console.log(`Using template: ${template.name}`);

    try {
      // 1. Fetch exercises for the selected template
      const response = await fetch(`http://localhost:3002/api/workout-templates/${template.id}/exercises?userId=${currentUser.id}`);
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      const fetchedTemplateExercises = data.data || [];

      // 2. Map template exercises to the format expected by WorkoutForm
      //    (Assuming template exercises are primarily weight-based for now)
      //    NOTE: Template exercises currently only store name, sets, reps, weight, order_index
      const mappedExercises = fetchedTemplateExercises.map(ex => ({
        name: ex.name,
        exercise_type: 'weight_based', // Default type for template exercises
        sets: ex.sets,
        reps: ex.reps,
        weight: ex.weight !== null ? ex.weight : 0, // Use 0 if weight is null
        // Add other fields as null/default if needed by WorkoutForm's state structure
        distance: null,
        distance_unit: null,
        duration: null,
        intensity: null,
        // Add a temporary ID for list keys in WorkoutForm if necessary
        tempId: `template-${ex.id}-${Date.now()}`
      }));

      // 3. Navigate to Workout Log page and pass exercises in state
      navigate('/workouts', { state: { templateExercises: mappedExercises } });

    } catch (error) {
      console.error('Error using template:', error.message);
      setError(`Failed to load template exercises: ${error.message}.`);
    }
  };

  // Duplicate Template (Commented out - requires more backend logic)
  const handleDuplicateTemplate = async (template) => {
     console.log("TODO: Implement handleDuplicateTemplate", template);
     setError('Duplicating templates is not yet implemented.');
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
            disabled={!currentUser} // Disable if not logged in
          >
            Create Template
          </Button>
        </Grid>
      </Grid>

      {error && (
        <Alert severity="error" sx={{ mb: 3 }} onClose={() => setError(null)}>
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
        disabled={!currentUser} // Disable actions if not logged in
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
        loading={loadingExercises} // Use exercise loading state
        selectedTemplate={selectedTemplate}
        templateExercises={templateExercises}
        currentExercise={currentExercise} // Pass state down
        handleExerciseChange={handleExerciseChange} // Pass handler down
        handleAddExercise={handleAddExercise}
        handleDeleteExercise={handleDeleteExercise}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        categories={categories} // Pass empty array for now
        exercisesByCategory={exercisesByCategory} // Pass empty object for now
        // handleSelectCommonExercise={handleSelectCommonExercise} // Not needed if common exercises aren't fetched
        commonExercises={commonExercises} // Pass empty array for now
      />
    </Box>
  );
};

export default WorkoutTemplates;
