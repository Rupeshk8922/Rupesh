import React, { useState, useEffect } from 'react';
import {
  Autocomplete,
  TextField,
  Button,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  CircularProgress,
  Alert,
  Box,
  Paper,
  Typography,
} from '@mui/material';
import { useAuth } from '../contexts/authContext'; // Assuming useAuth is in this path
import { db } from '../firebase/config'; // Adjust path as necessary

function DCRForm() {
  const [donors, setDonors] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState(null);
  const [callOutcome, setCallOutcome] = useState('');
  const [notes, setNotes] = useState('');
  const [loading, setLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState('');
  const { user } = useAuth(); // Get user from auth context

  const handleSubmit = async (event) => {
    event.preventDefault();
    setError(null);
    setSuccessMessage('');

    if (!selectedDonor || !callOutcome) {
      setError('Please select a donor and call outcome.');
      return;
    }

    setSubmitting(true);
    try {
      // Assuming you want to save DCRs per user or per company.
      // You'll need to adjust this if DCRs are linked to a company instead of a user.
      if (!user || !user.uid) {
        throw new Error('User not authenticated.');
      }

      // Using Firestore to save DCR
      await addDoc(collection(db, `users/${user.uid}/dcrs`), {
        donorId: selectedDonor.id, // Save donor ID
        donorName: selectedDonor.name, // Optionally save donor name for easier querying
        callOutcome,
        notes,
        timestamp: new Date(), // Add a timestamp
        // Add any other relevant data like who made the call if not the current user

      });
      setCallOutcome('');
      setNotes('');
      setSelectedDonor(null);
      setSuccessMessage('DCR saved successfully!');
    } catch (err) {
      setError(err.message || 'An error occurred while saving the DCR');
    } finally {
      setSubmitting(false);
    }
  };

  useEffect(() => {
    const fetchDonors = async () => {
      setLoading(true);
      setError(null);
       // Assuming donors are stored in a 'donors' collection at the root level
       // or potentially under a company document like 'data/companyId/donors'
       // Adjust the path accordingly based on your Firestore structure.
       // For now, assuming a simple 'donors' collection.
      try {
        const querySnapshot = await getDocs(collection(db, 'donors'));
        const donorList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data()
        }));
        setDonors(donorList);
      } catch (err) {
        setError(err.message || 'An error occurred while fetching donors');
      } finally {
        setLoading(false);
      }
    };

    fetchDonors();
  }, []);

  return (
    <Box sx={{ maxWidth: 600, mx: 'auto', mt: 4 }}>
      <Paper sx={{ p: 3 }}>
        <Typography variant="h5" gutterBottom>Daily Call Report</Typography>

        {loading && <CircularProgress />}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        {successMessage && <Alert severity="success" sx={{ mb: 2 }}>{successMessage}</Alert>}

        <form onSubmit={handleSubmit}>
          <Autocomplete
            disablePortal
            id="donor-searchable-dropdown"
            options={donors}
            getOptionLabel={(option) => option.name || ''}
            sx={{ mb: 2 }}
            renderInput={(params) => <TextField {...params} label="Select Donor" required />}
            value={selectedDonor}
            onChange={(event, newValue) => setSelectedDonor(newValue)}
          />

          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel id="call-outcome-label">Call Outcome</InputLabel>
            <Select
              labelId="call-outcome-label"
              id="call-outcome"
              value={callOutcome}
              label="Call Outcome"
              onChange={(e) => setCallOutcome(e.target.value)}
              required
            >
              <MenuItem value="Successful">Successful</MenuItem>
              <MenuItem value="Unsuccessful">Unsuccessful</MenuItem>
              <MenuItem value="Follow-Up">Follow-Up</MenuItem>
              <MenuItem value="Not Answered">Not Answered</MenuItem>
            </Select>
          </FormControl>

          <TextField
            id="notes"
            label="Notes"
            multiline
            rows={4}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            fullWidth
            margin="normal"
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            sx={{ mt: 2 }}
            disabled={submitting}
          >
            {submitting ? 'Saving...' : 'Save DCR'}
          </Button>
        </form>
      </Paper>
    </Box>
  );
}

export default DCRForm;
