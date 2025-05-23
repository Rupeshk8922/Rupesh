import { useState } from 'react';
import { styled } from '@mui/system';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Box from '@mui/material/Box';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config'; // Your Firebase config file

const StyledForm = styled('form')({
  '& .MuiOutlinedInput-root': {
    '& fieldset': {
      borderColor: '#ccc',
    },
    '&:hover fieldset': {
      borderColor: '#007bff',
    },
    '&.Mui-focused fieldset': {
      borderColor: '#007bff',
    },
  },
});

function AddDonorForm() {
  const [donorName, setDonorName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [formError, setFormError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState(null);

  const validateForm = () => {
    let isValid = true;
    let errors = {};

    if (!donorName.trim()) {
      errors.donorName = 'Donor name is required';
      isValid = false;
    }

    const phoneRegex = /^\d{10}$/;
    if (!contactNumber.trim()) {
      errors.contactNumber = 'Contact number is required';
      isValid = false;
    } else if (!phoneRegex.test(contactNumber)) {
      errors.contactNumber = 'Invalid contact number format';
      isValid = false;
    }

    if (emailAddress.trim()) {
      const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailRegex.test(emailAddress)) {
        errors.emailAddress = 'Invalid email address format';
        isValid = false;
      }
    }

    setFormError(errors);
    return isValid;
  };

  const handleSubmit = async (e) => {
    e.preventDefault(); // Prevent default form submit reload
    setMessage(null); // Clear previous messages

    if (validateForm()) {
      try {
        setIsLoading(true);
        await addDoc(collection(db, 'donors'), {
          donorName,
          contactNumber,
          emailAddress,
        });
        setMessage({ text: 'Donor added successfully!', type: 'success' });
        setDonorName('');
        setContactNumber('');
        setEmailAddress('');
        setFormError({});
      } catch (error) {
        console.error('Error adding donor:', error);
        setMessage({ text: 'Failed to add donor. Please try again later.', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <StyledForm onSubmit={handleSubmit} noValidate>
      <TextField
        fullWidth
        label="Donor Name"
        variant="outlined"
        value={donorName}
        onChange={(e) => setDonorName(e.target.value)}
        error={!!formError.donorName}
        helperText={formError.donorName}
        required
        aria-label="Donor Name"
        margin="normal"
      />
      <TextField
        fullWidth
        label="Contact Number"
        variant="outlined"
        value={contactNumber}
        onChange={(e) => setContactNumber(e.target.value)}
        error={!!formError.contactNumber}
        helperText={formError.contactNumber}
        required
        aria-label="Contact Number"
        margin="normal"
      />
      <TextField
        fullWidth
        label="Email Address"
        variant="outlined"
        type="email"
        value={emailAddress}
        onChange={(e) => setEmailAddress(e.target.value)}
        error={!!formError.emailAddress}
        helperText={formError.emailAddress}
        aria-label="Email Address"
        margin="normal"
      />

      {message && (
        <Box mt={2}>
          <Typography color={message.type === 'success' ? 'green' : 'red'}>
            {message.text}
          </Typography>
        </Box>
      )}

      <Box mt={3}>
        <Button type="submit" variant="contained" color="primary" disabled={isLoading} fullWidth>
          {isLoading ? 'Adding...' : 'Add Donor'}
        </Button>
      </Box>
    </StyledForm>
  );
}

export default AddDonorForm;
