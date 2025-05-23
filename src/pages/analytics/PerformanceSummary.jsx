import { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  CircularProgress,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '@/firebase/config.jsx';

function PerformanceSummary() {
  const [performanceData, setPerformanceData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    const fetchData = async () => {
      try {
        if (!userId) {
          throw new Error('User ID not found.');
        }
        const performanceRef = collection(db, 'performance_summary');
        const q = query(performanceRef, where('userId', '==', userId));
        const querySnapshot = await getDocs(q);
        const data = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
        }));

        setPerformanceData(data);
      } catch (err) {
        setError('Failed to fetch performance data.');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  if (loading) {
    return (
      <Container maxWidth="md" sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Performance Summary
        </Typography>
        <CircularProgress sx={{ mt: 4, mb: 2 }} />
        <Typography>Loading...</Typography>
      </Container>
    );
  }

  if (error) {
    return (
      <Container maxWidth="md" sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Performance Summary
        </Typography>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  if (!performanceData || performanceData.length === 0) {
    return (
      <Container maxWidth="md" sx={{ mt: 6, textAlign: 'center' }}>
        <Typography variant="h4" component="h1" gutterBottom>
          Performance Summary
        </Typography>
        <Typography>No performance data available.</Typography>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ mt: 6 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Performance Summary
      </Typography>
      <Grid container spacing={2}>
        {performanceData.map((data) => (
          <Grid item xs={12} sm={6} md={4} key={data.id}>
            <Card
              sx={{
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
              }}
              elevation={3}
            >
              <CardContent>
                <Typography variant="h6" gutterBottom noWrap>
                  Period: {data.period || 'N/A'}
                </Typography>
                <Typography variant="body2" noWrap>
                  Calls Made: {data.callsMade ?? 'N/A'}
                </Typography>
                <Typography variant="body2" noWrap>
                  Successful Interactions: {data.successfulInteractions ?? 'N/A'}
                </Typography>
                <Typography variant="body2" noWrap>
                  Progress Towards Goals: {data.progressTowardsGoals ?? 'N/A'}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default PerformanceSummary;
