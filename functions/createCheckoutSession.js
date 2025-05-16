const Razorpay = require('razorpay'); // Make sure you have installed the razorpay package in your functions directory
const functions = require('firebase-functions');

const razorpay = new Razorpay({
  key_id: process.env.RAZORPAY_KEY_ID, // Ensure these are set in Firebase environment config
});
exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'The function must be called while authenticated.');
  }

  const { planId, donationAmount, currency = 'INR', receipt, notes } = data; // Include currency and optional receipt/notes

  if (!planId && !donationAmount) {
      throw new functions.https.HttpsError('invalid-argument', 'Either planId or donationAmount must be provided.');
  }
  
  try {
    // Placeholder for creating a Razorpay order
    // You will need to implement the logic here to create a Razorpay order
    // based on the planId or donationAmount.
    // This typically involves calling razorpay.orders.create()
    // and passing the amount, currency, and other relevant details.

    // Logic to create a Razorpay order
    const amountInPaise = (donationAmount || getPlanAmount(planId)) * 100; // Razorpay uses smallest unit (paise)

    const options = {
      amount: amountInPaise,
      currency: currency,
      receipt: receipt || `receipt_${Date.now()}_${context.auth.uid}`, // Use provided receipt or generate a unique one
      payment_capture: 1, // Auto capture payment
      notes: {
        firebaseUid: context.auth.uid,
        planId: planId || null,
        type: planId ? 'subscription' : 'donation',
        ...(notes || {}), // Include any additional notes from the frontend
      },
    }

    const order = await razorpay.orders.create(options);

    // Return the order details to the frontend
    return { orderId: order.id, amount: order.amount, currency: order.currency };

  } catch (error) {
    console.error('Error creating Razorpay order:', error);
    throw new functions.https.HttpsError('internal', 'Unable to create Razorpay order.', error); // Pass the full error object
  }
});

// Helper function to get plan amount (replace with your actual logic)
// This function should return the amount in the primary currency unit (e.g., INR, USD)
function getPlanAmount(planId) {
  // Implement logic to return the amount for a given planId
  // Example (replace with your actual plan logic):
  // if (planId === 'basic') return 100; // 100 INR or USD
  // if (planId === 'premium') return 500; // 500 INR or USD
  return 0; // Default or error handling
}