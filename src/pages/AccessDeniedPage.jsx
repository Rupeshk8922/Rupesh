import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldOff } from "lucide-react";
import Alert from "@/components/ui/alert";
import { Button } from "@/components/ui/button"; // Assuming Button is still needed

const AccessDeniedPage = () => {
  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-100">
      <Alert variant="destructive" className="w-full max-w-md">
        <ShieldOff className="h-4 w-4" />
        <div className="mt-2">You do not have the necessary permissions to view this page. Please contact your administrator if you believe this is an error.</div>
        <div className="mt-4 text-center">
          <Button asChild>
            <Link to="/dashboard">Go to Dashboard</Link>
          </Button>
        </div>
      </Alert>
    </div>
  );
};

export default AccessDeniedPage;