import { useState } from 'react';
// import { addVolunteer } from '../firebase/firestore'; // <-- Uncomment when ready
//
function SignupVolunteerPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    availability: [],
    interests: '',
    preferredLocation: '',
  });

  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  const validateForm = () => {
    const newErrors = {};
    if (!formData.fullName.trim()) newErrors.fullName = 'Full Name is required';
    if (!formData.email.trim()) newErrors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(formData.email)) newErrors.email = 'Invalid email format';
    if (formData.phone.trim() && !/^\d{10,}$/.test(formData.phone)) newErrors.phone = 'Invalid phone number format';
    if (formData.availability.length === 0) newErrors.availability = 'Please select your availability';
    if (!formData.interests) newErrors.interests = 'Please select an interest area';
    if (!formData.preferredLocation.trim()) newErrors.preferredLocation = 'Preferred Location is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (type === 'checkbox') {
      setFormData((prev) => ({
        ...prev,
        [name]: checked
          ? [...prev[name], value]
          : prev[name].filter((item) => item !== value),
      }));
    } else {
      setFormData((prev) => ({ ...prev, [name]: value }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;
    setErrors((prev) => ({
      ...prev,
      [name]: name === 'email'
        ? !value.trim()
          ? 'Email is required'
          : !/\S+@\S+\.\S+/.test(value)
          ? 'Invalid email format'
          : ''
        : name === 'phone'
        ? value.trim() && !/^\d{10,}$/.test(value)
          ? 'Invalid phone number format'
          : ''
        : !value.trim()
        ? `${name === 'preferredLocation' ? 'Preferred Location' : 'Full Name'} is required`
        : '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmissionError(null);
    setSuccessMessage(null);

    if (!validateForm()) {
      setSubmissionError('Please fix the errors above.');
      return;
    }

    setLoading(true);
    try {
      // await addVolunteer(formData); // <-- Uncomment when Firestore is integrated
      console.log('Submitted volunteer:', formData);

      setSuccessMessage('Thank you for signing up! Your application will be reviewed.');
      setFormData({
        fullName: '',
        email: '',
        phone: '',
        availability: [],
        interests: '',
        preferredLocation: '',
      });
      setErrors({});
    } catch {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold mb-6 text-center">Volunteer Sign Up</h2>

      {successMessage && (
        <p className="text-green-600 text-center mb-4">{successMessage}</p>
      )}
      {submissionError && (
        <p className="text-red-600 text-center mb-4">{submissionError}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-4" noValidate>
        {/* Full Name */}
        <FormField
          label="Full Name"
          id="fullName"
          value={formData.fullName}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.fullName}
        />

        {/* Email */}
        <FormField
          label="Email"
          id="email"
          type="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.email}
        />

        {/* Phone */}
        <FormField
          label="Phone Number (Optional)"
          id="phone"
          value={formData.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.phone}
        />

        {/* Availability */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Availability</label>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Weekends', 'Evenings'].map((day) => (
              <label key={day} className="flex items-center text-sm text-gray-900">
                <input
                  type="checkbox"
                  name="availability"
                  value={day}
                  checked={formData.availability.includes(day)}
                  onChange={handleChange}
                  className="mr-2 h-4 w-4 text-blue-600 border-gray-300 rounded"
                />
                {day}
              </label>
            ))}
          </div>
          {errors.availability && <p className="text-sm text-red-600 mt-1">{errors.availability}</p>}
        </div>

        {/* Interests */}
        <div>
          <label htmlFor="interests" className="block text-sm font-medium text-gray-700">
            Interests
          </label>
          <select
            id="interests"
            name="interests"
            value={formData.interests}
            onChange={handleChange}
            onBlur={() =>
              setErrors((prev) => ({
                ...prev,
                interests: !formData.interests ? 'Please select an interest area' : '',
              }))
            }
            className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
              errors.interests
                ? 'border-red-600 focus:ring-red-500 focus:border-red-500'
                : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
            }`}
          >
            <option value="">Select an Interest Area</option>
            <option value="Education">Education</option>
            <option value="Health">Health</option>
            <option value="Environment">Environment</option>
            <option value="Community Support">Community Support</option>
          </select>
          {errors.interests && <p className="text-sm text-red-600 mt-1">{errors.interests}</p>}
        </div>

        {/* Preferred Location */}
        <FormField
          label="Preferred Location/City"
          id="preferredLocation"
          value={formData.preferredLocation}
          onChange={handleChange}
          onBlur={handleBlur}
          error={errors.preferredLocation}
        />

        {/* Submit */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-medium py-2 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Submitting...' : 'Submit'}
        </button>
      </form>
    </div>
  );
}

function FormField({ label, id, type = 'text', value, onChange, onBlur, error }) {
  return (
    <div>
      <label htmlFor={id} className="block text-sm font-medium text-gray-700">
        {label}
      </label>
      <input
        type={type}
        id={id}
        name={id}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        className={`mt-1 block w-full px-3 py-2 border rounded-md shadow-sm sm:text-sm ${
          error
            ? 'border-red-600 focus:ring-red-500 focus:border-red-500'
            : 'border-gray-300 focus:ring-blue-500 focus:border-blue-500'
        }`}
      />
      {error && <p className="text-sm text-red-600 mt-1">{error}</p>}
    </div>
  );
}

export default SignupVolunteerPage;
