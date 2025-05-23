import { useEffect, useState, useMemo } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer
} from 'recharts';
import useOrgId from '@/hooks/useOrgId';
import PageHeading from '@/components/layouts/page-heading';
import { format, parseISO } from 'date-fns';
import { useIsFetching } from '@tanstack/react-query';
import { Skeleton } from '@/components/ui/skeleton';

import { getFirebaseEvents, Event } from '@/lib/firebase/events';

const EXCLUDED_SCREENS = ['ViewProduct', 'ViewProducts'];

type EventCounts = {
  date: string;
  [screenName: string]: number | string;
};

export default function EventAnalyticsPage() {
  const orgId = useOrgId();
  const [events, setEvents] = useState<Event[]>([]);
  const [loading, setLoading] = useState(true);
  const isQueryFetching = useIsFetching() > 0;

  useEffect(() => {
    if (!orgId) {
      setEvents([]);
      setLoading(false);
      return;
    }

    const fetchEvents = async () => {
      setLoading(true);
      try {
        const data = await getFirebaseEvents();
        const filtered = data.filter((e: Event) => !EXCLUDED_SCREENS.includes(e.screen_name));
        setEvents(filtered);
      } catch (error) {
        console.error('Error fetching events:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchEvents();
  }, [orgId]);

  const eventData = useMemo(() => {
    const counts: Record<string, Record<string, number>> = {};

    events.forEach(({ timestamp, screen_name }) => {
      try {
        const date = format(parseISO(timestamp), 'yyyy-MM-dd');
        if (!counts[date]) counts[date] = {};
        counts[date][screen_name] = (counts[date][screen_name] || 0) + 1;
      } catch {
        // Invalid timestamp
      }
    });

    const allScreenNames = Array.from(new Set(events.map((e) => e.screen_name)));

    return Object.entries(counts).map(([date, screenCounts]) => {
      const dailyData: EventCounts = { date };
      allScreenNames.forEach(screen => {
        dailyData[screen] = screenCounts[screen] || 0;
      });
      return dailyData;
    });
  }, [events]);

  const screenNames = useMemo(() => {
    return Array.from(new Set(events.map((e) => e.screen_name)));
  }, [events]);

  const colors = [
    '#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088FE',
    '#00C49F', '#FFBB28', '#FF8042', '#a4de6c', '#d0ed57',
  ];

  const renderChart = () => (
    <ResponsiveContainer width="100%" height={400}>
      <BarChart data={eventData}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="date" />
        <YAxis />
        <Tooltip />
        {screenNames.map((screen, index) => (
          <Bar key={screen} dataKey={screen} stackId="a" fill={colors[index % colors.length]} />
        ))}
      </BarChart>
    </ResponsiveContainer>
  );

  return (
    <div className="space-y-4">
      <PageHeading className="">
        <div>
          <h1 className="text-2xl font-semibold">Event Analytics</h1>
          <p className="text-sm text-gray-600">Visualize and analyze user engagement across your app screens.</p>
        </div>
      </PageHeading>

      <Card>
        <CardContent className="p-4">
          {(loading || isQueryFetching) && (
            <Skeleton className="w-full h-[400px] rounded-lg" />
          )}
          {!loading && !isQueryFetching && events.length === 0 && (
            <p className="text-center text-gray-500">No event data available to display.</p>
          )}
          {!loading && !isQueryFetching && events.length > 0 && renderChart()}
        </CardContent>
      </Card>
    </div>
  );
}
