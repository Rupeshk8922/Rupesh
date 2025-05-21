import { useState } from 'react';
import { createEvent } from '../../firestore/collections/events';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth'; // Assuming useAuth is a hook

function AddEventForm() {
  const [title, setTitle] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [location, setLocation] = useState('');
  const [capacity, setCapacity] = useState('');
  const [description, setDescription] = useState('');
  const [tag, setTag] = useState('');

  const [titleErr, setTitleErr] = useState('');
  const [dateErr, setDateErr] = useState('');
  const [timeErr, setTimeErr] = useState('');
  const [locationErr, setLocationErr] = useState('');
  const [capacityErr, setCapacityErr] = useState('');
  const [tagErr, setTagErr] = useState('');


  const { user } = useAuth();
  const companyId = user?.companyId;
  const navigate = useNavigate();

  const handleAddEvent = async (e) => {
    e.preventDefault();

    setTitleErr('');
    setDateErr('');
    setTimeErr('');
    setLocationErr('');
    setCapacityErr('');
    setTagErr('');


    let valid = true;
    if (!title) {
      setTitleErr('Title is required');
      valid = false;
    }
    if (!date) {
      setDateErr('Date is required');
      valid = false;
    }
    if (!time) {
      setTimeErr('Time is required');
      valid = false;
    }
    if (!location) {
      setLocationErr('Location is required');
      valid = false;
    }
    if (!capacity) {
      setCapacityErr('Capacity is required');
      valid = false;
    }
    if (!tag) {
      setTagErr('Tag is required');
      valid = false;
    }

    if (valid && companyId) {
      const eventData = {
        title,
        date,
        time,
        location,
        capacity: parseInt(capacity, 10),
        description,
        tag,
        companyId,
        attendees: [],
      };

      try {
        await createEvent(companyId, eventData);
        // Clear form or navigate
        setTitle('');
        setDate('');
        setTime('');
        setLocation('');
        setCapacity('');
        setDescription('');
        setTag('');
        navigate('/events');
      } catch (error) {
        console.error("Error adding event: ", error);
        // Handle error (e.g., show an error message)
      }
    }
  };

  return (
    <form onSubmit={handleAddEvent} className="max-w-lg mx-auto p-4 bg-white shadow-md rounded-lg">
      <h2 className="text-2xl font-bold mb-4">Add New Event</h2>
      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="title">
          Title
        </label>
        <input
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${titleErr && 'border-red-500'}`}
          id="title"
          type="text"
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
        {titleErr && <p className="text-red-500 text-xs italic">{titleErr}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="date">
          Date
        </label>
        <input
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${dateErr && 'border-red-500'}`}
          id="date"
          type="date"
          value={date}
          onChange={(e) => setDate(e.target.value)}
        />
        {dateErr && <p className="text-red-500 text-xs italic">{dateErr}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="time">
          Time
        </label>
        <input
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${timeErr && 'border-red-500'}`}
          id="time"
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
        />
        {timeErr && <p className="text-red-500 text-xs italic">{timeErr}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="location">
          Location
        </label>
        <input
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${locationErr && 'border-red-500'}`}
          id="location"
          type="text"
          value={location}
          onChange={(e) => setLocation(e.target.value)}
        />
        {locationErr && <p className="text-red-500 text-xs italic">{locationErr}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="capacity">
          Capacity
        </label>
        <input
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${capacityErr && 'border-red-500'}`}
          id="capacity"
          type="number"
          value={capacity}
          onChange={(e) => setCapacity(e.target.value)}
        />
        {capacityErr && <p className="text-red-500 text-xs italic">{capacityErr}</p>}
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
          Description
        </label>
        <textarea
          className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
          id="description"
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />
      </div>

      <div className="mb-4">
        <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="tag">
          Tag
        </label>
        <input
          className={`shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline ${tagErr && 'border-red-500'}`}
          id="tag"
          type="text"
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        />
        {tagErr && <p className="text-red-500 text-xs italic">{tagErr}</p>}
      </div>

      <div className="flex items-center justify-between">
        <button
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline"
          type="submit"
        >
          Add Event
        </button>
      </div>
    </form>
  );
}

export default AddEventForm;