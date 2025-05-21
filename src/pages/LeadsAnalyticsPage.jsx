import useLeads from '../hooks/useLeads';

const LeadsAnalyticsPage = () => {
  const { leads, loading, error } = useLeads(); // Assume this hook is implemented to fetch leads

  // Calculate overall lead conversion rate
  const totalLeads = leads ? leads.length : 0;
  const convertedLeads = leads
    ? leads.filter((lead) => lead.status === 'Converted').length
    : 0;
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  // Calculate conversion rate by Interest Type
  const interestTypes = leads
    ? [...new Set(leads.map((lead) => lead.interest))].filter(Boolean)
    : []; // Get unique interest types, filter out empty strings
  const conversionRateByInterest = interestTypes.map((interest) => {
    const leadsByInterest = leads
      ? leads.filter((lead) => lead.interest === interest)
      : [];
    const convertedLeadsByInterest = leadsByInterest.filter(
      (lead) => lead.status === 'Converted'
    ).length;
    const totalLeadsByInterest = leadsByInterest.length;
    const rate =
      totalLeadsByInterest > 0 ? (convertedLeadsByInterest / totalLeadsByInterest) * 100 : 0;

    return {
      interest: interest || 'Unspecified', // Handle cases with no interest specified
      'Conversion Rate (%)': parseFloat(rate.toFixed(2)), // Format to 2 decimal places
      'Total Leads': totalLeadsByInterest ,
      'Converted Leads': convertedLeadsByInterest,
    };
  });

  // Sort by conversion rate descending for better visualization
  conversionRateByInterest.sort(
    (a, b) => b['Conversion Rate (%)'] - a['Conversion Rate (%)']
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

      {/*
        // TODO: Review the grid layout for analytics cards for mobile responsiveness.
        // The current grid classes (grid-cols-1 md:grid-cols-2 lg:grid-cols-3) provide basic responsiveness by stacking columns.
        // Ensure the content within each card remains readable on smaller screens and doesn't overflow.
      */}
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

        {/* Add more metric cards here later */}
      </div>
      {/* Conversion Rate by Interest Type Chart */}
      {/*
        // TODO: Ensure chart responsiveness.
        // The use of `ResponsiveContainer` from Recharts is good for making the chart adapt to its container size.
        // Ensure the container div (`bg-white p-6 rounded-lg shadow`) also adjusts correctly on smaller screens.
        // The X-axis labels might overlap on very small screens; consider adjusting font size or angle for readability if needed.
      */}
      <div className="mt-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-600 mb-4">
            Conversion Rate by Interest Type
          </h2>
        </div>
      </div>
    </div>
  );
};

export default LeadsAnalyticsPage;