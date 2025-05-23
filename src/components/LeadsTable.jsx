import { Skeleton, Card, CardContent } from '@mui/material';
import { AlertTriangle, Users } from 'react-icons/lucide';
// src/components/LeadsTable.jsx
const LeadsTable = ({ leads, loading, error }) => {
  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-20 w-full rounded-xl" />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center text-red-600 mt-4">
        <AlertTriangle className="mr-2" />
        <span>Error loading leads. Please try again.</span>
      </div>
    );
  }

  if (!leads || leads.length === 0) {
    return (
      <div className="flex items-center justify-center text-gray-500 mt-4">
        <Users className="mr-2" />
        <span>No leads found.</span>
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
      {leads.map((lead) => (
        <Card key={lead.id} className="hover:shadow-md transition-shadow">
          <CardContent className="p-4 space-y-2">
            <h2 className="text-lg font-semibold">{lead.name}</h2>
            <p className="text-sm text-gray-600">{lead.email}</p>
            <p className="text-sm text-gray-500">{lead.phone}</p>
            <span className="inline-block px-2 py-1 text-xs rounded bg-blue-100 text-blue-700">
              {lead.status}
            </span>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default LeadsTable;