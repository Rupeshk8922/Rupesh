import React, { useState, useEffect, useMemo } from 'react';
import { useEvents } from '../hooks/useEvents.jsx';
import {
  isPast,
  isFuture,
  startOfYear,
  endOfYear,
  isWithinInterval,
  parseISO,
  startOfMonth,
  endOfMonth,
  startOfQuarter,
  endOfQuarter,
  format,
} from 'date-fns';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  LineChart,
  CartesianGrid,
  XAxis,
  YAxis,
  Line,
  BarChart,
  Bar,
} from 'recharts';
import { useAuth } from '../contexts/authContext'; // Assuming this hook provides companyId

const EventAnalyticsPage = () => {
  const { events, loading, error } = useEvents();
  const { user } = useAuth(); // Destructure user from useAuth
  const companyId = user?.companyId; // Access companyId from the authenticated user

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
      // Ensure event.date is a Firebase Timestamp and convert it
      const eventDate = event.date && typeof event.date.toDate === 'function' ? new Date(event.date.toDate()) : null;
      if (!eventDate) return false;

      let start, end;

      switch (dateRange) {
        case 'thisMonth':
          start = startOfMonth(now);
          end = endOfMonth(now);
          break;
        case 'thisQuarter':
          start = startOfQuarter(now);
          end = endOfQuarter(now);
          break;
        case 'thisYear':
          start = startOfYear(now);
          end = endOfYear(now);
          break;
        case 'custom':
          start = customStartDate ? parseISO(customStartDate) : null;
          end = customEndDate ? parseISO(customEndDate) : null;
          if (!start || !end) return true; // If custom range selected but dates not fully set, include all events
          break;
        case 'allTime':
        default:
          return true; // No date filtering
      }

      // Filter by date range for all cases except 'allTime' where start and end are null
      return isWithinInterval(eventDate, { start, end });
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
    const filteredTotalEvents = filteredEvents.length;

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
        dateKey = format(eventDate, 'yyyy-MM-dd'); // Format for day
      } else {
        dateKey = format(eventDate, 'yyyy-MM'); // Format for month
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

    const averageVolunteerCapacity = filteredTotalEvents > 0 ? (totalCapacity / filteredTotalEvents).toFixed(1) : 0;

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
      averageVolunteerCapacity: averageVolunteerCapacity,
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
  }, [filteredEvents, dateRange, customStartDate, customEndDate]); // Depend on filteredEvents and date range filters

  // Define colors for Pie chart cells
  const PIE_COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#AF19FF', '#FF19A0']; // Example colors

  if (!companyId) {
    return <div className="p-4 text-center text-gray-600">Please log in to view event analytics.</div>;
  }

  if (loading) {
    return <div className="p-4 text-center text-gray-600">Loading Event Analytics...</div>;
  }

  if (error) {
    return <div className="p-4 text-center text-red-600">Error loading event data: {error.message}</div>;
  }

  return (
    <div className="container mx-auto p-4 sm:p-6 min-h-screen bg-gray-50">
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

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
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
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Events Over Time ({dateRange === 'custom' && (customStartDate || customEndDate) ? 'Custom' : dateRange})</h3>
          {chartData.eventsOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData.eventsOverTime} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis dataKey="date" />
                <YAxis allowDecimals={false} />
                <Tooltip formatter={(value, name) => [value, `${name} Events`]} />
                <Legend formatter={value => <span className="text-gray-700">{value} Events</span>} />
                <Line type="monotone" dataKey="upcoming" stroke="#4CAF50" name="Upcoming" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="completed" stroke="#2196F3" name="Completed" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="canceled" stroke="#F44336" name="Canceled" activeDot={{ r: 8 }} />
                <Line type="monotone" dataKey="total" stroke="#8884d8" name="Total" activeDot={{ r: 8 }} />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-center py-10">No event data available for this time range.</p>
          )}
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
                  labelLine={false}
                  animationDuration={500}
                >
                  {chartData.eventTypeBreakdown.map((entry, index) => (
                    <Cell key={`cell-type-${index}`} fill={PIE_COLORS[index % PIE_COLORS.length]} />
                  ))}
                </Pie>
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
                    return null;
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-center py-10">No event type data available for this period.</p>
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
                  labelLine={false}
                  animationDuration={500}
                >
                  <Cell key={`cell-upcoming`} fill="#4CAF50" />
                  <Cell key={`cell-completed`} fill="#2196F3" />
                  <Cell key={`cell-canceled`} fill="#F44336" />
                </Pie>
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
                    return null;
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-center py-10">No event status data available for this period.</p>
          )}
        </div>

        {/* Events by Location Chart */}
        <div className="bg-white rounded-lg shadow-md p-4 sm:p-6 col-span-1">
          <h3 className="text-lg font-semibold mb-4 text-gray-800">Events by Location</h3>
          {chartData.eventsByLocation.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData.eventsByLocation} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" interval={0} angle={-30} textAnchor="end" height={60} />
                <YAxis allowDecimals={false} />
                <Tooltip
                  cursor={{ fill: 'rgba(0, 0, 0, 0.1)' }}
                  content={({ active, payload }) => {
                    if (active && payload && payload.length) {
                      const data = payload[0].payload;
                      return (
                        <div className="bg-white p-2 border border-gray-300 shadow-md">{`${data.name}: ${data.count} events`}</div>
                      );
                    }
                    return null;
                  }}
                />
                <Legend />
                <Bar dataKey="count" fill="#82ca9d" />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-gray-600 text-center py-10">No event location data available for this period.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default EventAnalyticsPage;