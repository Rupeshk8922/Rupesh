function VerifyEmailPage() {
  return (
    // Mobile Responsiveness: Use padding and center the content on larger screens.
    // p-4 provides padding on all sides. max-w-md and mx-auto center the container
    // and limit its width on medium and larger screens, allowing full width on small screens.
    <div className="p-4 max-w-md mx-auto text-center">
      {/* Mobile Responsiveness: Ensure heading text scales or wraps. */}{" "}
      {/* text-2xl mb-4 are good for mobile spacing and size */}{" "}
      <h2 className="text-2xl font-bold mb-4">Verify Your Email Address</h2>
      {/* Mobile Responsiveness: Ensure paragraph text is readable on small screens. */}{" "}
      <p>Thank you for signing up! Please check your email inbox (and spam folder) to verify your email address.</p>
      {/* Mobile Responsiveness: Ensure paragraph text is readable on small screens. */}{" "}
      <p>You will be redirected to the login page after verification.</p>
      {/* You might add a link to resend verification email later */}
    </div>
  );
}

export default VerifyEmailPage;