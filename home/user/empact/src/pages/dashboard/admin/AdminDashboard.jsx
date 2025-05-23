import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend,
  ResponsiveContainer, PieChart, Pie, Cell,
} from 'recharts';
import {
  FaUsers, FaProjectDiagram, FaHandsHelping, FaCalendarAlt,
  FaSyncAlt, FaTimes,
} from 'react-icons/fa';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

const AdminDashboard = () => {
  const [userStats, setUserStats] = useState(null);
  const [projectStats, setProjectStats] = useState(null);
  const [eventStats, setEventStats] = useState(null);
  const [volunteerHoursStats, setVolunteerHoursStats] = useState(null);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchStats = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      // Users
      const usersSnapshot = await getDocs(collection(db, 'users'));
      const totalUsers = usersSnapshot.size;
      const activeUsers = usersSnapshot.docs.filter(doc => doc.data().status === 'active').length;
      setUserStats({ total: totalUsers, active: activeUsers });

      // Projects
      const projectsSnapshot = await getDocs(collection(db, 'projects'));
      const totalProjects = projectsSnapshot.size;
      const completedProjects = projectsSnapshot.docs.filter(doc => doc.data().status === 'Completed').length;
      setProjectStats({ total: totalProjects, completed: completedProjects });

      // Events
      const eventsSnapshot = await getDocs(collection(db, 'events'));
      const totalEvents = eventsSnapshot.size;
      const now = new Date();
      const upcomingEvents = eventsSnapshot.docs.filter(doc => {
        const data = doc.data();
        let eventDate = data.date;
        // If Firestore Timestamp, convert to Date
        if (eventDate?.toDate) {
          eventDate = eventDate.toDate();
        } else {
          eventDate = new Date(eventDate);
        }
        return eventDate > now;
      }).length;
      setEventStats({ total: totalEvents, upcoming: upcomingEvents });

      // Volunteer Hours
      const volunteerHoursSnapshot = await getDocs(collection(db, 'volunteerHours'));
      const totalHours = volunteerHoursSnapshot.docs.reduce((sum, doc) => sum + (doc.data().hours || 0), 0);
      setVolunteerHoursStats({ total: totalHours });

      setLoading(false);
    } catch (err) {
      setError(err.message || 'Failed to fetch data');
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Memoize chart data
  const userStatusData = useMemo(() => {
    if (!userStats) return [];
    return [
      { name: 'Active Users', value: userStats.active },
      { name: 'Inactive Users', value: userStats.total - userStats.active },
    ];
  }, [userStats]);

  const projectStatusData = useMemo(() => {
    if (!projectStats) return [];
    return [
      { name: 'Completed Projects', value: projectStats.completed },
      { name: 'Ongoing Projects', value: projectStats.total - projectStats.completed },
    ];
  }, [projectStats]);

  const eventStatusData = useMemo(() => {
    if (!eventStats) return [];
    return [
      { name: 'Upcoming Events', value: eventStats.upcoming },
      { name: 'Past Events', value: eventStats.total - eventStats.upcoming },
    ];
  }, [eventStats]);

  // Loading Spinner Component (simple)
  const Spinner = () => (
    <div className="flex justify-center items-center p-10">
      <svg
        className="animate-spin h-10 w-10 text-blue-600"
        xmlns="http://www.w3.org/2000/svg"
        fill="none" viewBox="0 0 24 24"
      >
        <circle
          className="opacity-25" cx="12" cy="12" r="10"
          stroke="currentColor" strokeWidth="4"
        />
        <path
          className="opacity-75" fill="currentColor"
          d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
        />
      </svg>
      <span className="sr-only">Loading...</span>
    </div>
  );

  return (
    <div className="admin-dashboard max-w-7xl mx-auto p-4 space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Admin Dashboard</h1>
        <button
          onClick={fetchStats}
          aria-label="Refresh Stats"
          className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700 transition"
          disabled={loading}
        >
          <FaSyncAlt className="animate-spin-slow" />
          Refresh Stats
        </button>
      </div>

      {loading && <Spinner />}

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
          <strong className="font-bold">Error: </strong>
          <span className="block sm:inline">{error}</span>
          <button
            onClick={() => setError(null)}
            className="absolute top-0 bottom-0 right-0 px-4 py-3"
            aria-label="Dismiss error"
          >
            <FaTimes />
          </button>
        </div>
      )}

      {!loading && !error && (
        <>
          <div className="stats-summary grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Users</CardTitle>
                <FaUsers className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{userStats?.total ?? 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Projects</CardTitle>
                <FaProjectDiagram className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{projectStats?.total ?? 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Events</CardTitle>
                <FaCalendarAlt className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{eventStats?.total ?? 0}</div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader className="flex items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Volunteer Hours</CardTitle>
                <FaHandsHelping className="h-5 w-5 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{volunteerHoursStats?.total ?? 0}</div>
              </CardContent>
            </Card>
          </div>

          <div className="charts-section space-y-8">
            {userStats && (
              <Card>
                <CardHeader>
                  <CardTitle>User Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={userStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#8884d8"
                        dataKey="value"
                        label
                      >
                        {userStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {projectStats && (
              <Card>
                <CardHeader>
                  <CardTitle>Project Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={projectStatusData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="value" fill="#8884d8" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {eventStats && (
              <Card>
                <CardHeader>
                  <CardTitle>Event Status Distribution</CardTitle>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={eventStatusData}
                        cx="50%"
                        cy="50%"
                        outerRadius={100}
                        fill="#82ca9d"
                        dataKey="value"
                        label
                      >
                        {eventStatusData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>

          <div className="admin-links mt-6">
            <h2 className="text-xl font-semibold mb-2">Quick Links</h2>
            <ul className="space-y-2 list-disc list-inside text-blue-600">
              <li>
                <Link to="/admin/users" className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500">
                  Manage Users
                </Link>
              </li>
              <li>
                <Link to="/admin/projects" className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500">
                  Manage Projects
                </Link>
              </li>
              <li>
                <Link to="/admin/events" className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500">
                  Manage Events
                </Link>
              </li>
              <li>
                <Link to="/admin/reports" className="hover:underline focus:outline-none focus:ring-2 focus:ring-blue-500">
                  View Reports
                </Link>
              </li>
            </ul>
          </div>
        </>
      )}
    </div>
  );
};

export default AdminDashboard;
