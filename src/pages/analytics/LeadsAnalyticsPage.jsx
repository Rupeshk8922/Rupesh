import useLeads from '../../hooks/useLeads.jsx';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const LeadsAnalyticsPage = () => {
  const { leads, loading, error } = useLeads();

  const totalLeads = leads ? leads.length : 0;
  const convertedLeads = leads
    ? leads.filter((lead) => lead.status === 'Converted').length
    : 0;
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  const interestTypes = leads
    ? [...new Set(leads.map((lead) => lead.interest))].filter(Boolean)
    : [];
  const conversionRateByInterest = interestTypes.map((interest) => {
    const leadsByInterest = leads
      ? leads.filter((lead) => lead.interest === interest)
      : [];
    const convertedLeadsByInterest = leadsByInterest.filter(
      (lead) => lead.status === 'Converted'
    ).length;
    const totalLeadsByInterest = leadsByInterest.length;
    const rate =
      totalLeadsByInterest > 0
        ? (convertedLeadsByInterest / totalLeadsByInterest) * 100
        : 0;

    return {
      interest: interest || 'Unspecified',
      conversionRate: parseFloat(rate.toFixed(2)),
      totalLeads: totalLeadsByInterest,
      convertedLeads: convertedLeadsByInterest,
    };
  });

  conversionRateByInterest.sort(
    (a, b) => b.conversionRate - a.conversionRate
  );

  if (loading) {
    return <div className="text-center mt-8">Loading Leads Analytics...</div>;
  }

  if (error) {
    return (
      <div className="text-center mt-8 text-red-500">
        Error loading leads: {error.message}
      </div>
    );
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <h1 className="text-2xl font-bold mb-6">Leads Analytics</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {/* Overall Conversion Rate Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-600 mb-2">
            Overall Conversion Rate
          </h2>
          <p className="text-3xl font-bold text-green-600">
            {conversionRate.toFixed(2)}%
          </p>
          <p className="text-sm text-gray-500 mt-1">
            {convertedLeads} of {totalLeads} leads converted
          </p>
        </div>

        {/* Add more metric cards here if needed */}
      </div>

      {/* Conversion Rate by Interest Type Chart */}
      <div className="mt-8 bg-white p-6 rounded-lg shadow">
        <h2 className="text-lg font-semibold text-gray-600 mb-4">
          Conversion Rate by Interest Type
        </h2>
        {conversionRateByInterest.length === 0 ? (
          <p className="text-gray-500">No interest data available.</p>
        ) : (
          <ResponsiveContainer width="100%" height={300}>
            <BarChart
              data={conversionRateByInterest}
              margin={{ top: 20, right: 30, left: 0, bottom: 5 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="interest"
                tick={{ fontSize: 12 }}
                interval={0}
                angle={-30}
                textAnchor="end"
                height={60}
              />
              <YAxis
                label={{ value: 'Conversion Rate (%)', angle: -90, position: 'insideLeft' }}
                domain={[0, 100]}
                tickFormatter={(tick) => `${tick}%`}
              />
              <Tooltip
                formatter={(value) => `${value}%`}
                cursor={{ fill: 'rgba(0,0,0,0.1)' }}
              />
              <Bar
                dataKey="conversionRate"
                fill="#22c55e"
                name="Conversion Rate (%)"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
};

export default LeadsAnalyticsPage;
