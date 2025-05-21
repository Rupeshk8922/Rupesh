const AccessDeniedPage = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 text-center">
      <div>
        <h1 className="text-3xl font-bold text-red-600">Access Denied</h1>
        <p className="mt-4 text-gray-600">You do not have permission to view this page.</p>
      </div>
    </div>
  );
};

export default AccessDeniedPage;