const Navigation = () => {

  return (
    <nav className="bg-gray-800 text-white p-4">
      <ul className="flex space-x-4">
        <li>
          <a href="/" className="hover:text-gray-300">Home</a>
        </li>
        <li>
          <a href="/events" className="hover:text-gray-300">Events</a>
        </li>
        <li>
          <a href="/volunteers" className="hover:text-gray-300">Volunteers</a>
        </li>
        <li>
          <a href="/leads" className="hover:text-gray-300">Leads</a>
        </li>
        {/* Add more navigation links as needed */}
      </ul>
      {/* In a real app, you would fetch the user's role after authentication
          and use that value for currentUserRole instead of the hardcoded value. */}
      {/* <p className="text-sm mt-2">Current Role: {currentUserRole}</p> */}
    </nav>
  );
};

export default Navigation;