import React from "react";

const CheckoutCancelPage = () => {
  return (
    <div className="container mx-auto mt-10 p-6 text-center">
      <h1 role="alert" className="text-3xl font-bold text-red-600 mb-4">
        Payment Cancelled
      </h1>
      <p className="text-lg text-gray-700">
        Your payment was cancelled. If you have any questions, please contact support.
      </p>
      <a
        href="/subscription"
        className="mt-6 inline-block bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600"
      >
        Return to Subscription
      </a>
    </div>
  );
};

export default CheckoutCancelPage;
