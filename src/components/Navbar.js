import React, { useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  Box,
  IconButton,
  Menu,
  MenuItem,
  Avatar,
  Drawer,
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  Divider
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardIcon from '@mui/icons-material/Dashboard';
import FitnessCenterIcon from '@mui/icons-material/FitnessCenter';
// import ListAltIcon from '@mui/icons-material/ListAlt'; // Removed unused
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import RestaurantIcon from '@mui/icons-material/Restaurant';
// import FastfoodIcon from '@mui/icons-material/Fastfood'; // Removed unused
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import TimelineIcon from '@mui/icons-material/Timeline';
import { Link, useNavigate, useLocation } from 'react-router-dom';
// import { supabase } from '../index.js'; // Removed Supabase import
import ThemeSelector from './ThemeSelector';

/**
 * Navigation bar component that adapts based on authentication state
 * @param {Object} props - Component props
 * @param {Object} props.currentUser - Current user object (e.g., { id: userId }) or null
 * @param {Function} props.onLogout - Function to call when logout is clicked
 */
const Navbar = ({ currentUser, onLogout }) => { // Updated props
  const navigate = useNavigate();
  const location = useLocation();
  const [anchorEl, setAnchorEl] = useState(null);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);
  const open = Boolean(anchorEl);

  const handleMenu = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => { // Updated logout handler
    handleClose();
    if (onLogout) {
      onLogout(); // Call the function passed from App.js
    }
    // Navigation to /login will happen automatically in App.js due to state change
  };

  const handleProfile = () => {
    handleClose();
    navigate('/profile');
  };

  const toggleMobileDrawer = () => {
    setMobileDrawerOpen(!mobileDrawerOpen);
  };

  const handleMobileNavigation = (path) => {
    navigate(path);
    setMobileDrawerOpen(false);
  };

  // Navigation items with their icons and paths
  const navItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/dashboard' },
    { text: 'Workouts', icon: <FitnessCenterIcon />, path: '/workouts' },
    { text: 'Habits', icon: <CheckBoxIcon />, path: '/habits' },
    { text: 'Weight', icon: <MonitorWeightIcon />, path: '/weight' },
    { text: 'Macros', icon: <RestaurantIcon />, path: '/macros' },
    { text: 'Progress', icon: <TimelineIcon />, path: '/progress' },
    // Settings and personalization moved to profile
  ];

  return (
    <AppBar
      position="static"
      elevation={0}
      sx={{
        background: 'linear-gradient(90deg, #2196f3 0%, #42a5f5 100%)',
        mb: 3,
        borderRadius: { xs: 0, sm: '0 0 16px 16px' },
        maxWidth: { sm: '98%', lg: '94%' },
        mx: { sm: 'auto' },
        mt: { sm: '8px' },
      }}
    >
      <Toolbar sx={{ px: { xs: 2, sm: 3 } }}>
        <Typography
          variant="h6"
          component={Link}
          to="/"
          sx={{
            flexGrow: 1,
            color: 'white',
            textDecoration: 'none',
            fontWeight: 'bold',
            letterSpacing: '0.5px',
            fontSize: { xs: '1.1rem', sm: '1.25rem' }
          }}
        >
          Fitness Tracker
        </Typography>

        {currentUser ? ( // Check currentUser instead of session
          // Authenticated navigation
          <>
            {/* Mobile menu button - only visible on small screens */}
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={toggleMobileDrawer}
              sx={{ mr: 2, display: { xs: 'flex', md: 'none' } }}
            >
              <MenuIcon />
            </IconButton>

            {/* Mobile navigation drawer */}
            <Drawer
              anchor="left"
              open={mobileDrawerOpen}
              onClose={toggleMobileDrawer}
              PaperProps={{
                sx: {
                  borderRadius: '0 16px 16px 0',
                  overflow: 'hidden'
                }
              }}
            >
              <Box
                sx={{
                  width: 280,
                  bgcolor: (theme) => theme.palette.background.paper,
                }}
                role="presentation"
              >
                <Box sx={{
                  p: 2,
                  background: 'linear-gradient(90deg, #2196f3 0%, #42a5f5 100%)',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center'
                }}>
                  <Typography variant="h6" sx={{ fontWeight: 600 }}>
                    Fitness Tracker
                  </Typography>
                </Box>
                <List sx={{ py: 1 }}>
                  {navItems.map((item) => (
                    <ListItem
                      button
                      key={item.text}
                      onClick={() => handleMobileNavigation(item.path)}
                      selected={location.pathname === item.path}
                      sx={{
                        my: 0.5,
                        mx: 1,
                        borderRadius: 2,
                        bgcolor: location.pathname === item.path ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                        '&:hover': {
                          bgcolor: 'rgba(33, 150, 243, 0.1)',
                        },
                        '&.Mui-selected': {
                          bgcolor: 'rgba(33, 150, 243, 0.15)',
                          '&:hover': {
                            bgcolor: 'rgba(33, 150, 243, 0.2)',
                          }
                        }
                      }}
                    >
                      <ListItemIcon sx={{
                        color: location.pathname === item.path ? 'primary.main' : 'text.secondary',
                        minWidth: 40
                      }}>
                        {item.icon}
                      </ListItemIcon>
                      <ListItemText
                        primary={item.text}
                        primaryTypographyProps={{
                          fontWeight: location.pathname === item.path ? 500 : 400
                        }}
                      />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Drawer>

            {/* Desktop navigation - only visible on medium and larger screens */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1 }}>
              {navItems.map((item) => (
                <Button
                  key={item.text}
                  color="inherit"
                  component={Link}
                  to={item.path}
                  startIcon={item.icon}
                  sx={{
                    px: 2,
                    py: 1,
                    color: 'white',
                    borderRadius: 3,
                    opacity: 0.9,
                    bgcolor: location.pathname === item.path ? 'rgba(255, 255, 255, 0.15)' : 'transparent',
                    '&:hover': {
                      bgcolor: 'rgba(255, 255, 255, 0.25)',
                      opacity: 1
                    }
                  }}
                >
                  {item.text}
                </Button>
              ))}
            </Box>

            <ThemeSelector />

            <IconButton
              onClick={handleMenu}
              size="small"
              sx={{
                ml: 1,
                bgcolor: 'rgba(255, 255, 255, 0.15)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.25)',
                }
              }}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <Avatar
                sx={{
                  width: 32,
                  height: 32,
                  bgcolor: 'transparent',
                  color: 'white',
                  fontWeight: 600
                }}
                // Removed Supabase specific user info - just show a generic icon or initial
                // alt={currentUser?.id ? 'User' : 'U'}
              >
                {/* Can add user initial later if we fetch profile */}
                U
              </Avatar>
            </IconButton>

            <Menu
              id="account-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
                sx: { py: 0.5 }
              }}
              PaperProps={{
                elevation: 3,
                sx: {
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
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleProfile} sx={{ borderRadius: 1, mx: 1, my: 0.5 }}>Profile</MenuItem>
              <MenuItem onClick={() => { handleClose(); navigate('/workout-templates'); }} sx={{ borderRadius: 1, mx: 1, my: 0.5 }}>Workout Templates</MenuItem>
              <MenuItem onClick={() => { handleClose(); navigate('/meal-templates'); }} sx={{ borderRadius: 1, mx: 1, my: 0.5 }}>Meal Templates</MenuItem>
              <Divider sx={{ my: 1 }} />
              <MenuItem onClick={handleLogout} sx={{ color: 'error.main', borderRadius: 1, mx: 1, my: 0.5 }}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          // Non-authenticated navigation
          <>
            <Button
              color="inherit"
              component={Link}
              to="/login"
              sx={{
                borderRadius: 3,
                px: 3,
                py: 0.8,
                color: 'white',
                opacity: 0.9,
                mr: 1,
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.15)',
                  opacity: 1
                }
              }}
            >
              Login
            </Button>
            <Button
              variant="contained"
              component={Link}
              to="/register"
              sx={{
                borderRadius: 3,
                px: 3,
                py: 0.8,
                color: 'white',
                bgcolor: 'rgba(255, 255, 255, 0.2)',
                '&:hover': {
                  bgcolor: 'rgba(255, 255, 255, 0.3)',
                  boxShadow: '0 4px 8px rgba(0,0,0,0.1)'
                }
              }}
            >
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
