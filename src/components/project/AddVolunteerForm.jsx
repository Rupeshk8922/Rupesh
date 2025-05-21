import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../firebase/config'; // Assuming firebase config is here


const AddVolunteerForm = ({ projectId, onClose }) => {
  const [volunteerData, setVolunteerData] = useState({
    name: '',
    contact: '',
    skills: '',
  });
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    setVolunteerData({ ...volunteerData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setIsPending(true);

    // Input validation (basic example)


    if (!volunteerData.name || !volunteerData.contact) {
      setError('Please fill out required fields.');
      setIsPending(false);
      return;
    }

    try {
      await addDoc(collection(db, 'projects', projectId, 'volunteers'), volunteerData);
      setVolunteerData({ name: '', contact: '', skills: '' });
      onClose();
    } catch (err) {
      console.error(err);
      setError('Failed to add volunteer. Please try again.');
    } finally {
      setIsPending(false);
    }
  };

  return (
    <form onSubmit={handleSubmit}>
      <h2>Add New Volunteer</h2>
      <label>
        <span>Name:</span>
        <input
          required
          type="text"
          name="name"
          onChange={handleChange}
          value={volunteerData.name}
        />
      </label>
      <label>
        <span>Contact:</span>
        <input
          required
          type="text"
          name="contact"
          onChange={handleChange}
          value={volunteerData.contact}
        />
      </label>
      <label>
        <span>Skills:</span>
        <input
          type="text"
          name="skills"
          onChange={handleChange}
          value={volunteerData.skills}
        />
      </label>

      {!isPending && <button>Add Volunteer</button>}
      {/* {isPending && <Spinner />} */}
      {error && <div className="error">{error}</div>}
    </form>
  );
};

export default AddVolunteerForm;