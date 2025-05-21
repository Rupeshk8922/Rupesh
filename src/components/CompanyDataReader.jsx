import PropTypes from 'prop-types';
import { useFetchCompanyData } from '../hooks/useFetchCompanyData.jsx';

function CompanyDataReader({ companyId }) {
  // Fetch company data using the custom hook
  const { companyData, loading, error } = useFetchCompanyData(companyId);

  // Handle loading state
  if (loading) {
    return (
      <div className="p-4 text-gray-500 animate-pulse">
        {/* You can replace this with a more visually appealing spinner */}
        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-gray-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l2-2.647z"></path>
        </svg>
        Loading company data...
      </div>
    );
  }

  // Handle error state
  if (error) {
    return (
      <div className="p-4 text-red-600 bg-red-100 rounded-md">
        Error loading company data: {error.message}
      </div>
    );
  }

  // Handle case where no company data is found after loading
  if (!companyData || Object.keys(companyData).length === 0) {
    return (
      <div className="p-4 text-yellow-600 bg-yellow-100 rounded-md">
        No company data found.
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-md">
      <h2 className="text-2xl font-bold mb-4">Company Information</h2>
      <p><strong>Company Name:</strong> {companyData.name}</p>
      <p><strong>Email:</strong> {companyData.email}</p>
      <p><strong>Created At:</strong> {companyData.createdAt?.toDate().toLocaleString()}</p>
      {/* Add more fields as needed */}
    </div>
  );
}

CompanyDataReader.propTypes = {
  companyId: PropTypes.string.isRequired,
};

export default CompanyDataReader;
