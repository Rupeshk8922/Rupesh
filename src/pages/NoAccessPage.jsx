function NoAccessPage() {
  return (
    // Mobile Responsiveness: Add padding and potentially center the content
    // using Tailwind CSS utilities like p-4, max-w-md, and mx-auto.
    // text-center can center the text content.
    <div className="p-4 text-center">
      {/* Mobile Responsiveness: Ensure heading text scales or wraps appropriately on mobile. */}
      <h1 className="text-2xl font-bold mb-4">Access Denied</h1>
      {/* Mobile Responsiveness: Ensure paragraph text is readable on small screens. */}
      <p className="text-base">
        ❌ You don’t have permission to access this section. Contact your admin or renew your subscription.
      </p>
    </div>
  );
}

export default NoAccessPage;