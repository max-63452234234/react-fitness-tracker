import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button
} from '@mui/material';

/**
 * Form component for creating or editing workout templates
 */
const TemplateForm = ({
  open,
  onClose,
  templateName,
  setTemplateName,
  templateDescription,
  setTemplateDescription,
  editMode,
  handleSaveTemplate
}) => {
  return (
    <Dialog open={open} onClose={onClose} maxWidth="sm" fullWidth>
      <DialogTitle>
        {editMode ? 'Edit Template' : 'Create Template'}
      </DialogTitle>
      <DialogContent>
        <TextField
          margin="normal"
          required
          fullWidth
          id="templateName"
          label="Template Name"
          value={templateName}
          onChange={(e) => setTemplateName(e.target.value)}
          placeholder="e.g., Push Day, Full Body Workout, etc."
        />
        
        <TextField
          margin="normal"
          fullWidth
          id="templateDescription"
          label="Description (Optional)"
          value={templateDescription}
          onChange={(e) => setTemplateDescription(e.target.value)}
          placeholder="Describe your template..."
          multiline
          rows={3}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={onClose}>Cancel</Button>
        <Button onClick={handleSaveTemplate} variant="contained" color="primary">
          {editMode ? 'Update' : 'Create'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TemplateForm;
