import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useCompanyLogin } from "../hooks/useCompanyLogin";
import useModal from "../hooks/useModal";
import { roleDashboardPaths } from "../routesConfig";

import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";

const LoginPage = () => {
  const { isLoading, error, login, sendPasswordReset, role } = useCompanyLogin();
  const navigate = useNavigate();
  const { showModal } = useModal();

  const [localEmail, setLocalEmail] = useState("");
  const [localPassword, setLocalPassword] = useState("");
  const [formValidationErrors, setFormValidationErrors] = useState({});

  useEffect(() => {
    if (role) {
      const dashboardPath = roleDashboardPaths[role] || "/dashboard";
      navigate(dashboardPath);
    }
  }, [role, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formErrors = {};
    if (!localEmail.trim()) formErrors.email = "Email is required";
    if (!localPassword.trim()) formErrors.password = "Password is required";

    setFormValidationErrors(formErrors);

    if (Object.keys(formErrors).length === 0) {
      try {
        await login(localEmail, localPassword);
      } catch (err) {
        console.error("Error in LoginPage handleSubmit:", err);
      }
    }
  };

  const handlePasswordReset = () => {
    if (!localEmail.trim()) {
      setFormValidationErrors((prev) => ({
        ...prev,
        email: "Please enter your email to reset password",
      }));
    } else {
      sendPasswordReset(localEmail);
      showModal("A password reset link has been sent to your email.");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      className="max-w-md mx-auto mt-10 p-6 space-y-6 border border-gray-200 rounded-xl shadow-md"
    >
      <h2 className="text-2xl font-semibold text-center">Login</h2>

      <div className="space-y-1">
        <Label htmlFor="email">Email</Label>
        <Input
          id="email"
          type="email"
          autoComplete="email"
          placeholder="Enter your email"
          value={localEmail}
          onChange={(e) => {
            setLocalEmail(e.target.value);
            setFormValidationErrors((prev) => ({
              ...prev,
              email: undefined,
            }));
          }}
        />
        {formValidationErrors.email && (
          <p className="text-red-600 text-sm" aria-live="polite">
            {formValidationErrors.email}
          </p>
        )}
      </div>

      <div className="space-y-1">
        <Label htmlFor="password">Password</Label>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Enter your password"
          value={localPassword}
          onChange={(e) => {
            setLocalPassword(e.target.value);
            setFormValidationErrors((prev) => ({
              ...prev,
              password: undefined,
            }));
          }}
        />
        {formValidationErrors.password && (
          <p className="text-red-600 text-sm" aria-live="polite">
            {formValidationErrors.password}
          </p>
        )}
      </div>

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Spinner size="sm" className="mr-2" /> Logging in...
          </>
        ) : (
          "Login"
        )}
      </Button>

      <p className="text-center">
        <button
          type="button"
          onClick={handlePasswordReset}
          className="text-blue-600 underline"
        >
          Forgot Password?
        </button>
      </p>

      {error && (
        <div className="text-red-700 bg-red-100 p-3 rounded text-center" aria-live="polite">
          {error}
        </div>
      )}

      <p className="text-center text-sm mt-4">
        Don’t have an account?{" "}
        <Link to="/signup" className="text-blue-600 underline">
          Sign up
        </Link>
      </p>
    </form>
  );
};

export default LoginPage;
