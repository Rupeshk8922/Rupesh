import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button'; // UI Button component
import { AlertTriangle } from 'lucide-react'; // Alert icon

const AccessDenied = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-6 text-center bg-white">
      <div className="bg-red-100 rounded-full p-4 mb-6">
        <AlertTriangle className="h-10 w-10 text-red-600" />
      </div>

      <h1 className="text-3xl font-bold text-gray-800 mb-2">Access Denied</h1>
      <p className="text-gray-600 mb-6">
        You do not have the required permission to access this page.
      </p>

      <div className="flex gap-4">
        <Button variant="default" onClick={() => navigate(-1)}>
          Go Back
        </Button>
        <Button variant="secondary" onClick={() => navigate('/')}>
          Return Home
        </Button>
      </div>
    </div>
  );
};

export default AccessDenied;
