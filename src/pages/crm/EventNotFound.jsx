import { useNavigate } from 'react-router-dom';

const EventNotFound = () => {
  const navigate = useNavigate();

  return (
    <div className="flex flex-col items-center justify-center min-h-screen px-4 text-center space-y-6">
      {/* Removed unused Alert and Button components */}
    </div>
  );
};

export default EventNotFound;
