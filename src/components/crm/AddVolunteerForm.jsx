import { useState } from 'react';
import { useAuth } from '../../contexts/authContext.jsx';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../firebase/config';

const AddVolunteerForm = () => {
  const { companyId } = useAuth();
  
  // Mobile Responsiveness Consideration:
  // The overall form structure uses flex-col (implicitly via space-y-4). This naturally stacks elements
  // vertically on smaller screens, which is a good starting point for responsiveness.
  // Ensure that individual input fields and their containers also handle width appropriately.
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

  const availabilityOptions = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Weekends', 'Evenings'];
  const interestOptions = ['Education', 'Health', 'Environment', 'Community Support', 'Fundraising', 'Logistics', 'Arts & Culture', 'Animals', 'Seniors', 'Youth'];

  const handleChange = (e) => {
    setVolunteer({ ...volunteer, [e.target.name]: e.target.value });
    validateField(e.target.name, e.target.value); // Validate on change
  };

  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    setVolunteer(prevState => ({
      ...prevState,
      [name]: checked
        ? [...prevState[name], value]
        : prevState[name].filter(item => item !== value)
    }));
  };

  const validateField = (name, value) => {
    let error = '';
    if (['name', 'email', 'phone', 'location'].includes(name) && !String(value).trim()) {
      error = `${name.charAt(0).toUpperCase() + name.slice(1)} is required.`;
    } else if (name === 'email' && String(value).trim() && !/\S+@\S+\.\S+/.test(value)) {
      error = 'Invalid email format.';
    }
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const validateForm = () => {
    const newErrors = {};
    ['name', 'email', 'phone', 'location'].forEach(field => validateField(field, volunteer[field]));
    // Add validation for availability and interests if needed (e.g., at least one selected)

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFeedback(null);
    setIsLoading(true);

    const isValid = validateForm();

    if (!isValid) {
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
        joinedAt: new Date(), // Add a timestamp for when they joined
        status: 'Active', // Default status for new volunteers
        assignedEvents: [] // Initialize with empty array
      });
      setFeedback({ type: 'success', message: 'Volunteer added successfully!' });
      // Reset form
      setVolunteer({
        name: '',
        email: '',
        phone: '',
        location: '',
        availability: [],
        interests: [],
      });
      setErrors({}); // Clear errors on success
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
        <div className={`mb-4 p-3 rounded ${feedback.type === 'success' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
          {feedback.message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Mobile Responsiveness Consideration:
            Ensure that the input fields take up full width on smaller screens but can be constrained
            or participate in a grid layout on larger screens if desired. The current `w-full`
            combined with the parent `space-y-4` handles basic stacking.
        */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium mb-1">Name <span className="text-red-500">*</span></label>
          <input type="text" id="name" name="name" value={volunteer.name} onChange={handleChange} className={`w-full border px-3 py-2 rounded ${errors.name ? 'border-red-500' : ''}`} />
          {errors.name && <p className="text-red-500 text-sm mt-1 whitespace-pre-wrap">{errors.name}</p>}
        </div>
        {/* Repeat responsiveness consideration for other input fields */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium mb-1">Email <span className="text-red-500">*</span></label>
          <input type="email" id="email" name="email" value={volunteer.email} onChange={handleChange} className={`w-full border px-3 py-2 rounded ${errors.email ? 'border-red-500' : ''}`} />
          {errors.email && <p className="text-red-500 text-sm mt-1 whitespace-pre-wrap">{errors.email}</p>}
        </div>
        {/* Repeat responsiveness consideration for other input fields */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium mb-1">Phone <span className="text-red-500">*</span></label>
          <input type="tel" id="phone" name="phone" value={volunteer.phone} onChange={handleChange} className={`w-full border px-3 py-2 rounded ${errors.phone ? 'border-red-500' : ''}`} />
          {errors.phone && <p className="text-red-500 text-sm mt-1 whitespace-pre-wrap">{errors.phone}</p>}
        </div>
        {/* Repeat responsiveness consideration for other input fields */}
        <div>
          <label htmlFor="location" className="block text-sm font-medium mb-1">Location <span className="text-red-500">*</span></label>
          <input type="text" id="location" name="location" value={volunteer.location} onChange={handleChange} className={`w-full border px-3 py-2 rounded ${errors.location ? 'border-red-500' : ''}`} />
          {errors.location && <p className="text-red-500 text-sm mt-1 whitespace-pre-wrap">{errors.location}</p>}
        </div>

        {/* Mobile Responsiveness Consideration:
            Multi-select dropdowns (`<select multiple>`) can be challenging on mobile.
            The current implementation uses a fixed height (`h-32`), which might require scrolling.
            For better mobile UX, consider:
            - Using a dedicated library for mobile-friendly multi-select.
            - Implementing a modal or a different UI pattern for selection on small screens.
            - Ensuring the height is sufficient but doesn't take up too much vertical space.
        */}
        <div>
          <label className="block text-sm font-medium mb-1">Availability</label>
          <select multiple name="availability" value={volunteer.availability} onChange={handleCheckboxChange} className="w-full border px-3 py-2 rounded h-32">
            {availabilityOptions.map(option => (
              <option key={option} value={option}>{option}</option>
            ))}
          </select>
          {/* You might want to add a comment here about mobile-specific alternatives if using a multi-select */}
        </div>

        {/* Mobile Responsiveness Consideration:
            The checkbox grid for interests uses `grid grid-cols-2 md:grid-cols-3`.
            This is a good approach for responsiveness, allowing 2 columns on small screens and 3 on medium.
            Ensure the gap (`gap-2`) is appropriate for spacing on different screen sizes.
            On very small screens, the labels should wrap if needed or font size could be adjusted slightly.
        */}
        <div>
          <label className="block text-sm font-medium mb-1">Interests</label>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {/* Each checkbox item within the grid should handle its content wrap */}
            {interestOptions.map(option => (
              <div key={option} className="flex items-center">
                <input
                  type="checkbox"
                  id={`interest-${option}`}
                  name="interests"
                  value={option}
                  checked={volunteer.interests.includes(option)}
                  onChange={handleCheckboxChange}
                  className="mr-2"
                />
                <label htmlFor={`interest-${option}`} className="text-sm">{option}</label>
              </div>
            ))}
          </div>
        </div>

        {/* Mobile Responsiveness Consideration:
            The submit button uses `w-full`, ensuring it spans the full width on smaller screens, which is good practice.
        */}
        <button
          type="submit"
          disabled={isLoading}
          className="w-full bg-blue-600 text-white py-2 px-4 rounded hover:bg-blue-700"
        >
          {isLoading ? 'Adding Volunteer...' : 'Add Volunteer'}
        </button>
      </form>
    </div>
  );
};

export default AddVolunteerForm;
