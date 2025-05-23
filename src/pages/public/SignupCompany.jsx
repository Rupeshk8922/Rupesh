import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";

const db = getFirestore();

export default function RegisterCompany() {
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [numEmployees, setNumEmployees] = useState("");
  const [contactNumber, setContactNumber] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic input validation
    if (
      !companyName.trim() ||
      !password.trim() ||
      !numEmployees ||
      !contactNumber.trim()
    ) {
      setError("Please fill in all fields.");
      setLoading(false);
      return;
    }

    if (numEmployees <= 0) {
      setError("Number of employees must be greater than zero.");
      setLoading(false);
      return;
    }

    // Create companyId by normalizing companyName
    const companyId = companyName.trim().toLowerCase().replace(/\s+/g, "_");

    try {
      // Check if company already exists
      const companyRef = doc(db, "companies", companyId);
      const companySnap = await getDoc(companyRef);

      if (companySnap.exists()) {
        setError(
          "Company name already exists. Please choose a different name."
        );
        setLoading(false);
        return;
      }

      // Register company document
      await setDoc(companyRef, {
        companyName,
        companyId,
        password, // Stored as plain text here - consider adding hashing in production
        numEmployees,
        pocEmail: "admin@example.com", // Default placeholder
        contactNumber,
        plan: "free",
        createdAt: new Date().toISOString(),
      });

      // Create default admin user under the company
      const adminRef = doc(db, `companies/${companyId}/users`, contactNumber);
      await setDoc(adminRef, {
        name: "Admin",
        role: "Admin",
        // No password stored here, admin login uses company password
      });

      // Save user info locally for session or login state
      localStorage.setItem(
        "user",
        JSON.stringify({
          company: companyId,
          role: "Admin",
          plan: "free",
          phone: contactNumber,
        })
      );

      // Clear form fields
      setCompanyName("");
      setPassword("");
      setNumEmployees("");
      setContactNumber("");

      // Redirect to admin dashboard after registration
      navigate("/admin-dashboard");
    } catch (err) {
      console.error("Registration failed:", err);
      setError("Failed to register company. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <form
        onSubmit={handleRegister}
        className="bg-white shadow-md p-6 rounded w-full max-w-md"
      >
        <h2 className="text-2xl font-bold mb-4 text-center">
          Register Company
        </h2>
        {error && <p className="text-red-600 text-sm mb-4">{error}</p>}

        <input
          className="input-field mb-3 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-100"
          type="text"
          placeholder="Company Name"
          value={companyName}
          onChange={(e) => setCompanyName(e.target.value)}
          required
          disabled={loading}
        />

        <input
          className="input-field mb-3 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-100"
          type="password"
          placeholder="Set Company Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          disabled={loading}
        />

        <input
          className="input-field mb-3 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-100"
          type="number"
          min="1"
          placeholder="Number of Employees"
          value={numEmployees}
          onChange={(e) => setNumEmployees(e.target.value)}
          required
          disabled={loading}
        />

        <input
          className="input-field mb-3 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-100"
          type="tel"
          placeholder="POC Contact Number"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          required
          disabled={loading}
        />

        <button
          type="submit"
          className={`w-full bg-blue-600 text-white py-2 mt-4 rounded ${
            loading ? "opacity-50 cursor-not-allowed" : "hover:bg-blue-700"
          }`}
          disabled={loading}
        >
          {loading ? "Registering..." : "Register Company"}
        </button>
      </form>
    </div>
  );
}
