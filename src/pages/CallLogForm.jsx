import { useState, useEffect } from 'react';
import { TextField, Button, FormControl, InputLabel, Select, MenuItem, FormControlLabel, RadioGroup, Radio, Typography, Grid, Box, CircularProgress, Alert
} from '@mui/material';
import dayjs from 'dayjs';
import { collection, addDoc, getDocs } from 'firebase/firestore';
import { AdapterDayjs } from '@mui/x-date-pickers/AdapterDayjs';
import { LocalizationProvider, DatePicker, TimePicker } from '@mui/x-date-pickers';
import { db } from '../firebase/config';

function CallLogForm() {
  const [donors, setDonors] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState('');
  const [callOutcome, setCallOutcome] = useState('');
  const [followUpDate, setFollowUpDate] = useState(dayjs());
  const [followUpTime, setFollowUpTime] = useState(dayjs());
  const [donationStatus, setDonationStatus] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    // Mobile Responsiveness: Data fetching logic runs regardless of screen size.
    // Ensure loading and error states are displayed clearly on mobile.
    const fetchDonors = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, 'donors'));
        const donorList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDonors(donorList);
      } catch (err) {
        setError('Error fetching donors');
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonors();
  }, []);

  const handleSubmit = async (event) => {
    // Mobile Responsiveness: Form submission logic is the same for all screen sizes.
    event.preventDefault();
    const callLogData = {
      donorId: selectedDonor,
      callOutcome,
      followUpDate: followUpDate.toDate(),
      followUpTime: followUpTime.toDate(),
      donationStatus,
      timestamp: dayjs().toDate(),
    };

    try {
      // Add the call log data to the Firestore collection
      await addDoc(collection(db, 'callLogs'), callLogData);
      setSuccess(true);

      // Clear form fields after successful submission
      setSelectedDonor('');
      setCallOutcome('');
      setFollowUpDate(dayjs());
      setFollowUpTime(dayjs());
      setDonationStatus('');
    } catch (err) {
      setError('Error saving call log');
      console.error('Error saving call log:', err);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box> {/* Open Box inside LocalizationProvider */}
        {isLoading && <CircularProgress />}
        {error && <Alert severity="error">{error}</Alert>}
        {/* Mobile Responsiveness: Form container. Grid and fullWidth on form controls help here. */}
        {!isLoading && !error && (
          <form onSubmit={handleSubmit}>
            <FormControl fullWidth required sx={{ mb: 3 }}>
              <InputLabel id="donor-label">Donor</InputLabel>
              <Select
                labelId="donor-label"
                id="donor"
                value={selectedDonor}
                label="Donor"
                onChange={(e) => setSelectedDonor(e.target.value)}
              >
                {donors.map((donor) => (
                  <MenuItem key={donor.id} value={donor.id}>
                    {donor.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>

            {/* Mobile Responsiveness: FormControl for radio group. Ensure vertical stacking is clear. */}
            <FormControl component="fieldset" required sx={{ mb: 3 }}>
              <Typography component="legend">Call Outcome</Typography>
              <RadioGroup
                // Mobile Responsiveness: Use 'column' for stacking vertically on all screens,
                // or 'row' with responsive adjustments if horizontal is preferred on larger screens.
                // The default is column, which is good for mobile.
                aria-label="call-outcome"
                name="call-outcome"
                value={callOutcome}
                onChange={(e) => setCallOutcome(e.target.value)}
              >
                <FormControlLabel value="successful" control={<Radio />} label="Successful" />
                <FormControlLabel value="unsuccessful" control={<Radio />} label="Unsuccessful" />
                <FormControlLabel value="follow-up" control={<Radio />} label="Follow-Up" />
                <FormControlLabel value="no-answer" control={<Radio />} label="No Answer" />
              </RadioGroup>
            </FormControl>

            {/* Mobile Responsiveness: Grid container for date and time pickers.
                spacing={2} provides spacing between grid items. */}
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                {/* Mobile Responsiveness: xs={12} ensures this item takes full width on extra small screens. */}
                <DatePicker
                  label="Follow-Up Date"
                  // Mobile Responsiveness: The picker itself is generally handled by MUI's responsive design.
                  value={followUpDate}
                  onChange={(newValue) => setFollowUpDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TimePicker
                  // Mobile Responsiveness: The picker itself is generally handled by MUI's responsive design.
                  label="Follow-Up Time"
                  value={followUpTime}
                  onChange={(newValue) => setFollowUpTime(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth required />}
                />
              </Grid>
            </Grid>

            {/* Mobile Responsiveness: FormControl for donation status select.
                fullWidth ensures it takes up full width on small screens. */}
            <FormControl fullWidth required sx={{ mb: 3 }}>
              <InputLabel id="donation-status-label">Donation Status</InputLabel>
              <Select
                labelId="donation-status-label"
                id="donation-status"
                value={donationStatus}
                label="Donation Status"
                onChange={(e) => setDonationStatus(e.target.value)}
              >
                <MenuItem value="pending">Pending</MenuItem>
                <MenuItem value="received">Received</MenuItem>
                <MenuItem value="not-interested">Not Interested</MenuItem>
              </Select>
            </FormControl>

            {success && (
              <Alert severity="success" sx={{ mt: 2 }}>
                Call Log saved successfully!
              </Alert>
            )}
          </form>
        )}
      </Box> {/* Close Box inside LocalizationProvider */}
    </LocalizationProvider>
  );
}

export default CallLogForm;
