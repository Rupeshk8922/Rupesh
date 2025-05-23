import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/authContext.jsx';

function LocationTracker() {
  const { user, userRole } = useAuth();

  const [latitude, setLatitude] = useState(null);
  const [longitude, setLongitude] = useState(null);
  const [hasAccess, setHasAccess] = useState(false);

  // Check access based on userRole
  useEffect(() => {
    const allowedRoles = ['admin', 'Manager', 'CSR', 'Outreach Officer'];
    setHasAccess(allowedRoles.includes(userRole));
  }, [userRole]);

  // Get current location
  const getCurrentLocation = () => {
    if (!hasAccess) {
      console.warn('User does not have permission to access location.');
      return;
    }
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

  // Automatically get location on mount if authorized
  useEffect(() => {
    if (hasAccess) {
      getCurrentLocation();
    }
  }, [hasAccess]);

  // Send location to backend
  const sendLocationToFirestore = async () => {
    if (!user?.uid) {
      console.error('User ID is missing. Cannot send location.');
      return;
    }
    if (latitude === null || longitude === null) {
      console.error('Location data is incomplete.');
      return;
    }

    try {
      const response = await fetch(
        'https://us-central1-empact-yhwq3.cloudfunctions.net/sendLocationToFirestore',
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            userId: user.uid, // Use actual logged-in user ID
            latitude,
            longitude,
            type: 'location_update',
          }),
        }
      );

      if (response.ok) {
        const data = await response.json();
        console.log('Location sent successfully:', data);
      } else {
        const errorData = await response.json();
        console.error('Failed to send location:', errorData);
      }
    } catch (error) {
      console.error('Error sending location:', error);
    }
  };

  if (!hasAccess) {
    return <p className="text-red-600">You do not have permission to access location tracking.</p>;
  }

  return (
    <div>
      <p>Latitude: {latitude ?? 'Not available'}</p>
      <p>Longitude: {longitude ?? 'Not available'}</p>
      <button
        onClick={sendLocationToFirestore}
        disabled={latitude === null || longitude === null}
        className="bg-blue-600 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        Send Location
      </button>
    </div>
  );
}

export default LocationTracker;
