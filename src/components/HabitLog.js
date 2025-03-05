import React, { useState, useEffect } from 'react';
import { supabase } from '../index.js';
import { TextField, Button, List, ListItem, ListItemText } from '@mui/material';

const HabitLog = () => {
  const [habits, setHabits] = useState([]);
  const [newHabit, setNewHabit] = useState('');

  useEffect(() => {
    fetchHabits();
  }, []);

  const fetchHabits = async () => {
    const { data, error } = await supabase
      .from('habits')
      .select('*');
    if (error) console.error('Error fetching habits:', error);
    else setHabits(data);
  };

  const addHabit = async () => {
    const { data, error } = await supabase
      .from('habits')
      .insert([{ name: newHabit }]);
    if (error) console.error('Error adding habit:', error);
    else {
      setHabits([...habits, data[0]]);
      setNewHabit('');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <TextField
        label="New Habit"
        value={newHabit}
        onChange={(e) => setNewHabit(e.target.value)}
        style={{ marginBottom: '10px' }}
      />
      <Button variant="contained" onClick={addHabit} style={{ marginBottom: '20px' }}>
        Add Habit
      </Button>
      <List>
        {habits.map((habit) => (
          <ListItem key={habit.id}>
            <ListItemText primary={habit.name} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default HabitLog;
