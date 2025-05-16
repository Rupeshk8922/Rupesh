const functions = require('firebase-functions');
const admin = require('firebase-admin');
admin.initializeApp();

exports.handleRazorpayWebhook = functions.https.onRequest(async (req, res) => {
  // Verify the request came from Razorpay
  // Razorpay signature verification logic goes here
  // This typically involves calculating a hash of the request body
  // using the webhook secret and comparing it to the signature in the header.

  let event;

  try {
    // Parse the incoming request body as JSON
    event = req.body;
    // Implement Razorpay signature verification here
    // Example (you'll need to implement the actual verification logic):
    // const crypto = require('crypto');
    // const generatedSignature = crypto.createHmac('sha256', endpointSecret).update(JSON.stringify(req.body)).digest('hex');
    // if (generatedSignature !== sig) {
    //   throw new Error('Webhook signature verification failed');
    // }
  } catch (err) {
    console.error("Error parsing or verifying webhook:", err.message);
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  // Handle different event types from Razorpay
  // Refer to Razorpay webhook documentation for event types
  switch (event.event) {
    case "payment.captured":
    {
      // Extract relevant data from the Razorpay payment object
      const payment = event.payload.payment.entity;
      console.log("Payment captured:", payment);      

      // You'll likely need to link the Razorpay order ID back to your user or subscription
      // This might involve storing the Razorpay order ID in your Firestore when creating the order
      // or including custom fields in the order creation.

      // Example: Assuming you stored the userId in the order metadata when creating the order
      // const orderDetails = await razorpay.orders.fetch(orderId);
      // const userId = orderDetails.notes?.userId;

      // If you have a way to get the userId from the webhook data or by fetching order details:
      // if (userId) {
      //   try {
      //     const userRef = db.collection('users').doc(userId);
      //     await userRef.update({
      //       lastPaymentId: paymentId,
      //       lastPaymentAmount: amount,
      //       lastPaymentCurrency: currency,
      //       lastPaymentDate: admin.firestore.FieldValue.serverTimestamp(),
      //       // Update subscription status or donation info based on your logic
      //     });
      //     console.log(`Firestore updated with payment info for user ${userId}`);
      //   } catch (error) {
      //     console.error("Firestore update failed:", error.message);
      //     return res.status(500).send("Firestore update failed");
      //   }
      // } else {
      //   console.warn('Payment captured but unable to link to a user.');
      //   // Handle cases where userId is not available
      // }
      break;
    }

    // Add more case blocks for other relevant Razorpay event types (e.g., subscription.created, subscription.cancelled)

    default:
      // Unexpected event type
      console.log(`Unhandled Razorpay event type: ${event.event}`);
  }

  // Return a 200 response to acknowledge receipt of the event
  res.status(200).send("Received Razorpay event");
});