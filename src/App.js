import React, { useState, useEffect, useCallback } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Container, CssBaseline, Box, CircularProgress } from '@mui/material';
// import { supabase } from './index.js'; // Removed Supabase import
import { ThemeProvider } from './context/ThemeContext';

// Components
import Navbar from './components/Navbar.js';
import Login from './components/auth/Login.js';
import Register from './components/auth/Register.js';
import Dashboard from './components/Dashboard.js';
import WorkoutLog from './components/workout/WorkoutLog.js';
import WeightLog from './components/metrics/WeightLog.js';
import MacroLog from './components/metrics/MacroLog.js';
import MealTemplates from './components/metrics/MealTemplates.js';
import ProgressCharts from './components/metrics/ProgressCharts.js';
import ExerciseProgress from './components/metrics/ExerciseProgress.js';
import HabitTracker from './components/habits/HabitTracker.js';
import WorkoutTemplates from './components/workout/WorkoutTemplates.js';
import Profile from './components/Profile.js';
import NotFound from './components/NotFound.js';

function App() {
  // Replace Supabase session state with simple currentUser state
  const [currentUser, setCurrentUser] = useState(null); // Store user info (e.g., { id: userId })
  const [loading, setLoading] = useState(false); // Simplified loading state for now

  // Function to handle successful login
  const handleLoginSuccess = useCallback((userData) => {
    console.log("App: Login successful, setting user:", userData);
    // In a real app, you'd likely store a token (JWT) here,
    // but for now, just store the user ID or basic info.
    // We'll use localStorage to persist login across refreshes (basic example)
    localStorage.setItem('currentUser', JSON.stringify(userData));
    setCurrentUser(userData);
  }, []);

  // Function to handle logout
  const handleLogout = useCallback(() => {
    console.log("App: Logging out");
    localStorage.removeItem('currentUser');
    setCurrentUser(null);
    // No need to call backend for logout in this simple setup
  }, []);

  // Check localStorage for persisted user on initial load
  useEffect(() => {
    setLoading(true);
    try {
      const storedUser = localStorage.getItem('currentUser');
      if (storedUser) {
        setCurrentUser(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error("Error parsing stored user:", error);
      localStorage.removeItem('currentUser'); // Clear invalid data
    } finally {
      setLoading(false);
    }
  }, []);


  // Protected route component - checks our local currentUser state
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      );
    }

    if (!currentUser) {
      console.log("ProtectedRoute: No user, navigating to /login");
      return <Navigate to="/login" />;
    }

    // Pass currentUser down to children if needed (using React Context is better for deep nesting)
    // return React.cloneElement(children, { currentUser });
    return children;
  };

  // REMOVED: Top-level loading check. ProtectedRoute handles loading for protected areas.
  // if (loading) {
  //    return (
  //      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
  //        <CircularProgress />
  //      </Box>
  //    );
  // }

  return (
    <ThemeProvider>
      <Router>
        <CssBaseline />
        {/* Pass currentUser and logout handler to Navbar */}
        <Navbar currentUser={currentUser} onLogout={handleLogout} />
        <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          {/* Public routes: Pass login handler to Login */}
          <Route path="/login" element={!currentUser ? <Login onLoginSuccess={handleLoginSuccess} /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!currentUser ? <Register /> : <Navigate to="/dashboard" />} />

          {/* Protected routes */}
          {/* Note: Protected components will need refactoring to use currentUser.id instead of supabase auth */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard currentUser={currentUser} /> {/* Pass user if needed */}
            </ProtectedRoute>
          } />
          <Route path="/workouts" element={
            <ProtectedRoute>
              <WorkoutLog currentUser={currentUser} />
            </ProtectedRoute>
          } />
          <Route path="/weight" element={
            <ProtectedRoute>
              <WeightLog currentUser={currentUser} />
            </ProtectedRoute>
          } />
          <Route path="/macros" element={
            <ProtectedRoute>
              <MacroLog currentUser={currentUser} />
            </ProtectedRoute>
          } />
          <Route path="/progress" element={
            <ProtectedRoute>
              <ProgressCharts currentUser={currentUser} />
            </ProtectedRoute>
          } />
          <Route path="/exercise-progress" element={
            <ProtectedRoute>
              <ExerciseProgress currentUser={currentUser} />
            </ProtectedRoute>
          } />
          <Route path="/meal-templates" element={
            <ProtectedRoute>
              <MealTemplates currentUser={currentUser} />
            </ProtectedRoute>
          } />
          <Route path="/workout-templates" element={
            <ProtectedRoute>
              <WorkoutTemplates currentUser={currentUser} />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile currentUser={currentUser} />
            </ProtectedRoute>
          } />

          {/* Redirects */}
          <Route path="/" element={<Navigate to={currentUser ? "/dashboard" : "/login"} />} />

          {/* Legacy routes */}
          <Route path="/fitness" element={<Navigate to="/workouts" />} />

          {/* Habits route */}
          <Route path="/habits" element={
            <ProtectedRoute>
              <HabitTracker currentUser={currentUser} />
            </ProtectedRoute>
          } />

          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Container>
      </Router>
    </ThemeProvider>
  );
}

export default App;
