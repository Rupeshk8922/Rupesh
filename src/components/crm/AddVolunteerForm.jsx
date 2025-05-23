import { useState } from 'react';
import { useAuth } from '../../contexts/authContext.jsx';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const AddVolunteerForm = () => {
  const { companyId } = useAuth();

  // State for volunteer input fields
  const [volunteer, setVolunteer] = useState({
    name: '',
    email: '',
    phone: '',
    location: '',
    availability: [],
    interests: [],
  });

  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [feedback, setFeedback] = useState(null);

  // Options for select fields
  const availabilityOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Weekends', 'Evenings'];
  const interestOptions = [
    'Education', 'Health', 'Environment', 'Community Support',
    'Fundraising', 'Logistics', 'Arts & Culture', 'Animals', 'Seniors', 'Youth'
  ];

  // Handle input field changes (text inputs)
  const handleChange = (e) => {
    setVolunteer({ ...volunteer, [e.target.name]: e.target.value });
    validateField(e.target.name, e.target.value);
  };

  // Handle multi-select changes (for availability and interests)
  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    setVolunteer(prevState => ({
      ...prevState,
      [name]: checked
        ? [...prevState[name], value]
        : prevState[name].filter(item => item !== value),
    }));
  };

  // Validate individual fields on change
  const validateField = (name, value) => {
    let error = '';
    if (['name', 'email', 'phone', 'location'].includes(name) && !String(value).trim()) {
      error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`;
    } else if (name === 'email' && value.trim() && !/\S+@\S+\.\S+/.test(value)) {
      error = 'Invalid email format.';
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Validate entire form before submission
  const validateForm = () => {
    const newErrors = {};
    ['name', 'email', 'phone', 'location'].forEach(field => {
      if (!volunteer[field].trim()) {
        newErrors[field] = `${field.charAt(0).toUpperCase() + field.slice(1)} is required.`;
      }
    });
    if (volunteer.email && !/\S+@\S+\.\S+/.test(volunteer.email)) {
      newErrors.email = 'Invalid email format.';
    }
    // Optionally validate availability and interests here (e.g., at least one selected)
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    if (!validateForm()) {
      setIsLoading(false);
      setFeedback({ type: 'error', message: 'Please fix the errors above.' });
      return;
    }

    if (!companyId) {
      setFeedback({ type: 'error', message: 'Company information not available.' });
      setIsLoading(false);
      return;
    }

    try {
      const volunteerCollectionRef = collection(db, 'data', companyId, 'volunteers');
      await addDoc(volunteerCollectionRef, {
        ...volunteer,
        joinedAt: new Date(),
        status: 'Active',
        assignedEvents: [],
      });

      setFeedback({ type: 'success', message: 'Volunteer added successfully!' });
      setVolunteer({
        name: '',
        email: '',
        phone: '',
        location: '',
        availability: [],
        interests: [],
      });
      setErrors({});
    } catch (error) {
      console.error('Error adding volunteer:', error);
      setFeedback({ type: 'error', message: 'Failed to add volunteer.' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-xl mx-auto p-6 bg-white rounded-xl shadow-md">
      <h2 className="text-2xl font-semibold mb-4">Add Volunteer</h2>

      {feedback && (
        <div
          className={`mb-4 p-3 rounded ${
            feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
          }`}
        >
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">
            Name <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="name"
            name="name"
            value={volunteer.name}
            onChange={handleChange}
            className={`w-full border px-3 py-2 rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1 whitespace-pre-wrap">{errors.name}</p>}
        </div>

        {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">
            Email <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            id="email"
            name="email"
            value={volunteer.email}
            onChange={handleChange}
            className={`w-full border px-3 py-2 rounded ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.email && <p className="text-red-500 text-sm mt-1 whitespace-pre-wrap">{errors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">
            Phone <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            id="phone"
            name="phone"
            value={volunteer.phone}
            onChange={handleChange}
            className={`w-full border px-3 py-2 rounded ${errors.phone ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.phone && <p className="text-red-500 text-sm mt-1 whitespace-pre-wrap">{errors.phone}</p>}
        </div>

        {/* Location */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-1">
            Location <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            id="location"
            name="location"
            value={volunteer.location}
            onChange={handleChange}
            className={`w-full border px-3 py-2 rounded ${errors.location ? 'border-red-500' : 'border-gray-300'}`}
          />
          {errors.location && <p className="text-red-500 text-sm mt-1 whitespace-pre-wrap">{errors.location}</p>}
        </div>

        {/* Availability - multi-select */}
        <div>
          <label className="block text-sm font-medium mb-1">Availability</label>
          <div className="flex flex-wrap gap-2 max-h-40 overflow-auto border rounded p-2">
            {availabilityOptions.map(option => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="availability"
                  value={option}
                  checked={volunteer.availability.includes(option)}
                  onChange={handleCheckboxChange}
                  className="cursor-pointer"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Interests - checkbox grid */}
        <div>
          <label className="block text-sm font-medium mb-1">Interests</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {interestOptions.map(option => (
              <label key={option} className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  id={`interest-${option}`}
                  name="interests"
                  value={option}
                  checked={volunteer.interests.includes(option)}
                  onChange={handleCheckboxChange}
                  className="cursor-pointer"
                />
                <span className="text-sm">{option}</span>
              </label>
            ))}
          </div>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {isLoading ? 'Adding Volunteer...' : 'Add Volunteer'}
        </button>
      </form>
    </div>
  );
};

export default AddVolunteerForm;
