import React, { useContext, useEffect, useState } from 'react';
import { FirebaseContext, AuthContext } from '../../contexts/FirebaseContext';

const PerformanceSummary = () => {
  const { db } = useContext(FirebaseContext);
  const { currentUser, loading: authLoading } = useContext(AuthContext);

  const [callsMade, setCallsMade] = useState(0);
  const [meetingsHeld, setMeetingsHeld] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [noData, setNoData] = useState(false);

  useEffect(() => {
    if (authLoading) return;

    const fetchPerformanceData = async () => {
      setLoading(true);
      try {
        const snapshot = await db
          .collection('performance')
          .where('userId', '==', currentUser.uid)
          .get();

        if (snapshot.empty) {
          setNoData(true);
          setLoading(false);
          return;
        }

        let totalCalls = 0;
        let totalMeetings = 0;

        snapshot.docs.forEach(doc => {
          const data = doc.data();
          totalCalls += data.callsMade || 0;
          totalMeetings += data.meetingsHeld || 0;
        });

        setCallsMade(totalCalls);
        setMeetingsHeld(totalMeetings);
      } catch (err) {
        console.error('Error fetching performance data:', err);
        setError('Error loading performance data.');
      } finally {
        setLoading(false);
      }
    };

    fetchPerformanceData();
  }, [db, currentUser, authLoading]);

  if (authLoading || loading) {
    return <p>Loading data...</p>;
  }

  if (error) {
    return <p>{error}</p>;
  }

  if (noData) {
    return <p>No data found for this user.</p>;
  }

  return (
    <div>
      <h3>Performance Summary</h3>
      <p><strong>Calls Made:</strong> {callsMade}</p>
      <p><strong>Meetings Held:</strong> {meetingsHeld}</p>
    </div>
  );
};

export default PerformanceSummary;
