jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
// Assuming you have Firebase configured and exported

// import { auth, db } from '../firebase/config';
// import { addVolunteer } from '../firebase/services/firestoreService'; // Corrected import path


function SignupVolunteerPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    availability: [], // For checkboxes or multiselect
    interests: '',    // For a single select
    preferredLocation: '',
  });

  // State for validation errors
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const navigate = useNavigate();

  // Basic validation logic
  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) {
      newErrors.fullName = 'Full Name is required';
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Invalid email format';
    }
    // Basic phone number validation (adjust regex as needed)
    if (formData.phone.trim() && !/^\d{10,}$/.test(formData.phone)) {
      newErrors.phone = 'Invalid phone number format';
    }
    if (formData.availability.length === 0) {
       newErrors.availability = 'Please select your availability';
    }
     if (!formData.interests) {
       newErrors.interests = 'Please select an interest area';
     }
    if (!formData.preferredLocation.trim()) {
       newErrors.preferredLocation = 'Preferred Location is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;

    // Handle checkboxes (for Availability)
    if (type === 'checkbox') {
      setFormData(prevState => ({
        ...prevState,
        [name]: checked
          ? [...prevState[name], value]
          : prevState[name].filter(item => item !== value),
      }));
    } else {
      // Handle other input types (text, email, select)
      setFormData(prevState => ({
        ...prevState,
        [name]: value,
      }));
    }

    // Optional: Basic real-time validation on change (can be resource intensive)
    // Consider validating on blur instead for better performance
     const newErrors = { ...errors };
     // Add specific validation for the changed field here if needed
     setErrors(newErrors);
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    // Perform validation for the specific field on blur
    const newErrors = { ...errors };
    switch (name) {
      case 'fullName':
        if (!value.trim()) newErrors.fullName = 'Full Name is required';
        else newErrors.fullName = '';
        break;
      case 'email':
         if (!value.trim()) newErrors.email = 'Email is required';
         else if (!/\S+@\S+\.\S+/.test(value)) newErrors.email = 'Invalid email format';
         else newErrors.email = '';
         break;
       case 'phone':
          if (value.trim() && !/^\d{10,}$/.test(value)) newErrors.phone = 'Invalid phone number format';
          else newErrors.phone = '';
          break;
      case 'preferredLocation':
         if (!value.trim()) newErrors.preferredLocation = 'Preferred Location is required';
         else newErrors.preferredLocation = '';
         break;
      default:
        break;
    }
    setErrors(newErrors);
  };

   // Additional blur handling for select/checkboxes if needed
  const handleAvailabilityBlur = () => {
     const newErrors = { ...errors };
     if (formData.availability.length === 0) newErrors.availability = 'Please select your availability';
     else newErrors.availability = '';
     setErrors(newErrors);
  };

   const handleInterestsBlur = () => {
      const newErrors = { ...errors };
      if (!formData.interests) newErrors.interests = 'Please select an interest area';
      else newErrors.interests = '';
      setErrors(newErrors);
   };


  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError(null);
    setSuccessMessage(null);
    setLoading(true);

    const isFormValid = validateForm();

    if (!isFormValid) {
      setLoading(false);
      setSubmissionError('Please fix the errors above.');
      return;
    }

    try {
      // TODO: Implement actual volunteer creation logic (e.g., add to Firestore)
      // Ensure this logic handles potential errors (e.g., duplicate email)
      console.log('Submitting volunteer data:', formData);

      // Example: Add to Firestore (replace with your actual logic)
      // await addVolunteer(formData);

      setSuccessMessage('Thank you for signing up! Your application will be reviewed.');
      // Clear form after successful submission
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        availability: [],
        interests: '',
        preferredLocation: '',
      });
       setErrors({}); // Clear errors on success

      // Optional: Redirect to a thank you page or home page
      // navigate('/thank-you');

    } catch (err) {
      console.error('Volunteer signup error:', err);
      setSubmissionError('Failed to sign up. Please try again.'); // More generic error for the user
    } finally {
      setLoading(false);
    }
  };

  return (
    // Mobile Responsiveness: Use padding and center the form on larger screens.
    // p-4 provides padding on all sides. max-w-md and mx-auto center the form
    // and limit its width on medium and larger screens, allowing full width on small screens.
    <div className="p-4 max-w-md mx-auto">
      {/* Mobile Responsiveness: Ensure heading text scales or wraps. */}
      <h2 className="text-2xl font-bold mb-6 text-center">Volunteer Sign Up</h2>

      {/* Display success or error messages */}
      {successMessage && (
        <p className="text-green-600 text-center mb-4">{successMessage}</p>
      )}
      {submissionError && (
        // Mobile Responsiveness: Ensure error messages are readable on small screens.
        <p className="text-red-600 text-center mb-4">{submissionError}</p>
      )}

      {/* Mobile Responsiveness: space-y-4 provides vertical spacing between form groups. */}
      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Full Name */}
        <div>
          {/* Mobile Responsiveness: Labels are block, ensuring they are above inputs on small screens. */}
          <label htmlFor="fullName" className="block text-sm font-medium text-gray-700">Full Name</label>
          {/* Mobile Responsiveness: w-full ensures input takes up the full width of its container. */}
          <input
            type="text"
            id="fullName"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.fullName && (
            // Mobile Responsiveness: Error messages use small text and red color.
            <p className="mt-1 text-sm text-red-600">{errors.fullName}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600">{errors.email}</p>
          )}
        </div>

        {/* Phone Number */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">Phone Number (Optional)</label>
          <input
            type="text" // Use text for flexibility with various formats, or tel for mobile keyboards
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
             onBlur={handleBlur}
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
           {errors.phone && (
            <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
          )}
        </div>

        {/* Availability Checkboxes (Example) */}
        <div>
           {/* Mobile Responsiveness: Label is block. Vertical spacing below label helps. */}
          <label className="block text-sm font-medium text-gray-700 mb-2">Availability</label>
          {/* Mobile Responsiveness: Ensure checkboxes and labels are clearly aligned and have enough touch area. */}
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-3"> {/* Use a grid for better layout on larger screens, stacks on small */}
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Weekends', 'Evenings'].map(day => (
              <div key={day} className="flex items-center">
                <input
                  type="checkbox"
                  id={`availability-${day}`}
                  name="availability"
                  value={day}
                  checked={formData.availability.includes(day)}
                  onChange={handleChange}
                  onBlur={handleAvailabilityBlur} // Add blur for validation
                  className="focus:ring-blue-500 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                {/* Mobile Responsiveness: Label needs to be clickable and close to the checkbox. */}
                <label htmlFor={`availability-${day}`} className="ml-2 block text-sm text-gray-900 cursor-pointer">{day}</label>
              </div>
            ))}
          </div>
           {errors.availability && (
            <p className="mt-2 text-sm text-red-600">{errors.availability}</p>
          )}
        </div>

        {/* Interests Select */}
        <div>
          <label htmlFor="interests" className="block text-sm font-medium text-gray-700">Interests</label>
           {/* Mobile Responsiveness: Select with w-full takes full width. Ensure options are readable. */}
          <select
            id="interests"
            name="interests"
            value={formData.interests}
            onChange={handleChange}
            onBlur={handleInterestsBlur} // Add blur for validation
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          >
            <option value="">Select an Interest Area</option>
            <option value="Education">Education</option>
            <option value="Health">Health</option>
            <option value="Environment">Environment</option>
            <option value="Community Support">Community Support</option>
            {/* Add more options as needed */}
          </select>
           {errors.interests && (
            <p className="mt-1 text-sm text-red-600">{errors.interests}</p>
          )}
        </div>

        {/* Preferred Location */}
        <div>
          <label htmlFor="preferredLocation" className="block text-sm font-medium text-gray-700">Preferred Location/City</label>
          <input
            type="text"
            id="preferredLocation"
            name="preferredLocation"
            value={formData.preferredLocation}
            onChange={handleChange}
            onBlur={handleBlur}
            required
            className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
          />
           {errors.preferredLocation && (
            <p className="mt-1 text-sm text-red-600">{errors.preferredLocation}</p>
          )}
        </div>

        {/* Submit Button */}
        <div>
          {/* Mobile Responsiveness: Button takes full width on small screens by default in this layout.
              Ensure sufficient padding for touch. */}
          <button
            type="submit"
            disabled={loading}
            className="w-full flex justify-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Signing Up...' : 'Sign Up'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default SignupVolunteerPage;