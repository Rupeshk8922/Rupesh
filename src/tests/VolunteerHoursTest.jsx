import React, { useState } from 'react';
import {
  logVolunteerHours,
  getTotalVolunteerHours,
  getTotalHoursByEvent,
  getMonthlyVolunteerHours,
} from '../services/volunteerHours'; // Adjust path as needed

export default function VolunteerHoursTest() {
  const [volunteerId] = useState('dnUkXX2s0v7mW93fCYQ1');
  const [eventId] = useState('dnUkXX2s0v7mW93fCYQ1');

  const [hoursLogged, setHoursLogged] = useState(null);
  const [totalHours, setTotalHours] = useState(null);
  const [hoursByEvent, setHoursByEvent] = useState(null);
  const [monthlyHours, setMonthlyHours] = useState(null);

  const [loadingLog, setLoadingLog] = useState(false);
  const [loadingFetch, setLoadingFetch] = useState(false);

  async function testLogging() {
    setLoadingLog(true);
    setHoursLogged(null);
    try {
      const response = await logVolunteerHours({
        volunteerId,
        eventId,
        hours: 3,
        approvedBy: null,
      });
      setHoursLogged(response);
    } catch (error) {
      console.error("Error logging hours:", error);
      setHoursLogged({ error: error.message });
    }
    setLoadingLog(false);
  }

  async function fetchTotals() {
    setLoadingFetch(true);
    setTotalHours(null);
    setHoursByEvent(null);
    setMonthlyHours(null);

    try {
      const total = await getTotalVolunteerHours(volunteerId);
      setTotalHours(total);

      const byEvent = await getTotalHoursByEvent(volunteerId);
      setHoursByEvent(byEvent);

      const monthly = await getMonthlyVolunteerHours(volunteerId);
      setMonthlyHours(monthly);
    } catch (error) {
      console.error("Error fetching totals:", error);
      setTotalHours({ error: error.message });
      setHoursByEvent({ error: error.message });
      setMonthlyHours({ error: error.message });
    }
    setLoadingFetch(false);
  }

  function clearResults() {
    setHoursLogged(null);
    setTotalHours(null);
    setHoursByEvent(null);
    setMonthlyHours(null);
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Volunteer Hours Testing</h2>

      <button
        onClick={testLogging}
        style={{ marginRight: 10, padding: '8px 12px' }}
        disabled={loadingLog}
      >
        {loadingLog ? 'Logging...' : 'Log 3 Hours'}
      </button>

      <button
        onClick={fetchTotals}
        style={{ marginRight: 10, padding: '8px 12px' }}
        disabled={loadingFetch}
      >
        {loadingFetch ? 'Fetching...' : 'Fetch Totals'}
      </button>

      <button
        onClick={clearResults}
        style={{ padding: '8px 12px' }}
        disabled={loadingLog || loadingFetch}
      >
        Clear Results
      </button>

      <pre style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 4, marginTop: 10 }}>
        Log Response: {JSON.stringify(hoursLogged, null, 2)}
      </pre>
      <pre style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 4, marginTop: 10 }}>
        Total Hours: {JSON.stringify(totalHours, null, 2)}
      </pre>
      <pre style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 4, marginTop: 10 }}>
        Hours By Event: {JSON.stringify(hoursByEvent, null, 2)}
      </pre>
      <pre style={{ backgroundColor: '#f0f0f0', padding: 10, borderRadius: 4, marginTop: 10 }}>
        Monthly Hours: {JSON.stringify(monthlyHours, null, 2)}
      </pre>
    </div>
  );
}
