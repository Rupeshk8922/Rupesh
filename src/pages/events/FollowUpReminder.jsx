import { useState, useEffect, useCallback } from 'react';
import {
  MenuItem,
  CircularProgress,
  TextField,
  Button,
  IconButton,
  Alert,
  Typography,
  Box,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CallIcon from '@mui/icons-material/Call';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { useNavigate } from 'react-router-dom';

const FollowUpReminder = () => {
  const [donors, setDonors] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState('');
  const [followUpDate, setFollowUpDate] = useState('');
  const [followUpTime, setFollowUpTime] = useState('');
  const [reminderNote, setReminderNote] = useState('');
  const [reminders, setReminders] = useState([]);
  const [loadingDonors, setLoadingDonors] = useState(false);
  const [loadingReminders, setLoadingReminders] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  const navigate = useNavigate();

  // Fetch donors
  useEffect(() => {
    const fetchDonors = async () => {
      setLoadingDonors(true);
      try {
        const querySnapshot = await getDocs(collection(db, 'donors'));
        const donorsData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDonors(donorsData);
        setError(null);
      } catch {
        setError('Failed to load donors');
      } finally {
        setLoadingDonors(false);
      }
    };
    fetchDonors();
  }, []);

  // Fetch reminders
  const fetchReminders = useCallback(async () => {
    setLoadingReminders(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'reminders'));
      const remindersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReminders(remindersData);
      setError(null);
    } catch {
      setError('Failed to load reminders');
    } finally {
      setLoadingReminders(false);
    }
  }, []);

  useEffect(() => {
    fetchReminders();
  }, [fetchReminders]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedDonor) {
      setError('Please select a donor');
      return;
    }
    setLoadingReminders(true);
    try {
      await addDoc(collection(db, 'reminders'), {
        donorId: selectedDonor,
        followUpDate,
        followUpTime,
        reminderNote,
      });
      setSuccess(true);
      setError(null);
      setSelectedDonor('');
      setFollowUpDate('');
      setFollowUpTime('');
      setReminderNote('');
      await fetchReminders();
      setTimeout(() => setSuccess(false), 3000);
    } catch {
      setError('Failed to save reminder');
    } finally {
      setLoadingReminders(false);
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
    <Box sx={{ padding: 3, maxWidth: 600, margin: 'auto' }}>
      <Typography variant="h5" gutterBottom>
        Follow Up Reminder
      </Typography>

      <form onSubmit={handleSubmit} noValidate>
        <TextField
          select
          label="Donor"
          value={selectedDonor}
          onChange={(e) => setSelectedDonor(e.target.value)}
          fullWidth
          margin="normal"
          required
          disabled={loadingDonors || loadingReminders}
          helperText={error && error.includes('donor') ? error : ''}
        >
          {loadingDonors ? (
            <MenuItem disabled>
              <CircularProgress size={20} />
              &nbsp; Loading donors...
            </MenuItem>
          ) : donors.length === 0 ? (
            <MenuItem disabled>No donors found</MenuItem>
          ) : (
            donors.map((donor) => (
              <MenuItem key={donor.id} value={donor.id}>
                {donor.name}
              </MenuItem>
            ))
          )}
        </TextField>

        <TextField
          label="Follow Up Date"
          type="date"
          value={followUpDate}
          onChange={(e) => setFollowUpDate(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
          disabled={loadingReminders}
        />

        <TextField
          label="Follow Up Time"
          type="time"
          value={followUpTime}
          onChange={(e) => setFollowUpTime(e.target.value)}
          fullWidth
          margin="normal"
          InputLabelProps={{ shrink: true }}
          required
          disabled={loadingReminders}
        />

        <TextField
          label="Reminder Note"
          value={reminderNote}
          onChange={(e) => setReminderNote(e.target.value)}
          fullWidth
          margin="normal"
          multiline
          rows={4}
          required
          disabled={loadingReminders}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          disabled={loadingReminders}
          startIcon={loadingReminders && <CircularProgress size={20} />}
        >
          Save Reminder
        </Button>

        {success && (
          <Alert severity="success" sx={{ mt: 2 }}>
            Reminder saved successfully!
          </Alert>
        )}
        {error && !error.includes('donor') && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}
      </form>

      <Typography variant="h6" sx={{ mt: 4, mb: 2 }}>
        Created Reminders
      </Typography>

      {loadingReminders ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
          <CircularProgress />
        </Box>
      ) : reminders.length === 0 ? (
        <Typography>No reminders found.</Typography>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {reminders.map((reminder) => {
            const donor = donors.find((d) => d.id === reminder.donorId);
            return (
              <li
                key={reminder.id}
                style={{
                  border: '1px solid #ddd',
                  borderRadius: 4,
                  padding: 12,
                  marginBottom: 12,
                }}
              >
                <Typography>
                  <strong>Reminder for:</strong> {donor ? donor.name : reminder.donorId}
                </Typography>
                <Typography>
                  <strong>Date:</strong> {reminder.followUpDate}, <strong>Time:</strong>{' '}
                  {reminder.followUpTime}
                </Typography>
                <Typography>
                  <strong>Note:</strong> {reminder.reminderNote}
                </Typography>
                <Box sx={{ mt: 1 }}>
                  <IconButton
                    aria-label="view-profile"
                    onClick={() => handleViewProfile(reminder.donorId)}
                    size="small"
                  >
                    <VisibilityIcon />
                  </IconButton>
                  <IconButton
                    aria-label="call-donor"
                    onClick={() => handleCallDonor(donor?.phoneNumber)}
                    size="small"
                    disabled={!donor?.phoneNumber}
                  >
                    <CallIcon />
                  </IconButton>
                </Box>
              </li>
            );
          })}
        </ul>
      )}
    </Box>
  );
};

export default FollowUpReminder;
