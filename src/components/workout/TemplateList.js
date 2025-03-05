import React from 'react';
import {
  Box,
  Typography,
  Paper,
  Button,
  Grid,
  IconButton,
  Tooltip
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';

/**
 * Component to display list of workout templates
 */
const TemplateList = ({
  templates,
  handleOpenExerciseForm,
  handleUseTemplate,
  handleDuplicateTemplate,
  handleOpenTemplateForm,
  handleDeleteTemplate
}) => {
  if (templates.length === 0) {
    return (
      <Paper sx={{ p: 3, textAlign: 'center' }}>
        <Typography variant="body1">
          You haven't created any workout templates yet. Templates make it easy to quickly log your regular workouts.
        </Typography>
      </Paper>
    );
  }

  return (
    <Grid container spacing={3}>
      {templates.map((template) => (
        <Grid item xs={12} sm={6} md={4} key={template.id}>
          <Paper sx={{ p: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
            <Typography variant="h6" component="h2" gutterBottom>
              {template.name}
            </Typography>
            
            {template.description && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 2, flexGrow: 1 }}>
                {template.description}
              </Typography>
            )}
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Button 
                variant="outlined" 
                size="small"
                onClick={() => handleOpenExerciseForm(template)}
                sx={{ mr: 1 }}
              >
                Exercises
              </Button>
              
              <Box>
                <Tooltip title="Use Template">
                  <IconButton 
                    color="primary" 
                    onClick={() => handleUseTemplate(template)}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <PlayArrowIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Duplicate">
                  <IconButton 
                    color="primary" 
                    onClick={() => handleDuplicateTemplate(template)}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <ContentCopyIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Edit">
                  <IconButton 
                    color="primary" 
                    onClick={() => handleOpenTemplateForm(template)}
                    size="small"
                    sx={{ mr: 1 }}
                  >
                    <EditIcon />
                  </IconButton>
                </Tooltip>
                
                <Tooltip title="Delete">
                  <IconButton 
                    color="error" 
                    onClick={() => handleDeleteTemplate(template.id)}
                    size="small"
                  >
                    <DeleteIcon />
                  </IconButton>
                </Tooltip>
              </Box>
            </Box>
          </Paper>
        </Grid>
      ))}
    </Grid>
  );
};

export default TemplateList;
