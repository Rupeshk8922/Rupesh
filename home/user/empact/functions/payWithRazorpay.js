const functions = require('firebase-functions');
const admin = require('firebase-admin');
const Razorpay = require('razorpay');

// Assuming admin is initialized elsewhere or will be initialized here if needed
// admin.initializeApp();

exports.payWithRazorpay = functions.https.onCall(async (data, context) => {
  try {
    // Removed unused db variable
    // Removed unused razorpay variable
    // Removed unused options variable

    const orderAmount = data.amount;
    const orderCurrency = data.currency;

    const instance = new Razorpay({
      key_id: process.env.RAZORPAY_KEY_ID, // Ensure these are set in your environment config
      key_secret: process.env.RAZORPAY_KEY_SECRET,
    });

    const order = await instance.orders.create({
      amount: orderAmount,
      currency: orderCurrency,
      receipt: `receipt_${Date.now()}`,
      payment_capture: 1
    });

    // Removed unused order variable
    // Removed unused orderId variable

    return {
      id: order.id,
      currency: order.currency,
      amount: order.amount,
    };

  } catch (error) {
    console.error("Error creating Razorpay order:", error);
    throw new functions.https.HttpsError('internal', 'Unable to create Razorpay order', error.message);
  }
});