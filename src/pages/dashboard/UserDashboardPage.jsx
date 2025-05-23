import React, { useEffect, useState } from 'react';
import { collection, query, where, getDocs, orderBy } from 'firebase/firestore';
import { db } from '@/firebase/config'; // Adjust import path
import { useAuth } from '@/contexts/authContext'; // Adjust import path
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { format } from 'date-fns';

const UserDashboardPage = () => {
  const { user, loading: authLoading } = useAuth();
  const [assignedEvents, setAssignedEvents] = useState([]);
  const [loadingEvents, setLoadingEvents] = useState(true);
  const [eventsError, setEventsError] = useState(null);

  useEffect(() => {
    const fetchAssignedEvents = async () => {
      if (!user) return;

      setLoadingEvents(true);
      setEventsError(null);

      try {
        // Assuming 'events' collection has a field like 'assignedVolunteers' which is an array of user UIDs
        const eventsRef = collection(db, 'events');
        const q = query(
          eventsRef,
          where('assignedVolunteers', 'array-contains', user.uid),
          orderBy('date', 'desc')
        );
        const querySnapshot = await getDocs(q);
        const eventsList = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
          // Convert Firestore Timestamp if necessary
          date: doc.data().date?.toDate ? doc.data().date.toDate() : doc.data().date
        }));
        setAssignedEvents(eventsList);
      } catch (err) {
        console.error("Error fetching assigned events:", err);
        setEventsError("Failed to fetch assigned events.");
      } finally {
        setLoadingEvents(false);
      }
    };

    if (user && !authLoading) {
      fetchAssignedEvents();
      // Implement fetching for other user-specific data similarly
    }
  }, [user, authLoading]);

  if (authLoading) {
    return <div className="p-4"><Skeleton className="h-8 w-1/4 mb-4" /><Skeleton className="h-[200px] w-full" /></div>;
  }

  if (!user) {
    return <Alert variant="destructive" className="m-4"><AlertTitle>Authentication Error</AlertTitle><AlertDescription>Please log in to view your dashboard.</AlertDescription></Alert>;
  }

  return (
    <div className="p-4 space-y-6">
      <h1 className="text-2xl font-bold">Welcome, {user.displayName || user.email}!</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Assigned Events Card */}
        <Card>
          <CardHeader>
            <CardTitle>Your Assigned Events</CardTitle>
          </CardHeader>
          <CardContent>
            {loadingEvents ? (
              <div className="space-y-2"><Skeleton className="h-4 w-full" /><Skeleton className="h-4 w-full" /></div>
            ) : eventsError ? (
              <Alert variant="destructive"><AlertTitle>Error</AlertTitle><AlertDescription>{eventsError}</AlertDescription></Alert>
            ) : assignedEvents.length === 0 ? (
              <p className="text-gray-500">No events assigned yet.</p>
            ) : (
              <ul className="list-disc list-inside space-y-2">
                {assignedEvents.map(event => (
                  <li key={event.id}>
                    <strong>{event.title}</strong> - {event.date ? format(new Date(event.date), 'PPP') : 'Date N/A'}
                    <span className={`ml-2 px-2 py-0.5 text-xs font-semibold rounded-full ${event.status === 'upcoming' ? 'bg-blue-100 text-blue-800' : event.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {event.status || 'Unknown'}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Hours Contributed Card */}
        <Card>
          <CardHeader>
            <CardTitle>Hours Contributed</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Implement fetching and displaying hours contributed */}
            <p className="text-gray-500">Hours data not available.</p>
          </CardContent>
        </Card>

        {/* Recent Activity Card (Placeholder) */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Implement fetching and displaying recent activity */}
            <p className="text-gray-500">No recent activity to display.</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default UserDashboardPage;