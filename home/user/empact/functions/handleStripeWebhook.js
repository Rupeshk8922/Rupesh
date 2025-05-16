const functions = require('firebase-functions');
const admin = require('firebase-admin');

admin.initializeApp();

// Removed unused variables: db, razorpay, orderId, amount, currency, paymentId.

exports.handleStripeWebhook = functions.https.onRequest(async (req, res) => {
  const stripe = require('stripe')(functions.config().stripe.secret_key);
  const endpointSecret = functions.config().stripe.webhook_secret;

  let event;
  try {
    const sig = req.headers['stripe-signature'];
    event = stripe.webhooks.constructEvent(req.rawBody, sig, endpointSecret);
  } catch (err) {
    console.error(`Webhook Error: ${err.message}`);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle the event
  switch (event.type) {
    case 'checkout.session.completed':
      const session = event.data.object;
      console.log('Checkout session completed:', session);
      // Handle successful checkout
      break;
    // ... handle other event types
    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.send();
});