import { useState, useEffect } from 'react';
import {
  MenuItem,
  CircularProgress,
  TextField,
  Button,
  IconButton,
  Alert,
} from '@mui/material';
import VisibilityIcon from '@mui/icons-material/Visibility';
import CallIcon from '@mui/icons-material/Call';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config.js';
import { useNavigate } from 'react-router-dom';

const FollowUpReminder = () => {
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

  // Fetch donors from Firestore
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
        setError(null);
      } catch (err) {
        setError('Failed to load donors');
      } finally {
        setLoading(false);
      }
    };
    fetchDonors();
  }, []);

  // Fetch reminders from Firestore
  const fetchReminders = async () => {
    setLoading(true);
    try {
      const querySnapshot = await getDocs(collection(db, 'reminders'));
      const remindersData = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setReminders(remindersData);
      setError(null);
    } catch (err) {
      setError('Failed to load reminders');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReminders();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!selectedDonor) {
      setError('Please select a donor');
      return;
    }
    setLoading(true);
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
      await fetchReminders(); // Refresh reminders list
      setTimeout(() => {
        setSuccess(false);
      }, 3000);
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
    <div style={{ padding: 24, maxWidth: 600, margin: 'auto' }}>
      <h4>Follow Up Reminder</h4>
      <form onSubmit={handleSubmit} noValidate>
        <TextField
          select
          label="Donor"
          value={selectedDonor}
          onChange={(e) => setSelectedDonor(e.target.value)}
          fullWidth
          margin="normal"
          required
          disabled={loading}
          helperText={error && error.includes('donor') ? error : ''}
        >
          {loading ? (
            <MenuItem disabled>Loading...</MenuItem>
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
          disabled={loading}
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
          disabled={loading}
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
          disabled={loading}
        />

        <Button
          type="submit"
          variant="contained"
          color="primary"
          fullWidth
          style={{ marginTop: 16 }}
          disabled={loading}
          startIcon={loading && <CircularProgress size={20} />}
        >
          Save Reminder
        </Button>

        {success && (
          <Alert severity="success" style={{ marginTop: 16 }}>
            Reminder saved successfully!
          </Alert>
        )}
        {error && !error.includes('donor') && (
          <Alert severity="error" style={{ marginTop: 16 }}>
            {error}
          </Alert>
        )}
      </form>

      <h6 style={{ marginTop: 32 }}>Created Reminders</h6>
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
              <div>
                Reminder for: {donor ? donor.name : reminder.donorId}
              </div>
              <div>
                Date: {reminder.followUpDate}, Time: {reminder.followUpTime}
              </div>
              <div>Note: {reminder.reminderNote}</div>
              <div>
                <IconButton
                  aria-label="view-profile"
                  onClick={() => handleViewProfile(reminder.donorId)}
                >
                  <VisibilityIcon />
                </IconButton>
                <IconButton
                  aria-label="call-donor"
                  onClick={() => handleCallDonor(donor?.phoneNumber)}
                >
                  <CallIcon />
                </IconButton>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
};

export default FollowUpReminder;
