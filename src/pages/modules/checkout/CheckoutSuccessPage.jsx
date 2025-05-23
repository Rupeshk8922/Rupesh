import { useEffect, useState } from 'react';
import { useLocation, Link } from 'react-router-dom';

const CheckoutSuccessPage = () => {
  const location = useLocation();
  const [sessionId, setSessionId] = useState(null);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const id = params.get('session_id');
    if (id) {
      setSessionId(id);
      // You can fetch session details here if needed
    }
  }, [location]);

  return (
    <main className="container mx-auto mt-10 p-6 text-center">
      <h1 className="text-3xl font-semibold text-green-600 mb-4">Payment Successful!</h1>
      <p className="text-lg mb-6">Thank you for your subscription/donation!</p>

      {sessionId && (
        <p className="mb-6 text-gray-700">
          <strong>Session ID:</strong> {sessionId}
        </p>
      )}

      <Link
        to="/dashboard"
        className="inline-block bg-green-600 text-white px-6 py-3 rounded-md hover:bg-green-700"
      >
        Go to Dashboard
      </Link>
    </main>
  );
};

export default CheckoutSuccessPage;
