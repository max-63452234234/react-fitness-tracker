import React, { createContext, useState, useEffect, useCallback } from 'react';
import { createTheme, ThemeProvider as MuiThemeProvider } from '@mui/material/styles';
// import { supabase } from '../index.js'; // REMOVED Supabase import

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
  // Load initial state from localStorage or use defaults
  const [mode, setMode] = useState(() => localStorage.getItem('themeMode') || 'light');
  const [textSize, setTextSize] = useState(() => localStorage.getItem('textSize') || 'medium');
  // userId is no longer managed here

  // Effect to update localStorage when theme mode changes
  useEffect(() => {
    try {
      localStorage.setItem('themeMode', mode);
    } catch (error) {
      console.error("Error saving theme mode to localStorage:", error);
    }
  }, [mode]);

  // Effect to update localStorage when text size changes
  useEffect(() => {
    try {
      localStorage.setItem('textSize', textSize);
    } catch (error) {
      console.error("Error saving text size to localStorage:", error);
    }
  }, [textSize]);

  // REMOVED: useEffect that loaded preferences from Supabase and listened to auth changes

  // REMOVED: createDefaultPreferences function

  // Toggle theme mode and save to localStorage
  const toggleThemeMode = useCallback(() => {
    setMode((prevMode) => (prevMode === 'light' ? 'dark' : 'light'));
    // No database interaction needed here anymore
  }, []);

  // Change text size and save to localStorage
  const changeTextSize = useCallback((newSize) => {
    if (TEXT_SIZES[newSize]) { // Ensure valid size
        setTextSize(newSize);
        // No database interaction needed here anymore
    } else {
      console.warn(`Invalid text size selected: ${newSize}`);
    }
  }, []);

  // Create theme with current settings
  const theme = createTheme({
    palette: {
      mode,
      ...(mode === 'light'
        ? {
            primary: {
              main: '#2196f3',
              light: '#64b5f6',
              dark: '#1976d2',
            },
            secondary: {
              main: '#f50057',
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
              main: '#90caf9',
              light: '#bbdefb',
              dark: '#42a5f5',
            },
            secondary: {
              main: '#f48fb1',
              light: '#f8bbd0',
              dark: '#ec407a',
            },
            background: {
              default: '#1a1a1a',
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
      borderRadius: 16,
    },
    typography: {
      fontFamily: '"Inter", "Roboto", "Helvetica", "Arial", sans-serif',
      fontSize: 14 * (TEXT_SIZES[textSize] || TEXT_SIZES.medium), // Fallback to medium
      h1: { fontSize: '2.5rem', fontWeight: 600 },
      h2: { fontSize: '2rem', fontWeight: 600 },
      h3: { fontSize: '1.75rem', fontWeight: 500 },
      h4: { fontSize: '1.5rem', fontWeight: 500 },
      h5: { fontSize: '1.25rem', fontWeight: 500 },
      h6: { fontSize: '1rem', fontWeight: 500 },
      button: { textTransform: 'none', fontWeight: 500 },
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            fontSize: 14 * (TEXT_SIZES[textSize] || TEXT_SIZES.medium),
            borderRadius: 12,
            padding: '8px 16px',
            boxShadow: 'none',
            '&:hover': { boxShadow: '0 4px 8px rgba(0,0,0,0.1)' },
          },
          containedPrimary: { backgroundImage: 'linear-gradient(to right, #1976d2, #2196f3)' },
          containedSecondary: { backgroundImage: 'linear-gradient(to right, #c51162, #f50057)' },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { borderRadius: 16, boxShadow: '0 4px 20px rgba(0,0,0,0.08)' },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            overflow: 'hidden',
            transition: 'transform 0.2s ease-in-out, box-shadow 0.2s ease-in-out',
            '&:hover': { transform: 'translateY(-4px)', boxShadow: '0 12px 20px rgba(0,0,0,0.1)' },
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            fontSize: 14 * (TEXT_SIZES[textSize] || TEXT_SIZES.medium),
            '& .MuiOutlinedInput-root': { borderRadius: 12 },
          },
        },
      },
      MuiChip: {
        styleOverrides: { root: { borderRadius: 8 } },
      },
      MuiAppBar: {
        styleOverrides: { root: { boxShadow: '0 2px 12px rgba(0,0,0,0.1)' } },
      },
      MuiSwitch: {
        styleOverrides: {
          root: { padding: 8 },
          thumb: { boxShadow: 'none' },
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
