import React, { useState, useEffect } from "react";
import dayjs from "dayjs";
import {
  collection,
  addDoc,
  getDocs,
} from "firebase/firestore";
import { db } from "../firebase/config";

import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { TimePicker } from "@mui/x-date-pickers/TimePicker";

import Box from "@mui/material/Box";
import Alert from "@mui/material/Alert";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import Select from "@mui/material/Select";
import MenuItem from "@mui/material/MenuItem";
import Typography from "@mui/material/Typography";
import RadioGroup from "@mui/material/RadioGroup";
import FormControlLabel from "@mui/material/FormControlLabel";
import Radio from "@mui/material/Radio";
import Grid from "@mui/material/Grid";
import TextField from "@mui/material/TextField";
import Button from "@mui/material/Button";

function CallLogForm() {
  const [donors, setDonors] = useState([]);
  const [selectedDonor, setSelectedDonor] = useState("");
  const [callOutcome, setCallOutcome] = useState("");
  const [followUpDate, setFollowUpDate] = useState(dayjs());
  const [followUpTime, setFollowUpTime] = useState(dayjs());
  const [donationStatus, setDonationStatus] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const fetchDonors = async () => {
      try {
        const querySnapshot = await getDocs(collection(db, "donors"));
        const donorList = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));
        setDonors(donorList);
      } catch (err) {
        setError("Error fetching donors");
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDonors();
  }, []);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!selectedDonor || !callOutcome || !donationStatus) {
      setError("Please fill all required fields.");
      setSuccess(false);
      return;
    }

    setError(null);

    const callLogData = {
      donorId: selectedDonor,
      callOutcome,
      followUpDate: followUpDate.toDate(),
      followUpTime: followUpTime.toDate(),
      donationStatus,
      timestamp: dayjs().toDate(),
    };

    try {
      await addDoc(collection(db, "callLogs"), callLogData);
      setSuccess(true);

      // Clear form fields after successful submission
      setSelectedDonor("");
      setCallOutcome("");
      setFollowUpDate(dayjs());
      setFollowUpTime(dayjs());
      setDonationStatus("");
    } catch (err) {
      setError("Error saving call log");
      setSuccess(false);
      console.error("Error saving call log:", err);
    }
  };

  return (
    <LocalizationProvider dateAdapter={AdapterDayjs}>
      <Box sx={{ maxWidth: 600, margin: "auto", p: 2 }}>
        {isLoading && <Alert severity="info">Loading donors...</Alert>}
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
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

            <FormControl component="fieldset" required sx={{ mb: 3 }}>
              <Typography component="legend" sx={{ mb: 1 }}>
                Call Outcome
              </Typography>
              <RadioGroup
                aria-label="call-outcome"
                name="call-outcome"
                value={callOutcome}
                onChange={(e) => setCallOutcome(e.target.value)}
              >
                <FormControlLabel
                  value="successful"
                  control={<Radio />}
                  label="Successful"
                />
                <FormControlLabel
                  value="unsuccessful"
                  control={<Radio />}
                  label="Unsuccessful"
                />
                <FormControlLabel
                  value="follow-up"
                  control={<Radio />}
                  label="Follow-Up"
                />
                <FormControlLabel
                  value="no-answer"
                  control={<Radio />}
                  label="No Answer"
                />
              </RadioGroup>
            </FormControl>

            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={12} sm={6}>
                <DatePicker
                  label="Follow-Up Date"
                  value={followUpDate}
                  onChange={(newValue) => setFollowUpDate(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TimePicker
                  label="Follow-Up Time"
                  value={followUpTime}
                  onChange={(newValue) => setFollowUpTime(newValue)}
                  renderInput={(params) => <TextField {...params} fullWidth />}
                />
              </Grid>
            </Grid>

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
              <Alert severity="success" sx={{ mb: 2 }}>
                Call Log saved successfully!
              </Alert>
            )}

            <Button type="submit" variant="contained" color="primary" fullWidth>
              Save Call Log
            </Button>
          </form>
        )}
      </Box>
    </LocalizationProvider>
  );
}

export default CallLogForm;
