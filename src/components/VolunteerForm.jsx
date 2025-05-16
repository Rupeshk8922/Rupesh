import { useState } from 'react';
import { db } from '../firebase/config'; // Assuming your firebase config is here
import { collection, addDoc, Timestamp } from 'firebase/firestore';
import { useauthContext } from '../contexts/authContext'; // Assuming your authContext is here
import { useAuth } from '../contexts/authContext.jsx'; // Assuming your authContext is here

const VolunteerForm = ({ onSubmit }) => {
  const [formData, setFormData] = useState({
    name: '',
    phone: '',
    email: '',
    location: '',
    availability: [],
    interests: [],
    companyId: '',  // Now empty, will be set dynamically
    registeredBy: '',  // Now empty, will be set dynamically
  });

  const availabilityOptions = ['Weekdays', 'Weekends', 'Mornings', 'Afternoons', 'Evenings'];
  const interestOptions = ['Teaching', 'Fundraising', 'Environmental Cleanup', 'Mentoring', 'Event Support'];

  const { currentUser } = useAuth(); // Get current user from context

  // Handle input field changes
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  // Handle checkbox changes
  const handleCheckboxChange = (e) => {
    const { name, value, checked } = e.target;
    setFormData((prevFormData) => {
      const currentValues = prevFormData[name];
      if (checked) {
        return { ...prevFormData, [name]: [...currentValues, value] };
      } else {
        return { ...prevFormData, [name]: currentValues.filter((item) => item !== value) };
      }
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();

    const companyId = currentUser?.companyId || null; // Get companyId from currentUser context
    const registeredBy = currentUser?.uid || null; // Get registeredBy from currentUser context

    try {
      const volunteerCollectionRef = collection(db, 'volunteers');
      await addDoc(volunteerCollectionRef, {
        name: formData.name,
        phone: formData.phone,
        email: formData.email,
        location: formData.location,
        availability: formData.availability,
        interests: formData.interests,
        companyId,  // Use actual companyId from context
        registeredBy,  // Use actual registeredBy ID from context
        createdAt: Timestamp.now(),
        updatedAt: Timestamp.now(),
      });
      console.log('Volunteer added successfully!');
      
      // Optionally reset the form after submission
      setFormData({
        name: '',
        phone: '',
        email: '',
        location: '',
        availability: [],
        interests: [],
        companyId: '',
        registeredBy: '',
      });

      // Optional: Close modal or provide confirmation (if required)
      if (onSubmit) onSubmit();
    } catch (error) {
      console.error('Error adding volunteer:', error);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <div>
        <label htmlFor="name">Name:</label>
        <input
          type="text"
          id="name"
          name="name"
          value={formData.name}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="phone">Phone:</label>
        <input
          type="tel"
          id="phone"
          name="phone"
          value={formData.phone}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="email">Email:</label>
        <input
          type="email"
          id="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          required
        />
      </div>
      <div>
        <label htmlFor="location">Location:</label>
        <input
          type="text"
          id="location"
          name="location"
          value={formData.location}
          onChange={handleChange}
        />
      </div>
      <div>
        <label htmlFor="availability">Availability:</label>
        {availabilityOptions.map(option => (
          <div key={option}>
            <input
              type="checkbox"
              id={`availability-${option}`}
              name="availability"
              value={option}
              checked={formData.availability.includes(option)}
              onChange={handleCheckboxChange}
            />
            <label htmlFor={`availability-${option}`}>{option}</label>
          </div>
        ))}
      </div>
      <div>
        <label htmlFor="interests">Interests:</label>
        {interestOptions.map(option => (
          <div key={option}>
            <input
              type="checkbox"
              id={`interests-${option}`}
              name="interests"
              value={option}
              checked={formData.interests.includes(option)}
              onChange={handleCheckboxChange}
            />
            <label htmlFor={`interests-${option}`}>{option}</label>
          </div>
        ))}
      </div>
      <button type="submit">Register Volunteer</button>
    </form>
  );
};

export default VolunteerForm;
