import React, { useMemo, useState, useEffect } from 'react';
import { useVolunteers } from '../hooks/useVolunteers'; // Adjust path as necessary
import { PieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, BarChart, Bar } from 'recharts';
import { getVolunteerEventCount } from '../utils/volunteerAnalytics'; // Adjust path as necessary
import { useAuth } from '../contexts/authContext';

const VolunteerAnalyticsPage = () => {
  const { user, loading: authLoading } = useAuth(); // Use useAuth hook

  // State for date range filter (basic for now)
  const [selectedDateRange, setSelectedDateRange] = useState('allTime');

  const analyticsData = useMemo(() => {
    if (!volunteers) {
      return {
        volunteerStatusData: [],
        totalVolunteers: 0,
        activeVolunteers: 0,
        inactiveVolunteers: 0,
        totalAssignedEvents: 0,
        averageEventsPerVolunteer: 0,
        averageEventsPerActiveVolunteer: 0,
        volunteersByLocationData: [], // Added for location chart
        COLORS: [], // Ensure COLORS is always returned
      };
    }

    // Basic date filtering logic (similar to EventAnalyticsPage)
    const now = new Date();
    let startDate = null;
    let endDate = null;

    switch (selectedDateRange) {
      case 'thisMonth':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        break;
      case 'thisQuarter':
        const currentMonth = now.getMonth();
        const quarter = Math.floor(currentMonth / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), quarter * 3 + 3, 0);
        break;
      case 'thisYear':
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
        break;
      case 'allTime':
      default:
        // No date filtering
        break;
    }

    const totalVolunteers = volunteers.length;
    const activeVolunteers = volunteers.filter(v => v.status === 'Active').length;
    const inactiveVolunteers = volunteers.filter(v => v.status === 'Inactive').length;

    const activeVolunteersList = volunteers.filter(v => v.status === 'Active');
    const totalAssignedEvents = volunteers.reduce((sum, v) => sum + getVolunteerEventCount(v), 0); // Total across all volunteers
    const totalAssignedEventsToActive = activeVolunteersList.reduce((sum, v) => sum + getVolunteerEventCount(v), 0);
    const averageEventsPerVolunteer = totalVolunteers > 0 ? (totalAssignedEvents / totalVolunteers).toFixed(1) : 0;
    const averageEventsPerActiveVolunteer = activeVolunteers > 0 ? (totalAssignedEventsToActive / activeVolunteers).toFixed(1) : 0;
    const volunteerStatusData = [
      { name: 'Active', value: activeVolunteers },
      { name: 'Inactive', value: inactiveVolunteers },
    ];

    // Define custom colors for the pie chart slices
    const COLORS = ['#10B981', '#EF4444']; // Green for Active, Red for Inactive

    // Data for Assigned Events Over Time Chart
    // This requires accessing the actual event dates for assigned events.
    // We need to pass event data or fetch it here for accurate time-series analysis.
    // For now, we'll create placeholder data or a simplified aggregation.
    // A better approach would be to fetch assigned event details or pass them down.

    const assignedEventsByMonth = {};

    // This part needs actual event data lookup or joining.
    // For demonstration, assuming `volunteer.assignedEvents` are just IDs,
    // and we don't have event date info here. So, the time series chart
    // will be based on hypothetical or static data until real event dates are integrated.
    // If volunteer.assignedEvents *did* contain event objects with a 'date' field,
    // this would be the logic:
    // volunteers.forEach(volunteer => {
    //   if (volunteer.assignedEvents && Array.isArray(volunteer.assignedEvents)) {
    //     volunteer.assignedEvents.forEach(assignedEvent => {
    //       const eventDate = new Date(assignedEvent.date); // Assuming assignedEvent has a 'date'
    //       if ((!startDate || eventDate >= startDate) && (!endDate || eventDate <= endDate)) {
    //         const monthYear = `${eventDate.getFullYear()}-${eventDate.getMonth() + 1}`;
    //         assignedEventsByMonth[monthYear] = (assignedEventsByMonth[monthYear] || 0) + 1;
    //       }
    //     });
    //   }
    // });

    // Placeholder: If you don't have event dates easily accessible in volunteer object,
    // this chart will effectively just show total assignments per volunteer, or need
    // to be populated by a separate data fetch.
    // For a functional placeholder, let's create some dummy data if `assignedEventsByMonth` is empty
    if (Object.keys(assignedEventsByMonth).length === 0 && totalAssignedEvents > 0) {
        // Create dummy data, perhaps for current month/year if no real dates
        const currentMonthYear = `${now.getFullYear()}-${now.getMonth() + 1}`;
        assignedEventsByMonth[currentMonthYear] = totalAssignedEvents;
    }


    // Convert aggregated data to array format for Recharts
    const eventsOverTimeData = Object.keys(assignedEventsByMonth).map(key => ({
      name: key, // e.g., "2023-10"
      events: assignedEventsByMonth[key]
    })).sort((a, b) => {
      // Sort by date correctly (e.g., "2023-10" vs "2024-1")
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
      volunteersByLocationData, // Return the new data
      volunteerStatusData,
      COLORS, // Add colors to the returned data
      totalVolunteers,
      activeVolunteers,
      inactiveVolunteers,
      totalAssignedEvents,
      averageEventsPerVolunteer,
      averageEventsPerActiveVolunteer,
      eventsOverTimeData, // Add chart data
    };
  }, [volunteers, selectedDateRange]); // Added selectedDateRange to dependencies
  const { volunteers, loading, error } = useVolunteers(companyId);
 const companyId = user?.companyId; // Access companyId from the authenticated user
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6"> {/* Added mb-6 for spacing */}
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
      </div> {/* This div now correctly closes the first grid container */}

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
                fill="#8884d8" // Default fill color, overridden by Cell colors
                dataKey="value"
                labelLine={false} // Hide label lines
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
              <XAxis dataKey="name" /> {/* e.g., Month-Year */}
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