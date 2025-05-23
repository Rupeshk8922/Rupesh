function VerifyEmailPage() {
  return (
    <div className="p-4 max-w-md mx-auto text-center">
      <h2 className="text-2xl font-bold mb-4">Verify Your Email Address</h2>
      <p className="mb-2">
        Thank you for signing up! Please check your email inbox (and spam folder) to verify your email address.
      </p>
      <p>
        You will be redirected to the login page after verification.
      </p>
      {/* TODO: Add a "Resend Verification Email" link or button here later */}
    </div>
  );
}

export default VerifyEmailPage;
