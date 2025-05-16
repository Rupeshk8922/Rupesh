import { useState } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { useAuth } from '../../contexts/authContext';

const predefinedInterests = ['Event', 'Volunteer', 'Donation', 'General Inquiry'];
const predefinedStatuses = ['New', 'Contacted', 'Qualified', 'Lost', 'Converted'];

const AddLeadForm = () => {
  const { user } = useAuth();

  // State for validation errors
  const [nameError, setNameError] = useState('');
  const [emailError, setEmailError] = useState('');
  const [interestError, setInterestError] = useState('');

  // Form data state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: '',
    interest: '',
  });
  // State for loading and feedback messages (add these as needed for UI feedback)
  // const [isLoading, setIsLoading] = useState(false);

  // Check if required fields are empty
  const isRequiredFieldsEmpty = () => { // Simplified for required fields in this instruction
    const requiredFields = ['name', 'email', 'interest'];
    return requiredFields.some(field => !formData[field].trim());
  };

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // TODO: Consider adding debouncing for validation on change, especially for text inputs,
    // to improve performance and user experience on slower devices or networks.
    // This is particularly relevant for mobile responsiveness.

    // Perform validation on change
    if (name === 'name') {
      validateName(value);
    } else if (name === 'email') {
      validateEmail(value);
    } else if (name === 'status') {
      validateStatus(value);
    } else if (name === 'interest') {
      validateInterest(value);
    }
  };

  // Combine all error states to check if there are any validation errors that would prevent submission
  // Note: This check should encompass all relevant validation states in your component.
  const hasErrors = !!nameError || !!emailError || !!interestError;
  // TODO: Include other relevant error states in the hasErrors check as they are implemented.

  // Validation functions
  const validateName = (value) => {
    if (!value.trim()) {
      setNameError('Lead name is required');
    } else if (value.trim().length < 2) {
      setNameError('Lead name must be at least 2 characters');
    } else {
      setNameError('');
    }
  };

  const validateEmail = (value) => {
    const emailRegex = /^[^s@]+@[^s@]+.[^s@]+$/;
    if (!value.trim()) {
      setEmailError('Email is required');
    } else if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const validateStatus = (value) => {
  };

  const validateInterest = (value) => {
    if (!value.trim()) {
      setInterestError('Interest is required');
    } else {
      setInterestError('');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    // setIsLoading(true); // Uncomment and manage loading state for UI feedback

    // Perform validation before submission
    validateName(formData.name);
    validateEmail(formData.email);
    validateInterest(formData.interest);
    // Status validation is handled by the required field check if status is a required field

    // TODO: Validate other fields (phone, company, etc.) here as needed.

    // Check if there are any errors or required fields are empty
    if (hasErrors || isRequiredFieldsEmpty()) {
      return; // Prevent submission if there are errors
    }

    // Check for companyId after initial validation
    if (!user || !user.companyId) {
      console.error('Company information not available.');
      return;
    }

    try {
      const leadsCollectionRef = collection(db, 'data', user.companyId, 'leads');
      await addDoc(leadsCollectionRef, {
        ...formData,
        createdAt: new Date(), // Add creation timestamp if not already present
      });

      console.log('Lead added successfully!');
      // Reset form and errors
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: '',
        interest: '', // Reset interest as well
      });
      setNameError('');
      setEmailError('');
      setInterestError('');
      // TODO: Clear other error states as they are added.
    } catch (error) {
      console.error('Error adding lead:', error);
    }
    // finally { setIsLoading(false); } // Uncomment to manage loading state
  };

  return (
    <div className="p-4 bg-white rounded shadow-md max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Lead</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="flex flex-col">
          {/* Ensure labels are always visible and correctly associated with inputs, especially on mobile */}
          {/* Using flex-col ensures stacking on small screens by default */}
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">Name</label>
          {/* Use w-full for full width on all screen sizes, letting flex-col handle stacking */}
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            onBlur={() => validateName(formData.name)}
            required
          />
          {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
        </div>

        <div className="flex flex-col">
          {/* Ensure labels are always visible and correctly associated with inputs */}
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">Email</label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            onBlur={() => validateEmail(formData.email)}
            required
          />
          {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
        </div>

        <div className="flex flex-col">
          {/* Ensure labels are always visible and correctly associated with inputs */}
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={formData.phone}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="flex flex-col">
          {/* Ensure labels are always visible and correctly associated with inputs */}
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">Company</label>
          <input
            type="text"
            id="company"
            name="company"
            value={formData.company}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          />
        </div>

        <div className="flex flex-col">
          {/* Ensure the select dropdown is usable on mobile. Default styling with w-full and padding should work, */}
          {/* but test on various devices to ensure the native select UI is not problematic. */}
          <label htmlFor="interest" className="block text-sm font-medium text-gray-700 mb-1">Interest</label>
          <select
            id="interest"
            name="interest"
            value={formData.interest}
            onChange={handleChange}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            onBlur={() => validateInterest(formData.interest)}
            required
          >
            <option value="">Select Interest</option>
            {predefinedInterests.map(interest => (
              <option key={interest} value={interest}>{interest}</option>
            ))}
          </select>
          {interestError && <p className="text-red-500 text-sm mt-1">{interestError}</p>}
        </div>

        <button
          // Ensure button is full width on small screens for easy tapping
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={!formData.name || !formData.email || !formData.interest || nameError || emailError || interestError} // Simplified disabled check
        >
          Save Lead
        </button>

        {/* Placeholder for loading, success, and error messages */}
        {/* Ensure feedback messages are clearly visible and formatted correctly on mobile */}
        {/* Use responsive text sizes and padding if needed */}
        {/* {isLoading && <p className="text-blue-500 mt-2">Saving lead...</p>} */}
        {/* {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>} */}
        {/* {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>} */}
      </form>
    </div>
  );
};

export default AddLeadForm;
