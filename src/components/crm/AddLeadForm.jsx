import { useState, useEffect } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase/config.js';
import { useAuth } from '../../contexts/authContext';

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

  // Loading and feedback states
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

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
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!value.trim()) {
      setEmailError('Email is required');
    } else if (!emailRegex.test(value)) {
      setEmailError('Please enter a valid email address');
    } else {
      setEmailError('');
    }
  };

  const validateInterest = (value) => {
    if (!value.trim()) {
      setInterestError('Interest is required');
    } else {
      setInterestError('');
    }
  };

  // Check if required fields are empty
  const isRequiredFieldsEmpty = () => {
    const requiredFields = ['name', 'email', 'interest'];
    return requiredFields.some((field) => !formData[field].trim());
  };

  // Combine error states
  const hasErrors = Boolean(nameError || emailError || interestError);

  // Handle form field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    // Validate the field immediately on change for better UX
    if (name === 'name') validateName(value);
    else if (name === 'email') validateEmail(value);
    else if (name === 'interest') validateInterest(value);
  };

  // Clear success message when form data changes
  useEffect(() => {
    if (successMessage) setSuccessMessage('');
  }, [formData, successMessage]);

  // Submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    // Clear previous errors
    setErrorMessage('');

    // Validate all fields before submit
    validateName(formData.name);
    validateEmail(formData.email);
    validateInterest(formData.interest);

    // Wait for validation states to update before checking errors
    if (isRequiredFieldsEmpty() || hasErrors) {
      setErrorMessage('Please fix the errors in the form before submitting.');
      return;
    }

    if (!user || !user.companyId) {
      setErrorMessage('Company information not available.');
      return;
    }

    setIsLoading(true);
    try {
      const leadsCollectionRef = collection(db, 'data', user.companyId, 'leads');
      await addDoc(leadsCollectionRef, {
        ...formData,
        createdAt: new Date(),
      });

      setSuccessMessage('Lead added successfully!');
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: '',
        interest: '',
      });
      setNameError('');
      setEmailError('');
      setInterestError('');
    } catch (error) {
      setErrorMessage('Error adding lead: ' + error.message);
      console.error('Error adding lead:', error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="p-4 bg-white rounded shadow-md max-w-xl mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Add New Lead</h2>
      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        <div className="flex flex-col">
          <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
            Name
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={formData.name}
            onChange={handleChange}
            onBlur={() => validateName(formData.name)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
          {nameError && <p className="text-red-500 text-sm mt-1">{nameError}</p>}
        </div>

        <div className="flex flex-col">
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            Email
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            onBlur={() => validateEmail(formData.email)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          />
          {emailError && <p className="text-red-500 text-sm mt-1">{emailError}</p>}
        </div>

        <div className="flex flex-col">
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700 mb-1">
            Phone
          </label>
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
          <label htmlFor="company" className="block text-sm font-medium text-gray-700 mb-1">
            Company
          </label>
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
          <label htmlFor="interest" className="block text-sm font-medium text-gray-700 mb-1">
            Interest
          </label>
          <select
            id="interest"
            name="interest"
            value={formData.interest}
            onChange={handleChange}
            onBlur={() => validateInterest(formData.interest)}
            className="w-full border-gray-300 rounded-md shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
            required
          >
            <option value="">Select Interest</option>
            {/* Add dynamic interests here if needed */}
          </select>
          {interestError && <p className="text-red-500 text-sm mt-1">{interestError}</p>}
        </div>

        <button
          type="submit"
          className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed"
          disabled={isLoading || isRequiredFieldsEmpty() || hasErrors}
        >
          {isLoading ? 'Saving...' : 'Save Lead'}
        </button>

        {successMessage && <p className="text-green-500 mt-2">{successMessage}</p>}
        {errorMessage && <p className="text-red-500 mt-2">{errorMessage}</p>}
      </form>
    </div>
  );
};

export default AddLeadForm;
