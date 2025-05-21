// src/components/EventsTable.jsx
// TODO: Import Skeleton from "@/components/ui/skeleton";
// TODO: Import Card, CardContent from "@/components/ui/card";
// TODO: Import icons like AlertTriangle, Calendar, MapPin from "lucide-react";

const EventsTable = ({ events, loading, error }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {/* TODO: Replace with Skeleton component */}
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-20 w-full bg-gray-200 rounded-xl animate-pulse"></div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center text-red-600 mt-4 p-4 border border-red-200 bg-red-50 rounded-md">
        {/* TODO: Replace with AlertTriangle icon */}
        <span className="mr-2 text-xl">⚠️</span>
        <span>Error loading events. Please try again.</span>
      </div>
    );
  }

  if (!events || events.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-500 mt-4 p-4 border border-gray-200 bg-gray-50 rounded-md">
        {/* TODO: Replace with Calendar or Users icon */}
        <span className="mr-2 text-xl">📅</span>
        <span>No events found.</span>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        // TODO: Replace with Card component
        <div key={event.id} className="bg-white rounded-md shadow-sm overflow-hidden hover:shadow-md transition-shadow">
          {/* TODO: Replace with CardContent component */}
          <div className="p-4 space-y-2">
            <h2 className="text-lg font-semibold">{event.title}</h2>
            <p className="text-sm text-gray-600 flex items-center">
               {/* TODO: Replace with Calendar icon */}
              <span className="mr-1">🗓️</span>
              {new Date(event.date).toLocaleDateString()} {/* Basic date formatting */}
            </p>
             <p className="text-sm text-gray-600 flex items-center">
               {/* TODO: Replace with MapPin icon */}
              <span className="mr-1">📍</span>
               {event.location}
            </p>
            <span className={`inline-block px-2 py-1 text-xs rounded ${
                event.status === 'upcoming' ? 'bg-blue-100 text-blue-700' :
                event.status === 'completed' ? 'bg-green-100 text-green-700' :
                'bg-gray-100 text-gray-700' // Default or cancelled
            }`}>
              {event.status}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
};

export default EventsTable;