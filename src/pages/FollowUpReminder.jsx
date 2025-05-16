import React, { useState, useEffect } from 'react';
import {
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  Box,
  List,
  ListItem,
  ListItemText,
  ListItemSecondaryAction,
  IconButton,
  CircularProgress,
  Alert
} from '@mui/material';
import CallIcon from '@mui/icons-material/Call';
import VisibilityIcon from '@mui/icons-material/Visibility';
import { collection, getDocs, addDoc, query, where } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { useNavigate } from 'react-router-dom';

function FollowUpReminder() {
  const [donors, setDonors] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [reminderNote, setReminderNote] = useState('');
  const [reminders, setReminders] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
    const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  useEffect(() => {
    const fetchDonors = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'donors'));
        const donorsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDonors(donorsData);
      } catch (err) {
        setError('Failed to load donors');
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, []);

  useEffect(() => {
    const fetchReminders = async () => {
      setLoading(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'reminders'));
        const remindersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReminders(remindersData);
      } catch (err) {
        setError('Failed to load reminders');
      } finally {
        setLoading(false);
      }
    };

    fetchReminders();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true)
    try {
      await addDoc(collection(db, 'reminders'), {
        donorId: selectedDonor,
        followUpDate,
        followUpTime,
        reminderNote,
      });
      setSuccess(true);
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
        const querySnapshot = await getDocs(collection(db, 'reminders'));
        const remindersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setReminders(remindersData);
      setSelectedDonor('');
      setFollowUpDate('');
      setFollowUpTime('');
      setReminderNote('');

    } catch (err) {
      setError('Failed to save reminder');
    } finally {
      setLoading(false);
    }
  };

  const handleViewProfile = (donorId) => {
    navigate(`/donors/${donorId}`);
  };

  const handleCallDonor = (phoneNumber) => {
        if (phoneNumber) {
      window.location.href = 'tel:' + phoneNumber;
    }
  };

  return (
    <Box sx={{ p: 3, maxWidth: 600, margin: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Follow Up Reminder
      </Typography>
      <form onSubmit={handleSubmit}>
        <FormControl fullWidth required margin="normal">
          <InputLabel id="donor-select-label">Donor</InputLabel>
          <Select
            labelId="donor-select-label"
            id="donor-select"
            value={selectedDonor}
            label="Donor"
            onChange={(e) => setSelectedDonor(e.target.value)}
          >
            {loading && <MenuItem disabled>Loading...</MenuItem>}
            {error && <MenuItem disabled>Error: {error}</MenuItem>}
            {donors.map((donor) => (
              <MenuItem key={donor.id} value={donor.id}>
                {donor.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
        <TextField
          fullWidth
          margin="normal"
          type="date"
          value={followUpDate}
          onChange={(e) => setFollowUpDate(e.target.value)}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          type="time"
          value={followUpTime}
          onChange={(e) => setFollowUpTime(e.target.value)}
          required
        />
        <TextField
          fullWidth
          margin="normal"
          multiline
          rows={4}
          label="Reminder Note"
          value={reminderNote}
          onChange={(e) => setReminderNote(e.target.value)}
          required
        />
        <Button
          type="submit"
          variant="contained"
          color="primary"
          disabled={loading}
          sx={{ mt: 2 }}
        >
          {loading ? <CircularProgress size={24} /> : 'Save Reminder'}
        </Button>
                {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Reminder saved successfully!
          </Alert>
        )}
        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </form>

      <Typography variant="h6" mt={4} gutterBottom>
        Created Reminders
      </Typography>
      <List>
        {reminders.map((reminder) => (
          <ListItem key={reminder.id} divider>
            <ListItemText
              primary={`Reminder for: ${reminder.donorId}`}
              secondary={`Date: ${reminder.followUpDate}, Time: ${reminder.followUpTime}, Note: ${reminder.reminderNote}`}
            />
            <ListItemSecondaryAction>
              <IconButton
                edge="end"
                aria-label="view-profile"
                onClick={() => handleViewProfile(reminder.donorId)}
              >
                <VisibilityIcon />
              </IconButton>
                                          <IconButton
                edge="end"
                aria-label="call-donor"
                onClick={() => handleCallDonor(donors.find(donor=> donor.id === reminder.donorId)?.phoneNumber)}
              >
                <CallIcon />
              </IconButton>
            </ListItemSecondaryAction>
          </ListItem>
        ))}
      </List>
    </Box>
  );
}

export default FollowUpReminder;