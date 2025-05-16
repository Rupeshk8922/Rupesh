import React, { useState, useEffect, useMemo } from 'react';
import { useEvents } from '../hooks/useEvents';
import {
  isPast,
  isFuture,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  startOfYear,
  endOfYear,
  isWithinInterval,
  parseISO,
} from 'date-fns';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
} from 'recharts';
import { useAuth } from '../contexts/authContext'; // Assuming this hook provides companyId

const EventAnalyticsPage = () => {
  const { events, loading, error } = useEvents();
  const { companyId } = useAuth();

  const [metrics, setMetrics] = useState({
    totalEvents: 0,
    upcomingEvents: 0,
    completedEvents: 0,
    canceledEvents: 0,
    averageVolunteerCapacity: 0,
    mostPopularEventType: 'N/A',
  });
  const [dateRange, setDateRange] = useState('thisMonth'); // Default to 'thisMonth' for better initial view
  const [eventStatusData, setEventStatusData] = useState([]);
  const [customStartDate, setCustomStartDate] = useState('');
  const [customEndDate, setCustomEndDate] = useState('');

  const [chartData, setChartData] = useState({ eventsOverTime: [], eventTypeBreakdown: [], eventsByLocation: [] });

  // Memoize filtered events to avoid re-calculating on every render
  const filteredEvents = useMemo(() => {
    if (!events || events.length === 0) return [];

    const now = new Date();
    return events.filter(event => {
      const eventDate = event.date && typeof event.date.toDate === 'function' ? new Date(event.date.toDate()) : null;
      if (!eventDate) return false;

      switch (dateRange) {
        case 'thisMonth':
          return eventDate >= startOfMonth(now) && eventDate <= endOfMonth(now);
        case 'thisQuarter':
          return eventDate >= startOfQuarter(now) && eventDate <= endOfQuarter(now);
        case 'thisYear':
          return eventDate >= startOfYear(now) && eventDate <= endOfYear(now);
        case 'custom':
          const start = customStartDate ? parseISO(customStartDate) : null;
          const end = customEndDate ? parseISO(customEndDate) : null;
          // Only filter if both start and end dates are provided for custom range
          if (start && end) {
            return isWithinInterval(eventDate, { start, end });
          }
          return true; // If custom range selected but dates not set, show all
        case 'allTime':
        default:
          return true;
      }
    });
  }, [events, dateRange, customStartDate, customEndDate]);

  useEffect(() => {
    if (!filteredEvents || filteredEvents.length === 0) {
      setMetrics({
        totalEvents: 0,
        upcomingEvents: 0,
        completedEvents: 0,
        canceledEvents: 0,
        averageVolunteerCapacity: 0,
        mostPopularEventType: 'N/A',
      });
      setChartData({ eventsOverTime: [], eventTypeBreakdown: [], eventsByLocation: [] });
      setEventStatusData([]);
      return;
    }

    const now = new Date();
    const upcomingEvents = filteredEvents.filter(
      event =>
        event.date &&
        typeof event.date.toDate === 'function' &&
        isFuture(new Date(event.date.toDate())) &&
        event.status !== 'Canceled' &&
        event.status !== 'Completed'
    );
    const completedEvents = filteredEvents.filter(
      event =>
        event.date &&
        typeof event.date.toDate === 'function' &&
        (isPast(new Date(event.date.toDate())) || event.status === 'Completed') &&
        event.status !== 'Canceled'
    );
    const canceledEvents = filteredEvents.filter(event => event.status === 'Canceled');

    let totalCapacity = 0;
    const eventTypeCounts = {};
    const eventLocationCounts = {};
    let filteredTotalEvents = filteredEvents.length;

    filteredEvents.forEach(event => {
      if (event.volunteerCapacity && typeof event.volunteerCapacity === 'number') {
        totalCapacity += event.volunteerCapacity;
      }

      if (event.type) {
        eventTypeCounts[event.type] = (eventTypeCounts[event.type] || 0) + 1;
      }

      if (event.location) {
        eventLocationCounts[event.location] = (eventLocationCounts[event.location] || 0) + 1;
      }
    });

    // Prepare data for "Events Over Time" chart
    const eventsOverTimeData = filteredEvents.reduce((acc, event) => {
      const eventDate = event.date ? new Date(event.date.toDate()) : null;
      if (!eventDate) return acc;

      let dateKey;
      if (dateRange === 'thisMonth' || dateRange === 'custom') {
        dateKey = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}-${String(eventDate.getDate()).padStart(2, '0')}`;
      } else {
        dateKey = `${eventDate.getFullYear()}-${String(eventDate.getMonth() + 1).padStart(2, '0')}`; // Year-Month for other ranges
      }

      if (!acc[dateKey]) {
        acc[dateKey] = {
          date: dateKey,
          upcoming: 0,
          completed: 0,
          canceled: 0,
          total: 0,
        };
      }

      if (isFuture(eventDate) && event.status !== 'Canceled' && event.status !== 'Completed') {
        acc[dateKey].upcoming++;
      } else if ((isPast(eventDate) || event.status === 'Completed') && event.status !== 'Canceled') {
        acc[dateKey].completed++;
      } else if (event.status === 'Canceled') {
        acc[dateKey].canceled++;
      }
      acc[dateKey].total++;

      return acc;
    }, {});

    const sortedEventsOverTime = Object.values(eventsOverTimeData).sort((a, b) => {
      return a.date.localeCompare(b.date);
    });

    const eventTypeBreakdownData = Object.keys(eventTypeCounts).map(type => ({ name: type, value: eventTypeCounts[type] }));
    const eventsByLocationData = Object.keys(eventLocationCounts).map(location => ({ name: location, count: eventLocationCounts[location] }));

    const averageVolunteerCapacity = filteredTotalEvents > 0 ? totalCapacity / filteredTotalEvents : 0;

    let mostPopularEventType = 'N/A';
    let maxCount = 0;
    for (const type in eventTypeCounts) {
      if (eventTypeCounts[type] > maxCount) {
        maxCount = eventTypeCounts[type];
        mostPopularEventType = type;
      }
    }

    setMetrics({
      totalEvents: filteredTotalEvents,
      upcomingEvents: upcomingEvents.length,
      completedEvents: completedEvents.length,
      canceledEvents: canceledEvents.length,
      averageVolunteerCapacity: averageVolunteerCapacity.toFixed(1),
      mostPopularEventType,
    });

    setChartData({
      eventsOverTime: sortedEventsOverTime,
      eventTypeBreakdown: eventTypeBreakdownData,
      eventsByLocation: eventsByLocationData,
    });

    const eventStatusDistributionData = [
      { name: 'Upcoming', value: upcomingEvents.length },
      { name: 'Completed', value: completedEvents.length },
      { name: 'Canceled', value: canceledEvents.length },
    ];
    setEventStatusData(eventStatusDistributionData);
  }, [filteredEvents, dateRange, customStartDate, customEndDate]); // Depend on filteredEvents

  if (!companyId) {
    return <div className="p-4 text-center text-gray-600">Please select a company.</div>;
  }

  if (loading) {
    return <div className="p-4 text-center text-gray-600">Loading Event Analytics...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error loading event data: {error.message}</div>;
  }

  // Define colors for Pie chart cells
  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A0']; // Example colors

  return (
    <div className="container mx-auto p-4 sm:p-6 min-h-screen">
      <div className="flex flex-col sm:flex-row justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-800">Event Analytics</h2>
        <select
          value={dateRange}
          onChange={e => setDateRange(e.target.value)}
          className="mt-4 sm:mt-0 p-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        >
          <option value="allTime">All Time</option>
          <option value="thisMonth">This Month</option>
          <option value="thisQuarter">This Quarter</option>
          <option value="thisYear">This Year</option>
          <option value="custom">Custom Range</option>
        </select>
      </div>

      {dateRange === 'custom' && (
        <div className="flex flex-col sm:flex-row items-center mb-6 space-y-4 sm:space-y-0 sm:space-x-4">
          <div>
            <label htmlFor="startDate" className="block text-sm font-medium text-gray-700">
              Start Date
            </label>
            <input
              type="date"
              id="startDate"
              value={customStartDate}
              onChange={e => setCustomStartDate(e.target.value)}
              className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
          <div>
            <label htmlFor="endDate" className="block text-sm font-medium text-gray-700">
              End Date
            </label>
            <input
              type="date"
              id="endDate"
              value={customEndDate}
              onChange={e => setCustomEndDate(e.target.value)}
              className="mt-1 block w-full p-2 border rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
            />
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Total Events Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-blue-100 text-blue-600 mr-4">📊</div>
            <div>
              <p className="text-gray-600 text-sm">Total Events</p>
              <p className="text-2xl font-semibold text-gray-800">{metrics.totalEvents}</p>
            </div>
          </div>
        </div>

        {/* Upcoming Events Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-green-100 text-green-600 mr-4">⬆️</div>
            <div>
              <p className="text-gray-600 text-sm">Upcoming Events</p>
              <p className="text-2xl font-semibold text-gray-800">{metrics.upcomingEvents}</p>
            </div>
          </div>
        </div>

        {/* Completed Events Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-purple-100 text-purple-600 mr-4">✅</div>
            <div>
              <p className="text-gray-600 text-sm">Completed Events</p>
              <p className="text-2xl font-semibold text-gray-800">{metrics.completedEvents}</p>
            </div>
          </div>
        </div>

        {/* Canceled Events Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-red-100 text-red-600 mr-4">❌</div>
            <div>
              <p className="text-gray-600 text-sm">Canceled Events</p>
              <p className="text-2xl font-semibold text-gray-800">{metrics.canceledEvents}</p>
            </div>
          </div>
        </div>

        {/* Average Volunteer Capacity Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-yellow-100 text-yellow-600 mr-4">👥</div>
            <div>
              <p className="text-gray-600 text-sm">Avg. Volunteer Capacity</p>
              <p className="text-2xl font-semibold text-gray-800">{metrics.averageVolunteerCapacity}</p>
            </div>
          </div>
        </div>

        {/* Most Popular Event Type Card */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center mb-4">
            <div className="p-3 rounded-full bg-teal-100 text-teal-600 mr-4">✨</div>
            <div>
              <p className="text-gray-600 text-sm">Most Popular Type</p>
              <p className="text-xl font-semibold text-gray-800 truncate">{metrics.mostPopularEventType}</p>
            </div>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="mt-8 grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {/* Events Over Time Chart */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 col-span-1">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Events Over Time ({dateRange})</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartData.eventsOverTime}>
              <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
              <XAxis dataKey="date" />
              <YAxis />
              <Tooltip formatter={(value, name) => [value, `${name} Events`]} />
              <Legend formatter={value => <span className="text-gray-700">{value} Events</span>} />
              <Line type="monotone" dataKey="upcoming" stroke="#4CAF50" name="Upcoming" />
              <Line type="monotone" dataKey="completed" stroke="#2196F3" name="Completed" />
              <Line type="monotone" dataKey="canceled" stroke="#F44336" name="Canceled" />
            </LineChart>
          </ResponsiveContainer>
          <p className="text-sm text-gray-500 mt-2 text-center">
            {dateRange === 'thisMonth' || dateRange === 'custom'
              ? 'Events by Day'
              : 'Events by Month'}
          </p>
        </div>

        {/* Event Type Breakdown Chart */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 col-span-1 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Event Type Breakdown</h3>
          {chartData.eventTypeBreakdown.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData.eventTypeBreakdown}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, percent }) => `${name} (${(percent * 100).toFixed(0)}%)`}
                  tooltipType="none"
                >
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-2 border border-gray-300 shadow-md">
                            {`${data.name}: ${data.value} (${(data.percent * 100).toFixed(0)}%)`}
                          </div>
                        );
                      }
                    }}
                  />
                  {chartData.eventTypeBreakdown.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600">No event type data available for this period.</p>
          )}
        </div>

        {/* Event Status Distribution Chart */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 col-span-1 flex flex-col items-center">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Event Status Distribution</h3>
          {eventStatusData.length > 0 && eventStatusData.some(data => data.value > 0) ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={eventStatusData}
                  cx="50%"
                  cy="50%"
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                  label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
                  tooltipType="none"
                >
                  <Tooltip
                    cursor={{ fill: 'transparent' }}
                    content={({ active, payload }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0].payload;
                        return (
                          <div className="bg-white p-2 border border-gray-300 shadow-md">
                            {`${data.name}: ${data.value} (${(data.percent * 100).toFixed(0)}%)`}
                          </div>
                        );
                      }
                    }}
                  />
                  <Cell key={`cell-upcoming`} fill="#4CAF50" />
                  <Cell key={`cell-completed`} fill="#2196F3" />
                  <Cell key={`cell-canceled`} fill="#F44336" />
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600">No event status data available for this period.</p>
          )}
        </div>

        {/* Events by Location Chart */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 col-span-1">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Events by Location</h3>
          {chartData.eventsByLocation.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.eventsByLocation}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip
                  cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border border-gray-300 shadow-md">{`${data.name}: ${data.count} events`}</div>
                      );
                    }
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600">No event location data available for this period.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventAnalyticsPage;