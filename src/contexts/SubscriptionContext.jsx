import { createContext, useContext, useState, useEffect } from 'react';

const SubscriptionContext = createContext();

export const SubscriptionProvider = ({ children }) => {
  const [subscription] = useState(null);
  const [loading, setLoading] = useState(true);

  // You'll likely want to add logic here to fetch the user's subscription
  // status when the component mounts or when the user logs in.
  // This is a placeholder and needs to be implemented based on your backend.
  useEffect(() => {
    // Example: Fetch subscription data from your backend or Firebase
    const fetchSubscription = async () => {
      try {  
        // Replace with your actual fetching logic
        // const response = await fetch('/api/subscription');
        // const data = await response.json();
        // setSubscription(data.subscription);
      } catch (error) {
        console.error("Error fetching subscription:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubscription();
  }, []); // Add dependencies if fetching depends on user auth state

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