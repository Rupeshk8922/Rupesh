import { useState } from 'react';
import { styled, Box } from '@mui/system';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../firebase/config'; // Import the initialized Firebase app instance

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

const StyledTextField = styled('TextField')({
  // Your styling here
});

function AddDonorForm() {
  const [donorName, setDonorName] = useState('');
  const [contactNumber, setContactNumber] = useState('');
  const [emailAddress, setEmailAddress] = useState('');
  const [formError, setFormError] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');

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

    // Email address is optional, validate only if provided
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

  const handleSubmit = async () => {
    setMessage(''); // Clear previous messages

    if (validateForm()) {
      try {
        setIsLoading(true);
        await addDoc(collection(db, 'donors'), { // Use the imported db instance
          donorName,
          contactNumber,
          emailAddress,
        });
        setMessage({ text: 'Donor added successfully!', type: 'success' });
      } catch (error) {
        console.error('Error adding donor:', error);
        setMessage({ text: 'Failed to add donor. Please try again later.', type: 'error' });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <StyledForm onSubmit={handleSubmit}>      
      <StyledTextField
        fullWidth
        label="Donor Name"
        variant="outlined"
        value={donorName}
        onChange={(e) => setDonorName(e.target.value)}
        error={!!formError.donorName}
        helperText={formError.donorName}
        required
        aria-label="Donor Name"
      />
      <StyledTextField
        fullWidth
        label="Contact Number"
        variant="outlined"
        value={contactNumber}
        onChange={(e) => setContactNumber(e.target.value)}
        error={!!formError.contactNumber}
        helperText={formError.contactNumber}
        required
        aria-label="Contact Number"
      />
      <StyledTextField
        fullWidth
        label="Email Address"
        variant="outlined"
        type="email"
        value={emailAddress}
        onChange={(e) => setEmailAddress(e.target.value)}
        error={!!formError.emailAddress}
        helperText={formError.emailAddress}
        aria-label="Email Address"
      />
      
      {message && (
        <Box mt={2}>
          <Typography color={message.type === 'success' ? 'green' : 'red'}>
            {message.text}
          </Typography>
        </Box>
      )}
    </StyledForm>
  );
}

export default AddDonorForm;
