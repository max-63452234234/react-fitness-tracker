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

import { ThemeContext } from '../context/ThemeContext'; // Removed TEXT_SIZES

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

  // Removed unused getTextSizeIcon function

  return (
    <Box>
      <Tooltip title="Appearance Settings">
        <IconButton
          onClick={handleClick}
          color="inherit"
          aria-label="appearance settings"
          sx={{ 
            bgcolor: 'rgba(255, 255, 255, 0.15)',
            '&:hover': {
              bgcolor: 'rgba(255, 255, 255, 0.25)', 
            },
            ml: 1
          }}
        >
          <SettingsIcon />
        </IconButton>
      </Tooltip>
      
      <Menu
        anchorEl={anchorEl}
        open={open}
        onClose={handleClose}
        PaperProps={{
          elevation: 3,
          sx: { 
            minWidth: 250,
            borderRadius: 3,
            mt: 1.5,
            overflow: 'visible',
            '&:before': {
              content: '""',
              display: 'block',
              position: 'absolute',
              top: 0,
              right: 14,
              width: 10,
              height: 10,
              bgcolor: 'background.paper',
              transform: 'translateY(-50%) rotate(45deg)',
              zIndex: 0,
            },
          }
        }}
        MenuListProps={{
          sx: { py: 1 }
        }}
        transformOrigin={{ horizontal: 'right', vertical: 'top' }}
        anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
      >
        <MenuItem 
          onClick={toggleThemeMode}
          sx={{ 
            borderRadius: 2,
            mx: 1,
            my: 0.5,
            transition: 'all 0.2s',
            '&:hover': {
              bgcolor: (theme) => theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.04)',
            }
          }}
        >
          <ListItemIcon>
            {mode === 'dark' ? 
              <Brightness7Icon sx={{ color: '#ffb74d' }} /> : 
              <Brightness4Icon sx={{ color: '#5c6bc0' }} />
            }
          </ListItemIcon>
          <ListItemText primary={mode === 'dark' ? 'Light Mode' : 'Dark Mode'} />
        </MenuItem>
        
        <Divider sx={{ my: 1.5 }} />
        
        <Typography 
          variant="subtitle2" 
          sx={{ 
            px: 3, 
            pb: 1, 
            pt: 0.5, 
            fontWeight: 600,
            color: 'text.secondary'
          }}
        >
          Text Size
        </Typography>
        
        <MenuItem 
          onClick={() => handleTextSizeChange('small')}
          sx={{ 
            borderRadius: 2,
            mx: 1,
            my: 0.5,
            bgcolor: textSize === 'small' ? (theme) => 
              theme.palette.mode === 'dark' ? 'rgba(64, 196, 255, 0.08)' : 'rgba(33, 150, 243, 0.08)' : 'transparent',
            '&:hover': {
              bgcolor: textSize === 'small' ? (theme) => 
                theme.palette.mode === 'dark' ? 'rgba(64, 196, 255, 0.12)' : 'rgba(33, 150, 243, 0.12)' : null
            }
          }}
        >
          <ListItemIcon sx={{ color: textSize === 'small' ? 'primary.main' : 'text.secondary' }}>
            <TextDecreaseIcon />
          </ListItemIcon>
          <ListItemText primary="Small" />
          {textSize === 'small' && (
            <CheckIcon fontSize="small" color="primary" />
          )}
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleTextSizeChange('medium')}
          sx={{ 
            borderRadius: 2,
            mx: 1,
            my: 0.5,
            bgcolor: textSize === 'medium' ? (theme) => 
              theme.palette.mode === 'dark' ? 'rgba(64, 196, 255, 0.08)' : 'rgba(33, 150, 243, 0.08)' : 'transparent',
            '&:hover': {
              bgcolor: textSize === 'medium' ? (theme) => 
                theme.palette.mode === 'dark' ? 'rgba(64, 196, 255, 0.12)' : 'rgba(33, 150, 243, 0.12)' : null
            }
          }}
        >
          <ListItemIcon sx={{ color: textSize === 'medium' ? 'primary.main' : 'text.secondary' }}>
            <TextFieldsIcon />
          </ListItemIcon>
          <ListItemText primary="Medium" />
          {textSize === 'medium' && (
            <CheckIcon fontSize="small" color="primary" />
          )}
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleTextSizeChange('large')}
          sx={{ 
            borderRadius: 2,
            mx: 1,
            my: 0.5,
            bgcolor: textSize === 'large' ? (theme) => 
              theme.palette.mode === 'dark' ? 'rgba(64, 196, 255, 0.08)' : 'rgba(33, 150, 243, 0.08)' : 'transparent',
            '&:hover': {
              bgcolor: textSize === 'large' ? (theme) => 
                theme.palette.mode === 'dark' ? 'rgba(64, 196, 255, 0.12)' : 'rgba(33, 150, 243, 0.12)' : null
            }
          }}
        >
          <ListItemIcon sx={{ color: textSize === 'large' ? 'primary.main' : 'text.secondary' }}>
            <TextIncreaseIcon />
          </ListItemIcon>
          <ListItemText primary="Large" />
          {textSize === 'large' && (
            <CheckIcon fontSize="small" color="primary" />
          )}
        </MenuItem>
        
        <MenuItem 
          onClick={() => handleTextSizeChange('extraLarge')}
          sx={{ 
            borderRadius: 2,
            mx: 1,
            my: 0.5,
            bgcolor: textSize === 'extraLarge' ? (theme) => 
              theme.palette.mode === 'dark' ? 'rgba(64, 196, 255, 0.08)' : 'rgba(33, 150, 243, 0.08)' : 'transparent',
            '&:hover': {
              bgcolor: textSize === 'extraLarge' ? (theme) => 
                theme.palette.mode === 'dark' ? 'rgba(64, 196, 255, 0.12)' : 'rgba(33, 150, 243, 0.12)' : null
            }
          }}
        >
          <ListItemIcon sx={{ color: textSize === 'extraLarge' ? 'primary.main' : 'text.secondary' }}>
            <TextIncreaseIcon />
          </ListItemIcon>
          <ListItemText primary="Extra Large" />
          {textSize === 'extraLarge' && (
            <CheckIcon fontSize="small" color="primary" />
          )}
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default ThemeSelector;
