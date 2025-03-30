import React, { useState, useEffect } from 'react';
import {
    Box,
    Typography,
    Paper,
    List,
    ListItem,
    ListItemText,
    IconButton,
    CircularProgress,
    Alert,
    Divider,
    Dialog, // For Edit/Delete confirmations
    DialogActions,
    DialogContent,
    // DialogContentText, // Removed unused
    DialogTitle,
    Button,
    TextField, // Added for edit form
    FormControl, // Added for edit form
    InputLabel, // Added for edit form
    Select, // Added for edit form
    MenuItem, // Added for edit form
    Grid // Added for edit form layout
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import SaveIcon from '@mui/icons-material/Save'; // Added for edit form

// Define options for dropdowns (can be shared/imported)
const bodyRegionOptions = ['Upper Body', 'Lower Body', 'Core', 'Full Body', 'Other'];
const categoryOptions = [
    'Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Neck', // Upper Body
    'Legs', 'Glutes', 'Calves', // Lower Body
    'Cardio', 'Full Body', 'Flexibility', 'Other' // Other
];

const ManageExercises = () => {
    const [exercises, setExercises] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null); // General list error

    // State for Edit Dialog
    const [openEditDialog, setOpenEditDialog] = useState(false);
    const [exerciseToEdit, setExerciseToEdit] = useState(null);
    const [editFormData, setEditFormData] = useState({
        name: '',
        body_region: '',
        category: '',
        equipment: '',
        description: ''
    });
    const [updating, setUpdating] = useState(false); // Loading state for update
    const [updateError, setUpdateError] = useState(null); // Error specific to update

    const fetchExercises = async () => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch('http://localhost:3002/api/common-exercises');
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
            }
            const data = await response.json();
            setExercises(data.data || []);
        } catch (err) {
            console.error("Error fetching exercises:", err);
            setError(err.message || 'Failed to load exercises.');
            setExercises([]); // Clear data on error
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchExercises();
    }, []);

    // --- Edit Functionality ---
    const handleOpenEditDialog = (exercise) => {
        setExerciseToEdit(exercise);
        setEditFormData({
            name: exercise.name || '',
            body_region: exercise.body_region || '',
            category: exercise.category || '',
            equipment: exercise.equipment || '',
            description: exercise.description || ''
        });
        setUpdateError(null); // Clear previous errors
        setOpenEditDialog(true);
    };

    const handleCloseEditDialog = () => {
        setOpenEditDialog(false);
        setExerciseToEdit(null);
        setUpdating(false); // Reset updating state
    };

    const handleEditFormChange = (e) => {
        const { name, value } = e.target;
        setEditFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleUpdateExercise = async (e) => {
        e.preventDefault(); // Prevent default form submission if used within a form tag
        if (!exerciseToEdit) return;

        setUpdateError(null);
        if (!editFormData.name || !editFormData.category) {
            setUpdateError('Exercise Name and Category are required.');
            return;
        }

        setUpdating(true);
        try {
            const response = await fetch(`http://localhost:3002/api/common-exercises/${exerciseToEdit.id}`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: editFormData.name.trim(),
                    body_region: editFormData.body_region || null,
                    category: editFormData.category,
                    equipment: editFormData.equipment.trim() || null,
                    description: editFormData.description.trim() || null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            handleCloseEditDialog(); // Close dialog on success
            fetchExercises(); // Refresh the list

        } catch (err) {
            console.error("Error updating exercise:", err);
            setUpdateError(err.message || 'Failed to update exercise.');
        } finally {
            setUpdating(false);
        }
    };

    // --- Delete Functionality ---
    const handleDelete = async (exerciseId) => {
        if (!window.confirm('Are you sure you want to delete this exercise? This cannot be undone.')) {
            return;
        }
        // Clear general error before attempting delete
        setError(null);
        try {
             const response = await fetch(`http://localhost:3002/api/common-exercises/${exerciseId}`, {
                 method: 'DELETE',
             });
             if (!response.ok) {
                 const errorData = await response.json();
                 throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
             }
             // Refresh list on success
             fetchExercises();
        } catch (err) {
             console.error("Error deleting exercise:", err);
             // Set general error for delete failure
             setError(err.message || 'Failed to delete exercise.');
        }
    };

    return (
        <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                Manage Custom Exercises
            </Typography>
            {loading && (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                </Box>
            )}
            {error && <Alert severity="error" sx={{ mb: 2 }} onClose={() => setError(null)}>{error}</Alert>}
            {!loading && exercises.length === 0 && !error && (
                <Typography>No custom exercises found.</Typography>
            )}
            {!loading && exercises.length > 0 && (
                <List>
                    {exercises.map((ex, index) => (
                        <React.Fragment key={ex.id}>
                            <ListItem
                                secondaryAction={
                                    <>
                                        <IconButton edge="end" aria-label="edit" onClick={() => handleOpenEditDialog(ex)} sx={{ mr: 1 }}>
                                            <EditIcon />
                                        </IconButton>
                                        <IconButton edge="end" aria-label="delete" onClick={() => handleDelete(ex.id)}>
                                            <DeleteIcon color="error" />
                                        </IconButton>
                                    </>
                                }
                            >
                                <ListItemText
                                    primary={ex.name}
                                    secondary={`${ex.body_region || 'N/A'} - ${ex.category} ${ex.equipment ? `(${ex.equipment})` : ''}`}
                                />
                            </ListItem>
                            {index < exercises.length - 1 && <Divider component="li" />}
                        </React.Fragment>
                    ))}
                </List>
            )}

            {/* Edit Exercise Dialog */}
            <Dialog open={openEditDialog} onClose={handleCloseEditDialog} maxWidth="sm" fullWidth>
                <DialogTitle>Edit Exercise</DialogTitle>
                <Box component="form" onSubmit={handleUpdateExercise}> {/* Use Box with onSubmit */}
                    <DialogContent>
                        {updateError && <Alert severity="error" sx={{ mb: 2 }}>{updateError}</Alert>}
                        <Grid container spacing={2} sx={{ mt: 1 }}> {/* Add margin top */}
                             <Grid item xs={12} sm={6}>
                                <TextField
                                    required
                                    fullWidth
                                    autoFocus // Focus on name field first
                                    margin="dense"
                                    id="edit-exercise-name"
                                    label="Exercise Name"
                                    name="name" // Add name attribute
                                    value={editFormData.name}
                                    onChange={handleEditFormChange}
                                    error={!!updateError && !editFormData.name}
                                    helperText={!!updateError && !editFormData.name ? "Name is required" : ""}
                                    disabled={updating}
                                />
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                 <FormControl fullWidth required margin="dense" error={!!updateError && !editFormData.category}>
                                    <InputLabel id="edit-exercise-category-label">Category</InputLabel>
                                    <Select
                                        labelId="edit-exercise-category-label"
                                        id="edit-exercise-category"
                                        name="category" // Add name attribute
                                        value={editFormData.category}
                                        label="Category *"
                                        onChange={handleEditFormChange}
                                        disabled={updating}
                                    >
                                        {categoryOptions.map((cat) => (
                                            <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                        ))}
                                    </Select>
                                     {!!updateError && !editFormData.category && <Typography variant="caption" color="error" sx={{ pl: 2 }}>Category is required</Typography>}
                                </FormControl>
                            </Grid>
                             <Grid item xs={12} sm={6}>
                                <FormControl fullWidth margin="dense">
                                    <InputLabel id="edit-exercise-body-region-label">Body Region</InputLabel>
                                    <Select
                                        labelId="edit-exercise-body-region-label"
                                        id="edit-exercise-body-region"
                                        name="body_region" // Add name attribute
                                        value={editFormData.body_region}
                                        label="Body Region"
                                        onChange={handleEditFormChange}
                                        disabled={updating}
                                    >
                                        <MenuItem value=""><em>None</em></MenuItem>
                                        {bodyRegionOptions.map((region) => (
                                            <MenuItem key={region} value={region}>{region}</MenuItem>
                                        ))}
                                    </Select>
                                </FormControl>
                            </Grid>
                            <Grid item xs={12} sm={6}>
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    id="edit-exercise-equipment"
                                    label="Equipment (Optional)"
                                    name="equipment" // Add name attribute
                                    value={editFormData.equipment}
                                    onChange={handleEditFormChange}
                                    disabled={updating}
                                />
                            </Grid>
                            <Grid item xs={12}>
                                <TextField
                                    fullWidth
                                    margin="dense"
                                    id="edit-exercise-description"
                                    label="Description (Optional)"
                                    name="description" // Add name attribute
                                    multiline
                                    rows={3}
                                    value={editFormData.description}
                                    onChange={handleEditFormChange}
                                    disabled={updating}
                                />
                            </Grid>
                        </Grid>
                    </DialogContent>
                    <DialogActions sx={{ pb: 2, px: 3 }}>
                        <Button onClick={handleCloseEditDialog} disabled={updating}>Cancel</Button>
                        <Button
                            type="submit" // Trigger form submission
                            variant="contained"
                            startIcon={updating ? <CircularProgress size={20} /> : <SaveIcon />}
                            disabled={updating}
                        >
                            {updating ? 'Saving...' : 'Save Changes'}
                        </Button>
                    </DialogActions>
                </Box>
            </Dialog>
        </Paper>
    );
};

export default ManageExercises;