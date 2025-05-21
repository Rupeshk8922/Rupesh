import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFirestore, doc, setDoc, getDoc } from "firebase/firestore";
// import { createHash } from "crypto-js"; // Removed hashing import

const db = getFirestore();

export default function RegisterCompany() {
  const [companyName, setCompanyName] = useState("");
  const [password, setPassword] = useState("");
  const [numEmployees, setNumEmployees] = useState("");
  const [error, setError] = useState("");
  const [contactNumber, setContactNumber] = useState(""); // Restored contactNumber state
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleRegister = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Basic Input Validation



    const companyId = companyName.trim().toLowerCase().replace(/\s+/g, "_");
    // const hashedPassword = createHash('sha256').update(password).toString(); // Removed hashing


    try {
      const companyRef = doc(db, "companies", companyId);
      const companySnap = await getDoc(companyRef);

      if (companySnap.exists()) {
        setError("Company name already exists. Please choose a different name.");
        setLoading(false);
        return;
      }

      // Step 1: Register company
      await setDoc(companyRef, {
        companyName,
        companyId,
        password: password, // Store password without hashing
        numEmployees, // Restored numEmployees
        pocEmail: "admin@example.com", // Restore original pocEmail or use a state if available
        contactNumber, // Restored contactNumber
        plan: "free",
        createdAt: new Date().toISOString(),
      });

      // Step 2: Add default admin user (POC)
      const adminRef = doc(db, `companies/${companyId}/users`, contactNumber); // Restore original admin document path
      await setDoc(adminRef, {
        name: "Admin", // You might want to use a state variable for this
        role: "Admin",
        // Removed password for admin here, assuming admin login will use company password
      });

      // Step 3: Navigate to dashboard/login
      localStorage.setItem(
        "user",
        JSON.stringify({
          company: companyId,
          role: "Admin",
          plan: "free",
          phone: contactNumber, // Restore phone
        })
);

      // Clear form fields
      setCompanyName("");
      setPassword("");
      setNumEmployees("");

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
        <h2 className="text-2xl font-bold mb-4 text-center">Register Company</h2>
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

        <input // Restored numEmployees input
          className="input-field mb-3 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-100"
          type="number"
          placeholder="Number of Employees"
          value={numEmployees}
          onChange={(e) => setNumEmployees(e.target.value)}
          required
          disabled={loading}
        />

         <input // Restored contactNumber input
          className="input-field mb-3 w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring focus:ring-blue-100"
          type="tel"
          placeholder="POC Contact Number"
          value={contactNumber}
          onChange={(e) => setContactNumber(e.target.value)}
          required
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