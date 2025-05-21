import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '../../../../firebase/config';

import { useAuth } from '../../../../contexts/authContext';
import { format } from 'date-fns';

const EventDetailsPage = () => {
  const { eventId } = useParams();  const {  } = useAuth();

  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchEventDetails = async () => {
      setLoading(true);
      setError(null);

      try {
        const eventDocRef = doc(db, 'events', eventId);
        const eventSnap = await getDoc(eventDocRef);

        if (eventSnap.exists()) {
          const eventData = eventSnap.data();

          // Normalize Firestore timestamp to ISO string if present
          if (eventData.date?.toDate) {
            eventData.date = eventData.date.toDate().toISOString();
          }

          setEvent({ id: eventSnap.id, ...eventData });
        } else {
          setError('Event not found.');
        }
      } catch (err) {
        console.error('Error fetching event:', err);
        setError('Failed to load event details.');
      } finally {
        setLoading(false);
      }
    };

    if (eventId) {
      fetchEventDetails();
    } else {
      setLoading(false);
      setError('Invalid event ID.');
    }
  }, [eventId]);

  if (loading) {
    return (
      <div className="p-4 flex justify-center items-center h-32">
        Loading...
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 text-red-600 font-medium" role="alert">
        Error: {error}
      </div>
    );
  }

  if (!event) {
    return (
      <div className="p-4 text-gray-500" role="alert">
        Event not found.
      </div>
    );
  }

  const formattedDate = event.date
    ? format(new Date(event.date), 'PPP')
    : 'N/A';

  // Badge variant mapping for readability
  const badgeVariant = {
    upcoming: 'default',
    completed: 'success',
    cancelled: 'destructive',
  };

  return (
    <div className="p-4 max-w-3xl mx-auto">
      <Card>
        <CardHeader> // Keeping CardHeader and CardTitle for now as they are used below
          <div className="flex items-center justify-between">
            <CardTitle>{event.title || 'Untitled Event'}</CardTitle>
            <Badge
              variant={badgeVariant[event.status] || 'secondary'}
              className="capitalize"
            >
              {event.status || 'Unknown'}
            </Badge>
          </div>
        </CardHeader> // Keeping CardHeader and CardTitle for now
        <CardContent className="space-y-4 text-gray-700">
          <section>
            <h2 className="text-lg font-semibold">Description</h2>
            <p>{event.description || 'No description provided.'}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Date</h2>
            <p>{formattedDate}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Location</h2>
            <p>{event.location || 'N/A'}</p>
          </section>

          <section>
            <h2 className="text-lg font-semibold">Type</h2>
            <p className="capitalize">{event.eventType || 'N/A'}</p>
          </section>

          {event.maxVolunteers !== null && event.maxVolunteers !== undefined && (
            <section>
              <h2 className="text-lg font-semibold">Max Volunteers</h2>
              <p>{event.maxVolunteers}</p>
            </section>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default EventDetailsPage;
