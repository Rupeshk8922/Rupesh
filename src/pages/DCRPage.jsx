import React from 'react';
import DCRForm from '../components/forms/DCRForm'; // Assuming DCRForm is in the forms component directory
import { useAuth } from '../contexts/authContext'; // Import useAuth hook
import { Box, Typography } from '@mui/material';

function DCRPage() {
  return (
    <Box sx={{ p: 3, maxWidth: 800, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Daily Call Report
      </Typography>
      <DCRForm />
    </Box>
  );
}

export default DCRPage;
