import React, { useState, useEffect } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';

// ⬆️ TOP OF THE FILE
import { loadStripe } from '@stripe/stripe-js'
import { httpsCallable } from 'firebase/functions'; // Corrected import for functions
const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);
function SubscriptionPage() {
  const { subscription, loading, error, createCheckoutSession } = useSubscription();
  const [isLoadingCheckout, setIsLoadingCheckout] = useState(false);

  // You might want to fetch subscription details when the component mounts
  // useEffect(() => { fetchSubscription(); }, []); // Assuming fetchSubscription is in context

  const handleCheckout = (planId) => {
    // TODO: Implement payment integration logic for a specific plan
    console.log('Initiating checkout for plan: ' + planId);
  };

  // Placeholder data for plan comparison and pricing
  // In a real application, you would fetch these plans from your backend or Stripe
  const plans = [
    { id: 'free', name: 'Free', features: ['Basic summary reports', '1 Admin User', 'View-only data (max 100 records)', 'Community support'], price: 'Free' },
    { id: 'standard', name: 'Standard', features: ['Detailed reports', 'Unlimited Users', 'Full data access', 'Priority support', 'Create Events/Tasks', 'AI Assistant (Limited)'], price: '$49/month' },
    { id: 'pro', name: 'Pro', features: ['All Standard features', 'Unlimited Users', 'Scalable record storage', 'Dedicated support', 'Maps & Live Tracking', 'Full AI Assistant'], price: '$99/month' },
  ];

  const handleBuyPlan = async (planId, priceInCents) => {
    setIsLoadingCheckout(true);
    try {
      const stripe = await stripePromise;
      if (!stripe) {
        console.error('Stripe.js failed to load.');
        return;
      }

      // 🔥 Call Firebase Cloud Function
      const createCheckoutSession = httpsCallable(functions, 'createCheckoutSession');
      const { data } = await createCheckoutSession({
        planId,
        amount: priceInCents,
        // Optional: include userId or other metadata if needed
      });

      if (!data || !data.sessionId) {
        throw new Error('No sessionId returned from backend');
      }
      // 🚀 Redirect to Stripe Checkout
      const { error } = await stripe.redirectToCheckout({ sessionId: data.sessionId });
      // Redirect to Stripe checkout is handled within createCheckoutSession
    } catch (err) {
      console.error("Checkout failed:", err);
    } finally { setIsLoadingCheckout(false); }
  };

  const features = [
    { name: 'Add Users', free: '❌ (Admin only)', paid: '✅ Unlimited' },
    { name: 'View Reports', free: '✅ Basic summary', paid: '✅ Detailed reports/export' },
    { name: 'Edit/Add Data', free: '❌ View-only', paid: '✅ Full access' },
    { name: 'Create Events/Tasks', free: '❌', paid: '✅' },
    // Add more features based on your plan
  ];

  return (
    <div>
      <h2>Manage Subscription</h2>

      <div>
        <h3>Current Plan</h3>
        {loading && <p>Loading subscription details...</p>}
        {error && <p style={{ color: 'red' }}>Error loading subscription: {error.message}</p>}
        {!loading && !error && (
          <>
            {subscription ? (
              <>
                <p>Plan: {subscription.plan}</p>
                <p>Status: {subscription.status}</p>
                <p>Expires: {subscription.expiryDate}</p>
              </>
            ) : (<p>No subscription details found.</p>)}
          </>
        )}
      </div>

      {/* Available Plans */}
      <section style={{ marginTop: '2rem' }}>
        <h3>Available Plans</h3>
        <div style={{ display: 'flex', justifyContent: 'space-around' }}>
          {plans.map(plan => (
            <div key={plan.id} style={{ border: '1px solid #ccc', padding: '1rem', width: '30%' }}>
              <h4>{plan.name}</h4>
              <p><strong>Price:</strong> {plan.price}</p>
              <h5>Features:</h5>
              <ul>
                {plan.features.map((feature, index) => (
                  <li key={index}>{feature}</li>
                ))}
              </ul>
              {plan.id !== 'free' && (subscription?.status !== 'active' || subscription?.plan !== plan.id) && ( // Only show "Buy" if not on the same plan
                <button
                  onClick={() => handleBuyPlan(plan.id, plan.priceInCents)} // Assuming plan object has priceInCents
                  disabled={isLoadingCheckout}>
                  {isLoadingCheckout ? 'Processing...' : `Buy ${plan.name}`}
                </button>
              )}
            </div>
          ))}
        </div>
      </section>

      {/* Features Grid */}
      <section style={{ marginTop: '2rem' }}>
        <h3>Feature Comparison</h3>
        <table border="1" cellPadding="8" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr>
              <th>Feature</th>
              <th>Free Version</th>
              <th>Paid Version</th>
            </tr>
          </thead>
          <tbody>
            {features.map((feature, index) => (
              <tr key={index}>
                <td>{feature.name}</td>
                <td>{feature.free}</td>
                <td>{feature.paid}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <div>
        <h3>Payment History</h3>
        <p>Payment history will be displayed here.</p>
        {/* TODO: Fetch and display actual payment history */}
      </div>
    </div>
  );
}

export default SubscriptionPage;