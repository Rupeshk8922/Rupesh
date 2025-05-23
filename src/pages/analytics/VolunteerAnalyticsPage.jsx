import { useMemo, useState } from 'react';
import { useVolunteers } from '../hooks/useVolunteers'; // Adjust path as needed
import { getVolunteerEventCount } from '../utils/volunteerAnalytics'; // Adjust path as needed

// Recharts components
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
} from 'recharts';

const VolunteerAnalyticsPage = () => {
  // TODO: Replace with actual company ID logic
  const companyId = 'your_company_id_here';

  const { volunteers, loading, error } = useVolunteers(companyId);
  const [selectedDateRange, setSelectedDateRange] = useState('allTime');

  const PIE_CHART_COLORS = ['#10B981', '#EF4444', '#F59E0B', '#6366F1'];

  const analyticsData = useMemo(() => {
    const now = new Date();

    // Placeholder for future date range filtering logic
    switch (selectedDateRange) {
      case 'thisMonth':
      case 'thisQuarter':
      case 'thisYear':
      case 'allTime':
      default:
        break;
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
        COLORS: PIE_CHART_COLORS,
      };
    }

    const totalVolunteers = volunteers.length;
    const activeVolunteersList = volunteers.filter((v) => v.status === 'Active');
    const activeVolunteers = activeVolunteersList.length;
    const inactiveVolunteers = totalVolunteers - activeVolunteers;

    const totalAssignedEvents = volunteers.reduce(
      (sum, v) => sum + (getVolunteerEventCount(v) || 0),
      0
    );
    const totalAssignedEventsToActive = activeVolunteersList.reduce(
      (sum, v) => sum + (getVolunteerEventCount(v) || 0),
      0
    );

    const averageEventsPerVolunteer =
      totalVolunteers > 0
        ? (totalAssignedEvents / totalVolunteers).toFixed(1)
        : 0;
    const averageEventsPerActiveVolunteer =
      activeVolunteers > 0
        ? (totalAssignedEventsToActive / activeVolunteers).toFixed(1)
        : 0;

    const volunteerStatusData = [
      { name: 'Active', value: activeVolunteers },
      { name: 'Inactive', value: inactiveVolunteers },
    ];

    // Placeholder for assigned events over time - currently uses totalAssignedEvents for current month only
    const assignedEventsByMonth = {};
    if (totalAssignedEvents > 0) {
      const currentMonthYear = `${now.getFullYear()}-${(
        now.getMonth() + 1
      )
        .toString()
        .padStart(2, '0')}`;
      assignedEventsByMonth[currentMonthYear] = totalAssignedEvents;
    }

    const eventsOverTimeData = Object.keys(assignedEventsByMonth)
      .map((key) => ({
        name: key,
        events: assignedEventsByMonth[key],
      }))
      .sort((a, b) => {
        const [yearA, monthA] = a.name.split('-').map(Number);
        const [yearB, monthB] = b.name.split('-').map(Number);
        return yearA !== yearB ? yearA - yearB : monthA - monthB;
      });

    const volunteersByLocation = {};
    volunteers.forEach((volunteer) => {
      const location = volunteer.location || 'Unknown';
      volunteersByLocation[location] = (volunteersByLocation[location] || 0) + 1;
    });

    const volunteersByLocationData = Object.keys(volunteersByLocation)
      .map((key) => ({
        location: key,
        count: volunteersByLocation[key],
      }))
      .sort((a, b) => b.count - a.count);

    return {
      volunteersByLocationData,
      volunteerStatusData,
      COLORS: PIE_CHART_COLORS,
      totalVolunteers,
      activeVolunteers,
      inactiveVolunteers,
      totalAssignedEvents,
      averageEventsPerVolunteer,
      averageEventsPerActiveVolunteer,
      eventsOverTimeData,
    };
  }, [volunteers, selectedDateRange]);

  if (!companyId) {
    return (
      <div className="p-6 text-center text-gray-600">
        Please log in to view volunteer analytics.
      </div>
    );
  }

  if (loading) {
    return (
      <div className="p-6 text-center text-gray-600">Loading analytics...</div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        Error loading volunteer data: {error.message}
      </div>
    );
  }

  if (analyticsData.totalVolunteers === 0) {
    return (
      <div className="p-6 text-center text-gray-600">
        No volunteer data available for analytics.
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      <h1 className="text-3xl font-bold text-gray-800 mb-6">
        Volunteer Analytics
      </h1>

      {/* Date Range Filter */}
      <div className="mb-6 flex flex-wrap items-center gap-4">
        <label
          htmlFor="dateRange"
          className="mr-3 text-gray-700 font-medium"
        >
          Filter by Date:
        </label>
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

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-6">
        <SummaryCard title="Total Volunteers" value={analyticsData.totalVolunteers} color="text-indigo-600" />
        <SummaryCard title="Active Volunteers" value={analyticsData.activeVolunteers} color="text-green-600" />
        <SummaryCard title="Inactive Volunteers" value={analyticsData.inactiveVolunteers} color="text-red-600" />
        <SummaryCard title="Total Assigned Events" value={analyticsData.totalAssignedEvents} color="text-purple-600" />
        <SummaryCard title="Average Events per Volunteer" value={analyticsData.averageEventsPerVolunteer} color="text-teal-600" />
        <SummaryCard title="Avg Events per Active Volunteer" value={analyticsData.averageEventsPerActiveVolunteer} color="text-blue-600" />
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-6">
        {/* Volunteer Status Distribution Pie Chart */}
        <ChartCard title="Volunteer Status Distribution">
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
                  <Cell
                    key={`cell-${index}`}
                    fill={analyticsData.COLORS[index % analyticsData.COLORS.length]}
                  />
                ))}
              </Pie>
              <Tooltip />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </ChartCard>

        {/* Assigned Events Over Time Line Chart */}
        <ChartCard title="Assigned Events Over Time">
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={analyticsData.eventsOverTimeData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line
                type="monotone"
                dataKey="events"
                stroke="#8884d8"
                activeDot={{ r: 8 }}
              />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-500 mt-2">
            <strong>NOTE:</strong> This data is a placeholder. For accurate trends, actual event dates are required.
          </p>
        </ChartCard>

        {/* Volunteers by Location Bar Chart */}
        <ChartCard title="Volunteers by Location">
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
            <strong>NOTE:</strong> Volunteers without a location are grouped under "Unknown".
          </p>
        </ChartCard>
      </div>
    </div>
  );
};

// Reusable summary card component for cleaner JSX
const SummaryCard = ({ title, value, color }) => (
  <div className="bg-white p-6 rounded-lg shadow-md flex flex-col justify-between">
    <h2 className="text-xl font-semibold text-gray-700 mb-4">{title}</h2>
    <p className={`text-4xl font-bold ${color}`}>{value}</p>
  </div>
);

// Reusable chart container card with title
const ChartCard = ({ title, children }) => (
  <div className="bg-white p-6 rounded-lg shadow-md">
    <h2 className="text-xl font-semibold mb-4">{title}</h2>
    {children}
  </div>
);

export default VolunteerAnalyticsPage;
