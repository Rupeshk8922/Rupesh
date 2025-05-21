import { useState } from 'react';
import { addDoc, collection } from 'firebase/firestore';
import { db } from '../../../firebase/config';



export default function AddProjectModal() {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [budget, setBudget] = useState('');
  const [deadline, setDeadline] = useState('');
  const [isPending, setIsPending] = useState(false);
  const [error, setError] = useState(null);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsPending(true);
    setError(null);

    try {
      await addDoc(collection(db, 'projects'), {
        title,
        description,
        budget: parseFloat(budget),
        deadline: new Date(deadline),
        completed: false,
        createdAt: new Date(),
      });
      setTitle('');
      setDescription('');
      setBudget('');
      setDeadline('');
      setIsPending(false);
      alert('Project added successfully!');
    } catch (err) {
      setError(err.message);
      setIsPending(false);
    }
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Add New Project</h2>
        <form onSubmit={handleSubmit}>
          <label>
            <span>Project Title:</span>
            <input
              type="text"
              required
              onChange={(e) => setTitle(e.target.value)}
              value={title}
            />
          </label>
          <label>
            <span>Project Description:</span>
            <textarea
              required
              onChange={(e) => setDescription(e.target.value)}
              value={description}
            ></textarea>
          </label>
          <label>
            <span>Budget:</span>
            <input
              type="number"
              required
              onChange={(e) => setBudget(e.target.value)}
              value={budget}
            />
          </label>
          <label>
            <span>Deadline:</span>
            <input
              type="date"
              required
              onChange={(e) => setDeadline(e.target.value)}
              value={deadline}
            />
          </label>
          {!isPending && <button className="btn">Add Project</button>}
          {isPending && <button className="btn" disabled>Adding Project...</button>}
          {error && <p className="error">{error}</p>}
        </form>
      </div>
    </div>
  );
}