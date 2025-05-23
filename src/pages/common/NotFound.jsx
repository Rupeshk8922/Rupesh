const NotFound = () => (
  <div className="h-screen flex flex-col items-center justify-center text-center p-6">
    <h1 className="text-4xl font-bold">404 - Not Found</h1>
    <p className="mt-2 text-gray-500 max-w-xs">
      The page or lead you are looking for does not exist.
    </p>
    <a
      href="/"
      className="mt-6 inline-block px-6 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition"
    >
      Go to Home
    </a>
  </div>
);

export default NotFound;
