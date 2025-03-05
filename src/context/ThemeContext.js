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
              main: '#1976d2',
            },
            secondary: {
              main: '#dc004e',
            },
            background: {
              default: '#f5f5f5',
              paper: '#ffffff',
            },
          }
        : {
            primary: {
              main: '#90caf9',
            },
            secondary: {
              main: '#f48fb1',
            },
            background: {
              default: '#303030',
              paper: '#424242',
            },
          }),
    },
    typography: {
      fontSize: 14 * TEXT_SIZES[textSize],
      h1: {
        fontSize: '2.5rem',
      },
      h2: {
        fontSize: '2rem',
      },
      h3: {
        fontSize: '1.75rem',
      },
      h4: {
        fontSize: '1.5rem',
      },
      h5: {
        fontSize: '1.25rem',
      },
      h6: {
        fontSize: '1rem',
      },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            fontSize: 14 * TEXT_SIZES[textSize],
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            fontSize: 14 * TEXT_SIZES[textSize],
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
