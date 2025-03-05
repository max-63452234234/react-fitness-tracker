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
import ListAltIcon from '@mui/icons-material/ListAlt';
import MonitorWeightIcon from '@mui/icons-material/MonitorWeight';
import RestaurantIcon from '@mui/icons-material/Restaurant';
import FastfoodIcon from '@mui/icons-material/Fastfood';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import TimelineIcon from '@mui/icons-material/Timeline';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { supabase } from '../index.js';
import ThemeSelector from './ThemeSelector';

/**
 * Navigation bar component that adapts based on authentication state
 * @param {Object} props - Component props
 * @param {Object} props.session - Current user session
 */
const Navbar = ({ session }) => {
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

  const handleLogout = async () => {
    handleClose();
    await supabase.auth.signOut();
    navigate('/login');
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
    { text: 'Templates', icon: <ListAltIcon />, path: '/workout-templates' },
    { text: 'Weight', icon: <MonitorWeightIcon />, path: '/weight' },
    { text: 'Macros', icon: <RestaurantIcon />, path: '/macros' },
    { text: 'Meal Plans', icon: <FastfoodIcon />, path: '/meal-templates' },
    { text: 'Habits', icon: <CheckBoxIcon />, path: '/habits' },
    { text: 'Progress', icon: <TimelineIcon />, path: '/progress' },
  ];

  return (
    <AppBar position="static" sx={{ bgcolor: '#2196f3', mb: 3 }}>
      <Toolbar>
        <Typography 
          variant="h6" 
          component={Link} 
          to="/"
          sx={{ 
            flexGrow: 1, 
            color: 'white', 
            textDecoration: 'none',
            fontWeight: 'bold'
          }}
        >
          Fitness Tracker
        </Typography>

        {session ? (
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
            >
              <Box
                sx={{ width: 250 }}
                role="presentation"
              >
                <List>
                  {navItems.map((item) => (
                    <ListItem 
                      button 
                      key={item.text} 
                      onClick={() => handleMobileNavigation(item.path)}
                      selected={location.pathname === item.path}
                      sx={{
                        bgcolor: location.pathname === item.path ? 'rgba(33, 150, 243, 0.1)' : 'transparent',
                        '&:hover': {
                          bgcolor: 'rgba(33, 150, 243, 0.2)',
                        }
                      }}
                    >
                      <ListItemIcon>{item.icon}</ListItemIcon>
                      <ListItemText primary={item.text} />
                    </ListItem>
                  ))}
                </List>
              </Box>
            </Drawer>
            
            {/* Desktop navigation - only visible on medium and larger screens */}
            <Box sx={{ display: { xs: 'none', md: 'flex' } }}>
              <Button color="inherit" component={Link} to="/dashboard">
                Dashboard
              </Button>
              <Button color="inherit" component={Link} to="/workouts">
                Workouts
              </Button>
              <Button color="inherit" component={Link} to="/workout-templates">
                Templates
              </Button>
              <Button color="inherit" component={Link} to="/weight">
                Weight
              </Button>
              <Button color="inherit" component={Link} to="/macros">
                Macros
              </Button>
              <Button color="inherit" component={Link} to="/meal-templates">
                Meal Plans
              </Button>
              <Button color="inherit" component={Link} to="/habits">
                Habits
              </Button>
              <Button color="inherit" component={Link} to="/progress">
                Progress
              </Button>
            </Box>
            
            <ThemeSelector />
            
            <IconButton
              onClick={handleMenu}
              size="small"
              sx={{ ml: 1 }}
              aria-controls={open ? 'account-menu' : undefined}
              aria-haspopup="true"
              aria-expanded={open ? 'true' : undefined}
            >
              <Avatar 
                sx={{ width: 32, height: 32, bgcolor: '#1565c0' }}
                alt={session?.user?.email.charAt(0).toUpperCase() || 'U'} 
                src={session?.user?.user_metadata?.avatar_url}
              >
                {session?.user?.email.charAt(0).toUpperCase()}
              </Avatar>
            </IconButton>
            
            <Menu
              id="account-menu"
              anchorEl={anchorEl}
              open={open}
              onClose={handleClose}
              MenuListProps={{
                'aria-labelledby': 'basic-button',
              }}
              transformOrigin={{ horizontal: 'right', vertical: 'top' }}
              anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            >
              <MenuItem onClick={handleProfile}>Profile</MenuItem>
              <MenuItem onClick={handleLogout}>Logout</MenuItem>
            </Menu>
          </>
        ) : (
          // Non-authenticated navigation
          <>
            <Button color="inherit" component={Link} to="/login">
              Login
            </Button>
            <Button color="inherit" component={Link} to="/register">
              Register
            </Button>
          </>
        )}
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;
