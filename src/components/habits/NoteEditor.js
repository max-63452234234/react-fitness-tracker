import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Typography,
  Button
} from '@mui/material';

/**
 * Dialog for adding or editing notes for habit entries
 */
const NoteEditor = ({
  editingCell,
  noteText,
  handleNoteChange,
  saveNote,
  closeNoteEditor,
  habits
}) => {
  return (
    <Dialog open={!!editingCell} onClose={closeNoteEditor} maxWidth="sm" fullWidth>
      <DialogTitle>
        Add Note
        {editingCell && (
          <Typography variant="caption" display="block" sx={{ mt: 1 }}>
            {editingCell.date} - {habits.find(h => h.id === editingCell.habitId)?.name}
          </Typography>
        )}
      </DialogTitle>
      <DialogContent>
        <TextField
          autoFocus
          margin="normal"
          id="note"
          label="Note"
          fullWidth
          multiline
          rows={4}
          value={noteText}
          onChange={handleNoteChange}
          placeholder="Add details about this habit entry..."
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={closeNoteEditor}>Cancel</Button>
        <Button onClick={saveNote} variant="contained" color="primary">
          Save
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default NoteEditor;
