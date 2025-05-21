import React, { useState } from 'react';
import {
  Button,
  TextField,
  Grid,
  Typography,
  Container,
  Snackbar,
  Alert,
  CircularProgress,
  Box,
  MenuItem,
  Select,
  InputLabel,
  FormControl
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import { format } from 'date-fns';

// Helper function to format date for database
const formatToDatabaseDate = (date) => {
  return date ? format(date, 'yyyy-MM-dd') : null;
};

const AddVolunteerForm = () => {const [formData, setFormData] = useState({ firstname: '', lastname: '', email: '', phone_number: '', address: '', city: '', state: '', zipcode: '', birth_date: null, gender: '', occupation: '', skills: '', availability: '', emergency_contact_name: '', emergency_contact_phone: '', background_check_date: null, status: '', // e.g., 'active', 'inactive' start_date: null, end_date: null, notes: '', });

  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [snackbarSeverity, setSnackbarSeverity] = useState('success');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleDateChange = (name, date) => {
    setFormData({ ...formData, [name]: date });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Format dates before sending to backend
    const formattedFormData = {
      ...formData,
      birth_date: formatToDatabaseDate(formData.birth_date),
      background_check_date: formatToDatabaseDate(formData.background_check_date),
      start_date: formatToDatabaseDate(formData.start_date),
      end_date: formatToDatabaseDate(formData.end_date),
    };

    try {
      const response = await fetch('/api/volunteers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formattedFormData),
      });

      const data = await response.json();
      if (response.ok) {
          gender: '',
          occupation: '',
          skills: '',
          availability: '',
          emergency_contact_name: '',
          emergency_contact_phone: '',
          background_check_date: null,
          status: '',
          start_date: null,
          end_date: null,
          notes: '',
        });
      } else {
        setSnackbarMessage(data.message || 'Error adding volunteer.');
        setSnackbarSeverity('error');
      }
    } catch (error) {
      console.error('Error adding volunteer:', error);
      setSnackbarMessage('An unexpected error occurred.');
      setSnackbarSeverity('error');
    } finally {
      setSnackbarOpen(true);
      setLoading(false);
    }
  };

  const handleCloseSnackbar = (event, reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setSnackbarOpen(false);
  };

  return (
    <Container maxWidth="md">
      <Box sx={{ mt: 4, mb: 4 }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Add New Volunteer
        </Typography>
        <form onSubmit={handleSubmit}>
          <Grid container spacing={3}>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="firstname"
                name="firstname"
                label="First Name"
                fullWidth
                value={formData.firstname}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                required
                id="lastname"
                name="lastname"
                label="Last Name"
                fullWidth
                value={formData.lastname}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                id="email"
                name="email"
                label="Email"
                fullWidth
                type="email"
                value={formData.email}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                id="phone_number"
                name="phone_number"
                label="Phone Number"
                fullWidth
                value={formData.phone_number}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="address"
                name="address"
                label="Address"
                fullWidth
                value={formData.address}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                id="city"
                name="city"
                label="City"
                fullWidth
                value={formData.city}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                id="state"
                name="state"
                label="State"
                fullWidth
                value={formData.state}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={4}>
              <TextField
                id="zipcode"
                name="zipcode"
                label="Zip Code"
                fullWidth
                value={formData.zipcode}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Birth Date"
                  value={formData.birth_date}
                  onChange={(date) => handleDateChange('birth_date', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="gender-label">Gender</InputLabel>
                <Select
                  labelId="gender-label"
                  id="gender"
                  name="gender"
                  value={formData.gender}
                  label="Gender"
                  onChange={handleChange}
                >
                  <MenuItem value=""><em>Select Gender</em></MenuItem>
                  <MenuItem value="Male">Male</MenuItem>
                  <MenuItem value="Female">Female</MenuItem>
                  <MenuItem value="Other">Other</MenuItem>
                  <MenuItem value="Prefer not to say">Prefer not to say</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="occupation"
                name="occupation"
                label="Occupation"
                fullWidth
                value={formData.occupation}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="skills"
                name="skills"
                label="Skills (comma separated)"
                fullWidth
                value={formData.skills}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="availability"
                name="availability"
                label="Availability"
                fullWidth
                multiline
                rows={3}
                value={formData.availability}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                id="emergency_contact_name"
                name="emergency_contact_name"
                label="Emergency Contact Name"
                fullWidth
                value={formData.emergency_contact_name}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                id="emergency_contact_phone"
                name="emergency_contact_phone"
                label="Emergency Contact Phone"
                fullWidth
                value={formData.emergency_contact_phone}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Background Check Date"
                  value={formData.background_check_date}
                  onChange={(date) => handleDateChange('background_check_date', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth>
                <InputLabel id="status-label">Status</InputLabel>
                <Select
                  labelId="status-label"
                  id="status"
                  name="status"
                  value={formData.status}
                  label="Status"
                  onChange={handleChange}
                >
                  <MenuItem value=""><em>Select Status</em></MenuItem>
                  <MenuItem value="active">Active</MenuItem>
                  <MenuItem value="inactive">Inactive</MenuItem>
                  <MenuItem value="pending">Pending</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="Start Date"
                  value={formData.start_date}
                  onChange={(date) => handleDateChange('start_date', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12} sm={6}>
              <LocalizationProvider dateAdapter={AdapterDateFns}>
                <DatePicker
                  label="End Date"
                  value={formData.end_date}
                  onChange={(date) => handleDateChange('end_date', date)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </LocalizationProvider>
            </Grid>
            <Grid item xs={12}>
              <TextField
                id="notes"
                name="notes"
                label="Notes"
                fullWidth
                multiline
                rows={4}
                value={formData.notes}
                onChange={handleChange}
              />
            </Grid>
            <Grid item xs={12}>
              <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                disabled={loading}
              >
                {loading ? <CircularProgress size={24} /> : 'Add Volunteer'}
              </Button>
            </Grid>
          </Grid>
        </form>
        <Snackbar open={snackbarOpen} autoHideDuration={6000} onClose={handleCloseSnackbar}>
          <Alert onClose={handleCloseSnackbar} severity={snackbarSeverity} sx={{ width: '100%' }}>
            {snackbarMessage}
          </Alert>
        </Snackbar>
      </Box>
    </Container>
  );
};

export default AddVolunteerForm;