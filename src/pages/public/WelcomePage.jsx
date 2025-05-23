import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

const WelcomePage = () => {
  return (
    <div className="min-h-screen flex flex-col justify-center items-center bg-gray-50 px-4">
      <div className="text-center space-y-6">
        <h1 className="text-4xl font-bold text-gray-800">Welcome to Empact CRM</h1>
        <p className="text-gray-600 text-lg max-w-md mx-auto">
          Empower your outreach and project management with our all-in-one platform for companies, NGOs, and volunteers.
        </p>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/login">
            <Button variant="default" className="w-40">Login</Button>
          </Link>
          <Link to="/signup">
            <Button variant="outline" className="w-40">Sign Up</Button>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WelcomePage;
