const functions = require('firebase-functions');
const stripe = require('stripe')(functions.config().stripe.secret_key);

exports.createCheckoutSession = functions.https.onCall(async (data, context) => {
  // Check if the user is authenticated
  if (!context.auth) {
    throw new functions.https.HttpsError('unauthenticated', 'User must be authenticated.');
  }

  const priceId = data.priceId;

  try {
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: priceId,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: 'https://your-app-url.com/checkout-success?session_id={CHECKOUT_SESSION_ID}',
      cancel_url: 'https://your-app-url.com/checkout-cancel',
      metadata: {
        userId: context.auth.uid,
      },
    });
    return {
      id: session.id
    };
  } catch (error) {
    console.error('Error creating checkout session:', error);
    throw new functions.https.HttpsError('internal', 'Unable to create checkout session.', error);
  }
});