import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card'; // ✅ single import

const NotFoundPage: React.FC = () => {
  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md text-center p-6 space-y-6">
        <div className="text-6xl font-bold text-blue-600">404</div>
        <h1 className="text-3xl font-semibold text-gray-800">Page Not Found</h1>
        <p className="text-gray-600">
          Sorry, the page you are looking for could not be found. It might have been
          removed, renamed, or didn&apos;t exist in the first place.
        </p>
        <div className="flex justify-center">
          <Button asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
};

export default NotFoundPage;
