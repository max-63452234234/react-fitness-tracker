import React, { useState, useEffect } from 'react';
import { supabase } from '../index.js';
import { TextField, Button, List, ListItem, ListItemText } from '@mui/material';

const FitnessLog = () => {
  const [activities, setActivities] = useState([]);
  const [newActivity, setNewActivity] = useState('');

  const testSupabaseConnection = async () => {
    const { data, error } = await supabase
      .from('fitness_activities')
      .select('*');
    if (error) {
      console.error('Error fetching activities:', error.message);
    } else {
      console.log('Fetched activities:', data);
    }
  };

  useEffect(() => {
    fetchActivities();
    testSupabaseConnection();
    fetchActivities();
  }, []);

  const fetchActivities = async () => {
    const { data, error } = await supabase
      .from('fitness_activities')
      .select('*');
    if (error) console.error('Error fetching activities:', error);
    else setActivities(data);
  };

  const addActivity = async () => {
    const { data, error } = await supabase
      .from('fitness_activities')
      .insert([{ name: newActivity }]);
    if (error) console.error('Error adding activity:', error);
    else {
      setActivities([...activities, data[0]]);
      setNewActivity('');
    }
  };

  return (
    <div style={{ padding: '20px' }}>
      <h2>Fitness Log</h2>
      <TextField
        label="New Activity"
        value={newActivity}
        onChange={(e) => setNewActivity(e.target.value)}
        style={{ marginBottom: '10px' }}
      />
      <Button variant="contained" onClick={addActivity} style={{ marginBottom: '20px' }}>
        Add Activity
      </Button>
      <List>
        {activities.map((activity) => (
          <ListItem key={activity.id}>
            <ListItemText primary={activity.name} />
          </ListItem>
        ))}
      </List>
    </div>
  );
};

export default FitnessLog;
