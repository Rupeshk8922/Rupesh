jsx
import React from 'react';
import { useAuth } from '../contexts/authContext';
import useLeads from '../hooks/useLeads'; // Assume this hook is implemented to fetch leads
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts';

const LeadsAnalyticsPage = () => {
  const { user } = useAuth(); // Use the auth context
  const { leads, loading, error } = useLeads();

  // Calculate overall lead conversion rate
  const totalLeads = leads.length;
  const convertedLeads = leads.filter(lead => lead.status === 'Converted').length;
  const conversionRate = totalLeads > 0 ? (convertedLeads / totalLeads) * 100 : 0;

  // Calculate conversion rate by Interest Type
  const interestTypes = [...new Set(leads.map(lead => lead.interest))].filter(Boolean); // Get unique interest types, filter out empty strings
  const conversionRateByInterest = interestTypes.map(interest => {
    const leadsByInterest = leads.filter(lead => lead.interest === interest);
    const convertedLeadsByInterest = leadsByInterest.filter(
      lead => lead.status === 'Converted'
    ).length;
    const totalLeadsByInterest = leadsByInterest.length;
    const rate =
      totalLeadsByInterest > 0
        ? (convertedLeadsByInterest / totalLeadsByInterest) * 100
        : 0;

    return {
      interest: interest || 'Unspecified', // Handle cases with no interest specified
      'Conversion Rate (%)': parseFloat(rate.toFixed(2)), // Format to 2 decimal places
      'Total Leads': totalLeadsByInterest,
      'Converted Leads': convertedLeadsByInterest,
    };
  });

  // Sort by conversion rate descending for better visualization
  conversionRateByInterest.sort((a, b) => b['Conversion Rate (%)'] - a['Conversion Rate (%)']);

  if (loading) {
    return <div className="text-center mt-8">Loading Leads Analytics...</div>;
  }

  if (error) {
    return <div className="text-center mt-8 text-red-500">Error loading leads: {error.message}</div>;
  }

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Leads Analytics</h1>

      {/*
        // TODO: Review the grid layout for analytics cards for mobile responsiveness.
        // The current grid classes (grid-cols-1 md:grid-cols-2 lg:grid-cols-3) provide basic responsiveness by stacking columns.
        // Ensure the content within each card remains readable on smaller screens and doesn't overflow.
      */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">

        {/* Overall Conversion Rate Card */}
        <div className="bg-white p-6 rounded-lg shadow">
          <h2 className="text-lg font-semibold text-gray-600 mb-2">Overall Conversion Rate</h2>
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
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={conversionRateByInterest}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="interest" />
              <YAxis
                label={{
                  value: 'Conversion Rate (%)',
                  angle: -90,
                  position: 'insideLeft',
                }}
                domain={[0, 100]} // Set domain for percentage
              />
              <Tooltip
                formatter={(value, name, props) => [
                  `${value}%`,
                  'Conversion Rate',
                ]}
              />
              <Legend />
              <Bar dataKey="Conversion Rate (%)" fill="#8884d8" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
};

export default LeadsAnalyticsPage;