jsx
import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { collection, query, getDocs, where } from 'firebase/firestore';
import { db } from '../../firebase/config';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { FaUsers, FaProjectDiagram, FaHandsHelping, FaCalendarAlt } from 'react-icons/fa'; // Import necessary icons
import './AdminDashboard.css'; // Assuming you have a CSS file for styling

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042']; // Colors for Pie Chart

const AdminDashboard = () => {
  const [userStats, setUserStats] = useState(null);
  const [projectStats, setProjectStats] = useState(null);
  const [eventStats, setEventStats] = useState(null);
  const [volunteerHoursStats, setVolunteerHoursStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        // Fetch User Stats
        const usersRef = collection(db, 'users');
        const usersSnapshot = await getDocs(usersRef);
        const totalUsers = usersSnapshot.size;
        const activeUsers = usersSnapshot.docs.filter(doc => doc.data().status === 'active').length;
        setUserStats({ total: totalUsers, active: activeUsers });

        // Fetch Project Stats
        const projectsRef = collection(db, 'projects');
        const projectsSnapshot = await getDocs(projectsRef);
        const totalProjects = projectsSnapshot.size;
        const completedProjects = projectsSnapshot.docs.filter(doc => doc.data().status === 'Completed').length;
        setProjectStats({ total: totalProjects, completed: completedProjects });

        // Fetch Event Stats
        const eventsRef = collection(db, 'events');
        const eventsSnapshot = await getDocs(eventsRef);
        const totalEvents = eventsSnapshot.size;
        const upcomingEvents = eventsSnapshot.docs.filter(doc => new Date(doc.data().date) > new Date()).length;
        setEventStats({ total: totalEvents, upcoming: upcomingEvents });

        // Fetch Volunteer Hours Stats (Example: Total hours logged)
        const volunteerHoursRef = collection(db, 'volunteerHours');
        const volunteerHoursSnapshot = await getDocs(volunteerHoursRef);
        const totalHours = volunteerHoursSnapshot.docs.reduce((sum, doc) => sum + doc.data().hours, 0);
        setVolunteerHoursStats({ total: totalHours });


        setLoading(false);
      } catch (err) {
        setError(err.message);
        setLoading(false);
      }
    };

    fetchStats();
  }, []);

  if (loading) {
    return <div>Loading dashboard data...</div>;
  }

  if (error) {
    return <div>Error: {error}</div>;
  }

  // Prepare data for charts
  const userStatusData = userStats ? [
    { name: 'Active Users', value: userStats.active },
    { name: 'Inactive Users', value: userStats.total - userStats.active },
  ] : [];

  const projectStatusData = projectStats ? [
    { name: 'Completed Projects', value: projectStats.completed },
    { name: 'Ongoing Projects', value: projectStats.total - projectStats.completed },
  ] : [];

  const eventStatusData = eventStats ? [
    { name: 'Upcoming Events', value: eventStats.upcoming },
    { name: 'Past Events', value: eventStats.total - eventStats.upcoming },
  ] : [];


  return (
    <div className="admin-dashboard">
      <h1>Admin Dashboard</h1>

      <div className="stats-summary">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Users
            </CardTitle>
            <FaUsers className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{userStats?.total ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Projects
            </CardTitle>
            <FaProjectDiagram className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{projectStats?.total ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Events
            </CardTitle>
            <FaCalendarAlt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{eventStats?.total ?? 0}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Volunteer Hours
            </CardTitle>
            <FaHandsHelping className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{volunteerHoursStats?.total ?? 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="charts-section">
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

      {/* Example of linking to other admin pages */}
      <div className="admin-links">
        <h2>Quick Links</h2>
        <ul>
          <li><Link to="/admin/users">Manage Users</Link></li>
          <li><Link to="/admin/projects">Manage Projects</Link></li>
          <li><Link to="/admin/events">Manage Events</Link></li>
          <li><Link to="/admin/reports">View Reports</Link></li>
        </ul>
      </div>
    </div>
  );
};

export default AdminDashboard;