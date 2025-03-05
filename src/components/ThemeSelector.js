import React, { useContext } from 'react';
import { 
  Box, 
  IconButton, 
  Menu, 
  MenuItem, 
  ListItemIcon, 
  ListItemText,
  Tooltip,
  Divider,
  Typography
} from '@mui/material';
import Brightness4Icon from '@mui/icons-material/Brightness4';
import Brightness7Icon from '@mui/icons-material/Brightness7';
import TextDecreaseIcon from '@mui/icons-material/TextDecrease';
import TextFieldsIcon from '@mui/icons-material/TextFields';
import TextIncreaseIcon from '@mui/icons-material/TextIncrease';
import SettingsIcon from '@mui/icons-material/Settings';
import CheckIcon from '@mui/icons-material/Check';

import { ThemeContext, TEXT_SIZES } from '../context/ThemeContext';

/**
 * Theme selector component that allows users to toggle between light/dark mode
 * and adjust text size
 */
const ThemeSelector = () => {
  const { mode, textSize, toggleThemeMode, changeTextSize } = useContext(ThemeContext);
  const [anchorEl, setAnchorEl] = React.useState(null);
  const open = Boolean(anchorEl);
  
  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  
  const handleClose = () => {
    setAnchorEl(null);
  };
  
  const handleTextSizeChange = (size) => {
    changeTextSize(size);
    handleClose();
  };
  
  // Get icon based on current text size
  const getTextSizeIcon = () => {
    switch(textSize) {
      case 'small':
        return <TextDecreaseIcon />;
      case 'large':
        return <TextIncreaseIcon />;
      case 'extraLarge':
        return <TextIncreaseIcon fontSize="large" />;
      default:
        return <TextFieldsIcon />;
    }
  };
  
  return (
    <Box>
      <Tooltip title="Appearance Settings">
        <IconButton
          onClick={handleClick}
          color="inherit"
          aria-label="appearance settings"
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          sx: { minWidth: 220 }
        }}
      >
        <MenuItem onClick={toggleThemeMode}>
          <ListItemIcon>
            {mode === 'dark' ? <Brightness7Icon /> : <Brightness4Icon />}
          </ListItemIcon>
          <ListItemText>
            {mode === 'dark' ? 'Light Mode' : 'Dark Mode'}
          </ListItemText>
        </MenuItem>
        
        <Divider />
        
        <Typography variant="subtitle2" sx={{ px: 2, py: 1 }}>
          Text Size
        </Typography>
        
        <MenuItem onClick={() => handleTextSizeChange('small')}>
          <ListItemIcon>
            <TextDecreaseIcon />
          </ListItemIcon>
          <ListItemText>Small</ListItemText>
          {textSize === 'small' && (
            <CheckIcon fontSize="small" color="primary" />
          )}
        </MenuItem>
        
        <MenuItem onClick={() => handleTextSizeChange('medium')}>
          <ListItemIcon>
            <TextFieldsIcon />
          </ListItemIcon>
          <ListItemText>Medium</ListItemText>
          {textSize === 'medium' && (
            <CheckIcon fontSize="small" color="primary" />
          )}
        </MenuItem>
        
        <MenuItem onClick={() => handleTextSizeChange('large')}>
          <ListItemIcon>
            <TextIncreaseIcon />
          </ListItemIcon>
          <ListItemText>Large</ListItemText>
          {textSize === 'large' && (
            <CheckIcon fontSize="small" color="primary" />
          )}
        </MenuItem>
        
        <MenuItem onClick={() => handleTextSizeChange('extraLarge')}>
          <ListItemIcon>
            <TextIncreaseIcon fontSize="large" />
          </ListItemIcon>
          <ListItemText>Extra Large</ListItemText>
          {textSize === 'extraLarge' && (
            <CheckIcon fontSize="small" color="primary" />
          )}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ThemeSelector;
