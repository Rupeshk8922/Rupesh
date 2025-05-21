import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContext.jsx';

function LocationTracker() {
  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const { userRole } = useAuth();

  useEffect(() => {
    if (userRole && ['admin', 'Manager', 'CSR', 'Outreach Officer'].includes(userRole)) {
      setHasAccess(true);
    } else {
      setHasAccess(false);
    }
  }, [userRole]);
  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLatitude(position.coords.latitude);
          setLongitude(position.coords.longitude);
        },
        (error) => {
          console.error('Error getting current location:', error);
        }
      );
    } else {
      console.error('Geolocation is not supported by this browser.');
    }
  };

  const sendLocationToFirestore = async () => {
    try {
      const response = await fetch('https://us-central1-empact-yhwq3.cloudfunctions.net/sendLocationToFirestore', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userId: 'user123', // Replace with actual user ID
          latitude,
          longitude,
          type: 'location_update',
        }),
      });

      if (response.ok) {
        const data = await response.json();
        console.log('Location sent successfully:', data);
      } else {
        console.error('Failed to send location:', await response.json());
      }
    } catch (error) {
      console.error('Error sending location:', error);
    }
  };

  useEffect(() => {
    getCurrentLocation();
  }, []);

  return (
    <div>
      <p>Latitude: {latitude}</p>
      <p>Longitude: {longitude}</p>
      <button onClick={sendLocationToFirestore}>Send Location</button>
    </div>
  );
}

export default LocationTracker;