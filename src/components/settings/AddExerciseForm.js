import React, { useState } from 'react';
import {
    Box,
    TextField,
    Button,
    Typography,
    Grid,
    Paper,
    FormControl,
    InputLabel,
    Select,
    MenuItem,
    CircularProgress,
    Alert
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';

// Define body region options
const bodyRegionOptions = ['Upper Body', 'Lower Body', 'Core', 'Full Body', 'Other'];
// Define category options (can be expanded)
const categoryOptions = [
    'Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Neck', // Upper Body
    'Legs', 'Glutes', 'Calves', // Lower Body
    'Cardio', 'Full Body', 'Flexibility', 'Other' // Other
];

const AddExerciseForm = ({ onExerciseAdded }) => {
    const [name, setName] = useState('');
    const [bodyRegion, setBodyRegion] = useState('');
    const [category, setCategory] = useState('');
    const [equipment, setEquipment] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [success, setSuccess] = useState(null);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        setSuccess(null);

        if (!name || !category) {
            setError('Exercise Name and Category are required.');
            return;
        }

        setLoading(true);
        try {
            const response = await fetch('http://localhost:3002/api/common-exercises', { // Use full backend URL
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: name.trim(),
                    body_region: bodyRegion || null, // Send null if empty
                    category: category,
                    equipment: equipment.trim() || null,
                    description: description.trim() || null,
                }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.error || `HTTP error! status: ${response.status}`);
            }

            setSuccess(`Exercise "${data.data.name}" added successfully!`);
            // Clear form
            setName('');
            setBodyRegion('');
            setCategory('');
            setEquipment('');
            setDescription('');
            // Optionally call a callback to refresh exercise list elsewhere
            if (onExerciseAdded) {
                onExerciseAdded(data.data);
            }

        } catch (err) {
            console.error("Error adding exercise:", err);
            setError(err.message || 'Failed to add exercise. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Paper sx={{ p: 3, mt: 3 }}>
            <Typography variant="h6" gutterBottom>
                Add Custom Exercise
            </Typography>
            <Box component="form" onSubmit={handleSubmit} noValidate>
                <Grid container spacing={2}>
                    <Grid item xs={12} sm={6}>
                        <TextField
                            required
                            fullWidth
                            id="exercise-name"
                            label="Exercise Name"
                            value={name}
                            onChange={(e) => setName(e.target.value)}
                            error={!!error && !name} // Basic error indication
                            helperText={!!error && !name ? "Name is required" : ""}
                        />
                    </Grid>
                    <Grid item xs={12} sm={6}>
                         <FormControl fullWidth required error={!!error && !category}>
                            <InputLabel id="exercise-category-label">Category</InputLabel>
                            <Select
                                labelId="exercise-category-label"
                                id="exercise-category"
                                value={category}
                                label="Category *"
                                onChange={(e) => setCategory(e.target.value)}
                            >
                                {categoryOptions.map((cat) => (
                                    <MenuItem key={cat} value={cat}>{cat}</MenuItem>
                                ))}
                                {/* Option to add a new category? Maybe later */}
                            </Select>
                             {!!error && !category && <Typography variant="caption" color="error">Category is required</Typography>}
                        </FormControl>
                    </Grid>
                     <Grid item xs={12} sm={6}>
                        <FormControl fullWidth>
                            <InputLabel id="exercise-body-region-label">Body Region (Optional)</InputLabel>
                            <Select
                                labelId="exercise-body-region-label"
                                id="exercise-body-region"
                                value={bodyRegion}
                                label="Body Region (Optional)"
                                onChange={(e) => setBodyRegion(e.target.value)}
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
                            id="exercise-equipment"
                            label="Equipment (Optional)"
                            value={equipment}
                            onChange={(e) => setEquipment(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        <TextField
                            fullWidth
                            id="exercise-description"
                            label="Description (Optional)"
                            multiline
                            rows={3}
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        />
                    </Grid>
                    <Grid item xs={12}>
                        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
                        {success && <Alert severity="success" sx={{ mb: 2 }} onClose={() => setSuccess(null)}>{success}</Alert>}
                        <Button
                            type="submit"
                            variant="contained"
                            startIcon={loading ? <CircularProgress size={20} /> : <AddIcon />}
                            disabled={loading}
                        >
                            {loading ? 'Adding...' : 'Add Exercise'}
                        </Button>
                    </Grid>
                </Grid>
            </Box>
        </Paper>
    );
};

export default AddExerciseForm;