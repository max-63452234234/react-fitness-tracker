import React from 'react';
import { AppBar, Toolbar, Typography, Button, Box, IconButton, Menu, MenuItem, Avatar } from '@mui/material';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../index.js';

/**
 * Navigation bar component that adapts based on authentication state
 * @param {Object} props - Component props
 * @param {Object} props.session - Current user session
 */
const Navbar = ({ session }) => {
  const navigate = useNavigate();
  const [anchorEl, setAnchorEl] = React.useState(null);
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
            
            <IconButton
              onClick={handleMenu}
              size="small"
              sx={{ ml: 2 }}
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
