import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/contexts/authContext';
import VolunteerForm from '@/components/VolunteerForm.jsx';
import { Skeleton } from '@/components/ui/skeleton';
import { Card, CardContent } from '@/components/ui/card';

export default function EditVolunteerPage() {
  const { companyId } = useAuth();
  const { volunteerId } = useParams();
  const navigate = useNavigate();

  const [volunteer, setVolunteer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchVolunteer = async () => {
      try {
        const ref = doc(db, 'data', companyId, 'volunteers', volunteerId);
        const snap = await getDoc(ref);
        if (snap.exists()) {
          setVolunteer({ id: snap.id, ...snap.data() });
        } else {
          setError('Volunteer not found');
        }
      } catch {
        setError('Failed to load volunteer data');
      } finally {
        setLoading(false);
      }
    };

    if (companyId && volunteerId) fetchVolunteer();
  }, [companyId, volunteerId]);

  const handleSubmit = async (formData) => {
    try {
      setSaving(true);
      const ref = doc(db, 'data', companyId, 'volunteers', volunteerId);
      await updateDoc(ref, formData);
      navigate('/dashboard/crm/volunteers');
    } catch {
      setError('Failed to update volunteer');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-6">
        <Skeleton className="h-6 w-1/2 mb-4" />
        <Skeleton className="h-[300px] w-full" />
      </div>
    );
  }

  if (error) {
    return <div className="text-center text-red-600 p-6">{error}</div>;
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <h1 className="text-2xl font-bold mb-4">Edit Volunteer</h1>
      <Card>
        <CardContent className="p-6">
          <VolunteerForm
            initialData={volunteer}
            onSubmit={handleSubmit}
            loading={saving}
            mode="edit"
          />
        </CardContent>
      </Card>
    </div>
  );
}
