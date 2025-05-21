import { useMemo, useState } from 'react';
import { useVolunteers } from '../hooks/useVolunteers'; // Adjust path as necessary
import { getVolunteerEventCount } from '../utils/volunteerAnalytics'; // Adjust path as necessary

// Import Recharts components
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip, Legend, LineChart, Line, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

const VolunteerAnalyticsPage = () => {
  const companyId = 'your_company_id_here'; // Replace with actual company ID logic
  const { volunteers, loading, error } = useVolunteers(companyId);

  // State for date range filter
  const [selectedDateRange, setSelectedDateRange] = useState('allTime');

  // Placeholder for COLORS - moved inside useMemo for local scope or define globally if static
  const PIE_CHART_COLORS = ['#10B981', '#EF4444', '#F59E0B', '#6366F1']; // More colors for potential future use

  const analyticsData = useMemo(() => {
    const now = new Date();

    switch (selectedDateRange) {
 case 'thisMonth': {
 break;
 }
 case 'thisQuarter': {
 break;
 }
 case 'thisYear': {
 break;
 }
 case 'allTime':
 default: {
        // No date filtering, startDate and endDate remain null
        break;
 }
 // No actual filtering logic based on dates is implemented yet
    }

    if (!volunteers) {
      return {
        volunteerStatusData: [],
        totalVolunteers: 0,
        activeVolunteers: 0,
        inactiveVolunteers: 0,
        totalAssignedEvents: 0,
        averageEventsPerVolunteer: 0,
        averageEventsPerActiveVolunteer: 0,
        volunteersByLocationData: [],
        eventsOverTimeData: [],
        COLORS: PIE_CHART_COLORS, // Use the defined colors
      };
    }

    const totalVolunteers = volunteers.length;
    const activeVolunteersList = volunteers.filter(v => v.status === 'Active');
    const activeVolunteers = activeVolunteersList.length;
    const inactiveVolunteers = totalVolunteers - activeVolunteers; // Calculate inactive volunteers

    // Ensure getVolunteerEventCount handles cases where assignedEvents might not exist or be empty
    const totalAssignedEvents = volunteers.reduce((sum, v) => sum + (getVolunteerEventCount(v) || 0), 0);
    const totalAssignedEventsToActive = activeVolunteersList.reduce((sum, v) => sum + (getVolunteerEventCount(v) || 0), 0);

    const averageEventsPerVolunteer = totalVolunteers > 0 ? (totalAssignedEvents / totalVolunteers).toFixed(1) : 0;
    const averageEventsPerActiveVolunteer = activeVolunteers > 0 ? (totalAssignedEventsToActive / activeVolunteers).toFixed(1) : 0;

    const volunteerStatusData = [
      { name: 'Active', value: activeVolunteers },
      { name: 'Inactive', value: inactiveVolunteers },
    ];

    // Data for Assigned Events Over Time Chart
    const assignedEventsByMonth = {};
    // This part assumes `getVolunteerEventCount` could be extended to return event dates,
    // or you would fetch actual event data here based on assigned event IDs.
    // For a more realistic example, you would need to iterate through actual event objects
    // associated with volunteers and check their dates.
    // As per your comment, this is a placeholder.
    if (totalAssignedEvents > 0) {
      const currentMonthYear = `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
      assignedEventsByMonth[currentMonthYear] = totalAssignedEvents;
    }

    const eventsOverTimeData = Object.keys(assignedEventsByMonth).map(key => ({
      name: key, // e.g., "2023-10"
      events: assignedEventsByMonth[key]
    })).sort((a, b) => {
      const [yearA, monthA] = a.name.split('-').map(Number);
      const [yearB, monthB] = b.name.split('-').map(Number);
      if (yearA !== yearB) return yearA - yearB;
      return monthA - monthB;
    });

    // Data for Volunteers by Location Chart
    const volunteersByLocation = {};
    volunteers.forEach(volunteer => {
      const location = volunteer.location || 'Unknown'; // Handle volunteers without a location
      volunteersByLocation[location] = (volunteersByLocation[location] || 0) + 1;
    });

    const volunteersByLocationData = Object.keys(volunteersByLocation).map(key => ({
      location: key,
      count: volunteersByLocation[key]
    })).sort((a, b) => b.count - a.count); // Sort by count descending

    return {
      volunteersByLocationData,
      volunteerStatusData,
      COLORS: PIE_CHART_COLORS, // Use the defined colors
      totalVolunteers,
      activeVolunteers,
      inactiveVolunteers,
      totalAssignedEvents,
      averageEventsPerVolunteer,
      averageEventsPerActiveVolunteer,
      eventsOverTimeData,
    };
  }, [volunteers, selectedDateRange]); // Added selectedDateRange to dependencies

  // Ensure companyId is available before attempting to fetch volunteers
  if (!companyId) {
    return <div className="p-6 text-center text-gray-600">Please log in to view volunteer analytics.</div>;
  }

  if (loading) {
    return <div className="p-6 text-center text-gray-600">Loading analytics...</div>;
  }

  if (error) {
    return <div className="p-6 text-center text-red-600">Error loading volunteer data: {error.message}</div>;
  }

  // Changed this condition: if totalVolunteers is 0, it means no data to display.
  // The error message for `error` is handled above.
  if (analyticsData.totalVolunteers === 0) {
    return <div className="p-6 text-center text-gray-600">No volunteer data available for analytics.</div>;
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">Volunteer Analytics</h1>

      {/* Date Range Filter */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <label htmlFor="dateRange" className="mr-3 text-gray-700 font-medium">Filter by Date:</label>
        <select
          id="dateRange"
          value={selectedDateRange}
          onChange={(e) => setSelectedDateRange(e.target.value)}
          className="form-select block w-full sm:w-auto rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-200 focus:ring-opacity-50 px-3 py-2"
        >
          <option value="allTime">All Time</option>
          <option value="thisMonth">This Month</option>
          <option value="thisQuarter">This Quarter</option>
          <option value="thisYear">This Year</option>
        </select>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
          <div className="flex items-center mb-4">
            {/* Placeholder for icon, e.g., <UserGroupIcon className="h-6 w-6 text-gray-500 mr-2" /> */}
            <h2 className="text-xl font-semibold text-gray-700">Total Volunteers</h2>
          </div>
          <p className="text-4xl font-bold text-indigo-600">{analyticsData.totalVolunteers}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
          <div className="flex items-center mb-4">
            {/* Placeholder for icon, e.g., <CheckCircleIcon className="h-6 w-6 text-green-500 mr-2" /> */}
            <h2 className="text-xl font-semibold text-gray-700">Active Volunteers</h2>
          </div>
          <p className="text-4xl font-bold text-green-600">{analyticsData.activeVolunteers}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
          <div className="flex items-center mb-4">
            {/* Placeholder for icon, e.g., <XCircleIcon className="h-6 w-6 text-red-500 mr-2" /> */}
            <h2 className="text-xl font-semibold text-gray-700">Inactive Volunteers</h2>
          </div>
          <p className="text-4xl font-bold text-red-600">{analyticsData.inactiveVolunteers}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
          <div className="flex items-center mb-4">
            {/* Placeholder for icon, e.g., <CalendarIcon className="h-6 w-6 text-purple-500 mr-2" /> */}
            <h2 className="text-xl font-semibold text-gray-700">Total Assigned Events</h2>
          </div>
          <p className="text-4xl font-bold text-purple-600">{analyticsData.totalAssignedEvents}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Average Events per Volunteer</h2>
          <p className="text-4xl font-bold text-teal-600">{analyticsData.averageEventsPerVolunteer}</p>
        </div>

        <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Avg Events per Active Volunteer</h2>
          <p className="text-4xl font-bold text-blue-600">{analyticsData.averageEventsPerActiveVolunteer}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Volunteer Status Distribution</h2>
          <ResponsiveContainer width="100%" height={300}>
            <PieChart>
              <Pie
                data={analyticsData.volunteerStatusData}
                cx="50%"
                cy="50%"
                outerRadius={100}
                fill="#8884d8"
                dataKey="value"
                labelLine={false}
              >
                {analyticsData.volunteerStatusData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={analyticsData.COLORS[index % analyticsData.COLORS.length]} />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </div>

        {/* Assigned Events Over Time Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Assigned Events Over Time</h2>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.eventsOverTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="events" stroke="#8884d8" activeDot={{ r: 8 }} />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-500 mt-2">
            <span className="font-semibold">NOTE:</span> The data for this chart is currently a placeholder. For accurate trends, it requires access to actual event dates, which are not directly available in the `volunteer` object. You would need to fetch or pass event details here.
          </p>
        </div>

        {/* Volunteers by Location Chart */}
        <div className="bg-white p-6 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold text-gray-700 mb-4">Volunteers by Location</h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={analyticsData.volunteersByLocationData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="location" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="count" fill="#82ca9d" />
            </BarChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-500 mt-2">
            <span className="font-semibold">NOTE:</span> This chart aggregates volunteers by their 'location' field. Volunteers without a specified location will be grouped under 'Unknown'.
          </p>
        </div>
      </div>
    </div>
  );
};

export default VolunteerAnalyticsPage;