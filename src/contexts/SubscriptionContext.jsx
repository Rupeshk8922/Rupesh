import { createContext, useContext, useState, useEffect } from 'react';

const SubscriptionContext = createContext(null);

export const SubscriptionProvider = ({ children }) => {
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSubscription = async () => {
      try {
        // TODO: Replace this with your actual API call or Firebase query
        // Example:
        // const response = await fetch('/api/subscription');
        // const data = await response.json();
        // setSubscription(data.subscription);

        // Simulating async fetch with a timeout:
        await new Promise(res => setTimeout(res, 1000));
        setSubscription({ status: 'active', plan: 'Pro' }); // Example dummy data

      } catch (error) {
        console.error("Error fetching subscription:", error);
        setSubscription(null);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []);

  return (
    <SubscriptionContext.Provider value={{ subscription, loading }}>
      {children}
    </SubscriptionContext.Provider>
  );
};

export const useSubscription = () => {
  const context = useContext(SubscriptionContext);
  if (!context) {
    throw new Error('useSubscription must be used within a SubscriptionProvider');
  }
  return context;
};
