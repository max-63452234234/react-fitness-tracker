import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { Container, CssBaseline, Box, CircularProgress } from '@mui/material';
import { supabase } from './index.js';

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
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get current session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  // Protected route component
  const ProtectedRoute = ({ children }) => {
    if (loading) {
      return (
        <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
          <CircularProgress />
        </Box>
      );
    }
    
    if (!session) {
      return <Navigate to="/login" />;
    }
    
    return children;
  };

  return (
    <Router>
      <CssBaseline />
      <Navbar session={session} />
      <Container maxWidth="lg" sx={{ mt: 4, mb: 4 }}>
        <Routes>
          {/* Public routes */}
          <Route path="/login" element={!session ? <Login /> : <Navigate to="/dashboard" />} />
          <Route path="/register" element={!session ? <Register /> : <Navigate to="/dashboard" />} />

          {/* Protected routes */}
          <Route path="/dashboard" element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          } />
          <Route path="/workouts" element={
            <ProtectedRoute>
              <WorkoutLog />
            </ProtectedRoute>
          } />
          <Route path="/weight" element={
            <ProtectedRoute>
              <WeightLog />
            </ProtectedRoute>
          } />
          <Route path="/macros" element={
            <ProtectedRoute>
              <MacroLog />
            </ProtectedRoute>
          } />
          <Route path="/progress" element={
            <ProtectedRoute>
              <ProgressCharts />
            </ProtectedRoute>
          } />
          <Route path="/exercise-progress" element={
            <ProtectedRoute>
              <ExerciseProgress />
            </ProtectedRoute>
          } />
          <Route path="/meal-templates" element={
            <ProtectedRoute>
              <MealTemplates />
            </ProtectedRoute>
          } />
          <Route path="/workout-templates" element={
            <ProtectedRoute>
              <WorkoutTemplates />
            </ProtectedRoute>
          } />
          <Route path="/profile" element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          } />
          
          {/* Redirects */}
          <Route path="/" element={<Navigate to={session ? "/dashboard" : "/login"} />} />
          
          {/* Legacy routes */}
          <Route path="/fitness" element={<Navigate to="/workouts" />} />
          
          {/* Habits route */}
          <Route path="/habits" element={
            <ProtectedRoute>
              <HabitTracker />
            </ProtectedRoute>
          } />
          
          {/* Catch-all */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Container>
    </Router>
  );
}

export default App;
