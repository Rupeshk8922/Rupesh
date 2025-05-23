import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { db } from '../../../../firebase/config';
import { doc, getDoc } from 'firebase/firestore';
import { useAuth } from '@/hooks/useAuth';
import { Card } from '@/components/ui/card';
import { CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import AccessDeniedPage from '@/pages/AccessDeniedPage';
import { Button } from '@/components/ui/button';

const ALLOWED_ROLES = ['admin', 'csr', 'telecaller', 'outreach', 'volunteer'];

const ViewLeadPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, role } = useAuth();

  const [lead, setLead] = useState(null);
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialError, setInitialError] = useState(null);

  useEffect(() => {
    const fetchLead = async () => {
      if (!user || !ALLOWED_ROLES.includes(role)) {
        setInitialLoading(false);
        return;
      }

      try {
        const leadRef = doc(db, 'leads', id);
        const leadSnap = await getDoc(leadRef);

        if (leadSnap.exists()) {
          setLead(leadSnap.data());
        } else {
          navigate('/not-found');
          return;
        }
      } catch (error) {
        console.error('Error fetching lead:', error);
        setInitialError('Failed to load lead details. Please try again.');
      } finally {
        setInitialLoading(false);
      }
    };

    fetchLead();
  }, [id, user, role, navigate]);

  if (initialLoading) {
    return (
      <Card className="max-w-xl mx-auto p-6 mt-8 space-y-4">
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-4 w-full" />
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-4 w-2/3" />
      </Card>
    );
  }

  if (!user || !ALLOWED_ROLES.includes(role)) {
    return <AccessDeniedPage />;
  }

  if (initialError) {
    return (
      <Card className="max-w-xl mx-auto p-6 mt-8 text-center">
        <CardContent>
          <h2 className="text-xl font-semibold mb-2">Error</h2>
          <p className="mb-4">{initialError}</p>
          <Button onClick={() => navigate(-1)}>Go Back</Button>
        </CardContent>
      </Card>
    );
  }

  const createdAtDate =
    lead?.createdAt && typeof lead.createdAt.toDate === 'function'
      ? lead.createdAt.toDate()
      : lead?.createdAt
      ? new Date(lead.createdAt)
      : null;

  return (
    <Card className="max-w-3xl mx-auto p-6 mt-8">
      <CardContent>
        <h2 className="text-2xl font-bold mb-4">Lead Details</h2>
        <div className="space-y-3 text-sm">
          <p><strong>Name:</strong> {lead?.name || 'N/A'}</p>
          <p><strong>Email:</strong> {lead?.email || 'N/A'}</p>
          <p><strong>Phone:</strong> {lead?.phone || 'N/A'}</p>
          <p><strong>Status:</strong> {lead?.status || 'N/A'}</p>
          <p><strong>Assigned To:</strong> {lead?.assignedTo || 'Unassigned'}</p>
          <p><strong>Created At:</strong> {createdAtDate ? createdAtDate.toLocaleString() : 'N/A'}</p>
          <p><strong>Notes:</strong> {lead?.notes || 'No notes available'}</p>
        </div>
        <div className="mt-6 flex gap-2">
          <Button onClick={() => navigate(`/dashboard/crm/leads/edit/${id}`)}>Edit Lead</Button>
          <Button variant="outline" onClick={() => navigate('/dashboard/crm/leads')}>Back to Leads</Button>
        </div>
      </CardContent>
    </Card>
  );
};

export default ViewLeadPage;
