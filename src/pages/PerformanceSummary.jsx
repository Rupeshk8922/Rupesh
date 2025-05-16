import React, { useState, useEffect } from 'react';
import {
  Container,
  Typography,
  Card,
  CardContent,
  Grid,
  CircularProgress,
} from '@mui/material';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { db } from '../firebase/config';
import { useAuth } from '../contexts/authContext'; // This import seems correct now
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
        const data = querySnapshot.docs.map(doc => ({
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
    // TODO: Add mobile responsiveness considerations for the loading and error states.
    // Ensure the CircularProgress and Typography elements are centered and sized
    // appropriately on smaller screens. Material UI components like Container and
    // Typography are generally responsive, but check for any fixed widths or padding.
  }, [userId]);

  if (loading) {
    return (
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          Performance Summary
        </Typography>
        <div style={{ textAlign: 'center' }}>
          <CircularProgress />
          <Typography>Loading...</Typography>
        </div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container>
        <Typography variant="h4" component="h1" gutterBottom>
          Performance Summary
        </Typography>
        <Typography color="error">{error}</Typography>
      </Container>
    );
  }

  return (
    <Container>
      <Typography variant="h4" component="h1" gutterBottom>
        Performance Summary
      </Typography>
      {/*
        // TODO: Review Grid layout for mobile responsiveness.
        // Material UI's Grid component is inherently responsive due to its `xs`, `sm`, `md` props.
        // Ensure that the `spacing` is appropriate for smaller screens and that cards stack correctly (`xs={12}`).
      */}
      <Grid container spacing={2}>
        {performanceData && performanceData.map((data) => (
          <Grid item xs={12} sm={6} md={4} key={data.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">Week/Month: {data.period}</Typography>
                <Typography>Calls Made: {data.callsMade}</Typography>
                <Typography>Successful Interactions: {data.successfulInteractions}</Typography>
                {/*
                  // TODO: Consider wrapping or adjusting long text/labels on smaller screens if needed.
                  // Material UI's Typography helps, but ensure the card doesn't overflow horizontally.
                */}
                <Typography>Progress Towards Goals: {data.progressTowardsGoals}</Typography>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Container>
  );
}

export default PerformanceSummary;