function NoAccessPage() {
  return (
    <div className="p-6 max-w-md mx-auto text-center">
      <h1 className="text-3xl font-extrabold mb-4">Access Denied</h1>
      <p className="text-lg leading-relaxed">
        ❌ You don’t have permission to access this section. Contact your admin or renew your subscription.
      </p>
    </div>
  );
}

export default NoAccessPage;
