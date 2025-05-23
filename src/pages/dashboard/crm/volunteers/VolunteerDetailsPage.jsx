import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/contexts/authContext';
import { Card, CardContent } from '@/components/ui/card';
import { Spinner } from '@/components/ui/spinner';
import { Button } from '@/components/ui/button';

const VolunteerDetailsPage = () => {
  const { volunteerId } = useParams();
  const navigate = useNavigate();
  const { user, userRole, companyId } = useAuth();

  const [loading, setLoading] = useState(true);
  const [fetchError, setFetchError] = useState(null);
  const [volunteer, setVolunteer] = useState(null);

  useEffect(() => {
    if (!user || !companyId) return;

    const fetchVolunteer = async () => {
      setLoading(true);
      try {
        const ref = doc(db, 'data', companyId, 'volunteers', volunteerId);
        const snap = await getDoc(ref);

        if (!snap.exists()) {
          setFetchError('Volunteer not found.');
          return;
        }

        setVolunteer({ id: snap.id, ...snap.data() });
      } catch (err) {
        console.error(err);
        setFetchError('Failed to load volunteer.');
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteer();
  }, [user, companyId, volunteerId]);

  if (!['admin', 'Manager', 'Outreach Officer', 'CSR'].includes(userRole)) {
    return <div className="p-6 text-red-600">You do not have permission to view this page.</div>;
  }

  if (loading) {
    return (
      <div className="p-6">
        <Spinner /> Loading volunteer details...
      </div>
    );
  }

  if (fetchError) {
    return <div className="p-6 text-red-600">Error: {fetchError}</div>;
  }

  return (
    <div className="p-6 max-w-xl mx-auto space-y-4">
      <h2 className="text-2xl font-semibold">Volunteer Details</h2>

      <Card>
        <CardContent className="space-y-2 p-4">
          <div>
            <strong>Name:</strong> {volunteer.name || 'N/A'}
          </div>
          <div>
            <strong>Email:</strong> {volunteer.email || 'N/A'}
          </div>
          <div>
            <strong>Phone:</strong> {volunteer.phone || 'N/A'}
          </div>
          <div>
            <strong>Notes:</strong>
            <p className="whitespace-pre-wrap mt-1">{volunteer.notes || 'None'}</p>
          </div>
        </CardContent>
      </Card>

      <Button onClick={() => navigate(`/volunteers/${volunteerId}/edit`)}>Edit Volunteer</Button>
    </div>
  );
};

export default VolunteerDetailsPage;
