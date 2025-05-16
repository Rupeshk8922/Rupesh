import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/authContext'; // Assuming you might need user info here
import { useSubscription } from '../contexts/SubscriptionContext'; // Assuming this hook exists

const CheckoutSuccessPage = () => {
  const location = useLocation();
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('session_id');
    if (id) {
      setSessionId(id);
      // Here you could potentially fetch more details about the session
      // using the sessionId and a Cloud Function if needed.
    }    
  }, [location]);

  return (
    <div style={{ textAlign: 'center', padding: '50px' }}>
      <h2>Payment Successful!</h2>
      <p>Thank you for your subscription/donation!</p>
      {sessionId && (
        <p>Your session ID is: {sessionId}</p>
      )}
      {/* Add more details or a link to the user's dashboard here */}
    </div>
  );
};

export default CheckoutSuccessPage;