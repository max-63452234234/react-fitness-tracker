import React, { createContext, useState, useEffect } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
import { supabase } from '../index.js';

// Create context
export const ThemeContext = createContext();

// Text size factors
export const TEXT_SIZES = {
  small: 0.9,
  medium: 1,
  large: 1.15,
  extraLarge: 1.3
};

// Theme provider component
export const ThemeProvider = ({ children }) => {
  const [mode, setMode] = useState('light');
  const [textSize, setTextSize] = useState('medium');
  const [userId, setUserId] = useState(null);
  
  // Load user preferences from Supabase on login
  useEffect(() => {
    const loadUserPreferences = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (user) {
          setUserId(user.id);
          
          // Get user preferences
          const { data, error } = await supabase
            .from('user_preferences')
            .select('theme_mode, text_size')
            .eq('user_id', user.id)
            .single();
          
          if (error && error.code !== 'PGSQL_ERROR') {
            console.error('Error loading preferences:', error);
            return;
          }
          
          // Set preferences if they exist
          if (data) {
            if (data.theme_mode) setMode(data.theme_mode);
            if (data.text_size) setTextSize(data.text_size);
          } else {
            // Create default preferences
            await createDefaultPreferences(user.id);
          }
        }
      } catch (error) {
        console.error('Error loading theme preferences:', error);
      }
    };
    
    loadUserPreferences();
    
    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event) => {
        if (event === 'SIGNED_IN') {
          loadUserPreferences();
        } else if (event === 'SIGNED_OUT') {
          // Reset to defaults on sign out
          setMode('light');
          setTextSize('medium');
          setUserId(null);
        }
      }
    );
    
    return () => subscription.unsubscribe();
  }, []);
  
  // Create default preferences for new users
  const createDefaultPreferences = async (userId) => {
    try {
      const { error } = await supabase
        .from('user_preferences')
        .insert([
          { 
            user_id: userId,
            theme_mode: 'light',
            text_size: 'medium'
          }
        ]);
      
      if (error) throw error;
    } catch (error) {
      console.error('Error creating default preferences:', error);
    }
  };
  
  // Save theme mode to database
  const toggleThemeMode = async () => {
    const newMode = mode === 'light' ? 'dark' : 'light';
    setMode(newMode);
    
    if (userId) {
      try {
        const { error } = await supabase
          .from('user_preferences')
          .update({ theme_mode: newMode })
          .eq('user_id', userId);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error saving theme mode:', error);
      }
    }
  };
  
  // Save text size to database
  const changeTextSize = async (newSize) => {
    setTextSize(newSize);
    
    if (userId) {
      try {
        const { error } = await supabase
          .from('user_preferences')
          .update({ text_size: newSize })
          .eq('user_id', userId);
        
        if (error) throw error;
      } catch (error) {
        console.error('Error saving text size:', error);
      }
    }
  };
  
  // Create theme with current settings
  const theme = createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            primary: {
              main: '#2196f3', // Brighter blue
              light: '#64b5f6',
              dark: '#1976d2',
            },
            secondary: {
              main: '#f50057', // Vibrant pink
              light: '#ff4081',
              dark: '#c51162',
            },
            background: {
              default: '#f8f9fa',
              paper: '#ffffff',
            },
            success: {
              main: '#4caf50',
            },
            info: {
              main: '#03a9f4',
            },
          }
        : {
            primary: {
              main: '#90caf9', // Lighter blue for dark mode
              light: '#bbdefb',
              dark: '#42a5f5',
            },
            secondary: {
              main: '#f48fb1', // Lighter pink for dark mode
              light: '#f8bbd0',
              dark: '#ec407a',
            },
            background: {
              default: '#1a1a1a', // Darker background
              paper: '#333333',
            },
            success: {
              main: '#66bb6a',
            },
            info: {
              main: '#29b6f6',
            },
          }),
    },
    shape: {
      borderRadius: 16, // Global rounded corners
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 14 * TEXT_SIZES[textSize],
      h1: {
        fontSize: '2.5rem',
        fontWeight: 600,
      },
      h2: {
        fontSize: '2rem',
        fontWeight: 600,
      },
      h3: {
        fontSize: '1.75rem',
        fontWeight: 500,
      },
      h4: {
        fontSize: '1.5rem',
        fontWeight: 500,
      },
      h5: {
        fontSize: '1.25rem',
        fontWeight: 500,
      },
      h6: {
        fontSize: '1rem',
        fontWeight: 500,
      },
      button: {
        textTransform: 'none', // More modern look without all caps
        fontWeight: 500,
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            fontSize: 14 * TEXT_SIZES[textSize],
            borderRadius: 12,
            padding: '8px 16px',
            boxShadow: 'none',
            '&:hover': {
              boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
            },
          },
          containedPrimary: {
            backgroundImage: 'linear-gradient(to right, #1976d2, #2196f3)',
          },
          containedSecondary: {
            backgroundImage: 'linear-gradient(to right, #c51162, #f50057)',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            boxShadow: '0 4px 20px rgba(0,0,0,0.08)',
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            overflow: 'hidden',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: '0 12px 20px rgba(0,0,0,0.1)',
            },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            fontSize: 14 * TEXT_SIZES[textSize],
            '& .MuiOutlinedInput-root': {
              borderRadius: 12,
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            borderRadius: 8,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            boxShadow: '0 2px 12px rgba(0,0,0,0.1)',
          },
        },
      },
      MuiSwitch: {
        styleOverrides: {
          root: {
            padding: 8,
          },
          thumb: {
            boxShadow: 'none',
          },
        },
      },
    },
  });
  
  return (
    <ThemeContext.Provider value={{ mode, textSize, toggleThemeMode, changeTextSize }}>
      <MuiThemeProvider theme={theme}>
        {children}
      </MuiThemeProvider>
    </ThemeContext.Provider>
  );
};
