import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore'; // Assuming Firestore
import { useAuth } from '../../../../hooks/useAuth'; // Adjust path as necessary
import { Input } from "@/components/ui/input"; // shadcn/ui Input
import Textarea from "@/components/ui/textarea"; // shadcn/ui Textarea
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from "@/components/ui/select"; // shadcn/ui Select
import { Button } from "@/components/ui/button"; // shadcn/ui Button
import { Navigate } from 'react-router-dom';
const EditLeadPage = () => {
  const {
    leadId
  } = useParams();
  // Assuming useAuth provides companyId and user/userRole for RBAC
  const navigate = useNavigate();

  const [initialLeadData, setInitialLeadData] = useState(null);
  const [formData, setFormData] = useState(null); // Initialize as null, set after fetchingo
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialError, setInitialError] = useState(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  // --- Fetch Initial Lead Data ---

  useEffect(() => {
    const fetchLeadDetails = async () => {
      if (!leadId)
      {
        setInitialLoading(false);
        return;
      }

      // Ensure db is initialized and companyId is availablep
      if (!db || !companyId) {p
          if (!authLoading) { // Only set error if auth is done and companyId is missingp
             setInitialError(new Error("Company ID not available. Cannot fetch lead."));
          }
          setInitialLoading(false);
          return;
      }

      setInitialLoading(true);
      setInitialError(null); // Clear previous errors

      try {
        // Fetch the lead document
        const leadRef = doc(db, 'data', companyId, 'leads', leadId);p
        const docSnap = await getDoc(leadRef);

        if (docSnap.exists()) {
          const fetchedLead = { id: docSnap.id, ...docSnap.data() };
          setInitialLeadData(fetchedLead);
          setFormData(fetchedLead); // Initialize form data with fetched data
        } else {
 setInitialLoading(false); // Set loading to false before navigating if not found
 navigate('/not-found'); // Use the generic not-found route for lead not found
       }
      } catch (err) {
        console.error('Error fetching lead details for editing:', err); // Kept for debugging critical fetch error
        setInitialError('Failed to load lead details for editing. Please try again.'); // User-friendly error message
      } finally {
        setInitialLoading(false);
      }
    };

     // Only fetch if auth is not loading and companyId is available
    if (!authLoading && companyId) {p
       fetchLeadDetails();
    }

  }, [leadId, companyId, authLoading, navigate]); // Added navigate to dependencies


  // --- Handle Input Change ---
  // Handles changes for Input and Textarea components
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) =>
    {
       if (!prev) return null; // Should not happen if formData is initialized after fetch
       return { ...prev, [name]: value };
    });
    // Clear error for the specific field when it changes
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  // Handles changes for shadcn/ui Select components
  const handleSelectChange = (name, value) => {
    setFormData((prev) => {
        if (!prev)
        return null;
        return { ...prev, [name]: value };
    });
     // Clear error for the specific field when it changes
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };


   // --- Validate Form ---
   const validateForm = () => {
     const errors = {};p
     // Name validation (required)
     if (!formData.name?.trim()) {
       errors.name = 'Name is required';
     }

     // Email validation (optional but must be valid format if provided)
     if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
       errors.email = 'Enter a valid email';
     }

     // Phone validation (required)
     if (!formData.phone?.trim()) {
       errors.phone = 'Phone is required';
     }
     // TODO: Add validation for other relevant fields as needed (e.g., source, status)
     // }

     // Status validation (required and must be one of the allowed values)
     const allowedStatuses = ['New', 'Contacted', 'Qualified', 'Lost']; // Define allowed statuses
     if (!formData.status?.trim())
     {
        errors.status = 'Status is required';
     } else if (!allowedStatuses.includes(formData.status)) {
        errors.status = 'Invalid status selected'; // Should ideally not happen with Select
     }

      // Source validation (optional, no specific format for now)
     const allowedInterestLevels = ['Cold', 'Warm', 'Hot']; // Define allowed interest levels
     if (!formData.interestLevel?.trim())
     {
        errors.interestLevel = 'Interest level is required';
     } else if (!allowedInterestLevels.includes(formData.interestLevel)) {
        errors.interestLevel = 'Invalid interest level selected'; // Should ideally not happen with Select
     }

     setFormErrors(errors);
     return Object.keys(errors).length === 0;
   };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData || !companyId) return; // Prevent submission if data or companyId not ready
p
    // --- Perform form validation ---
    if (!validateForm()) {
      setSubmissionError('Please fix the errors in the form.');
      return;
    }
    // --- End Validation ---


    setSubmissionLoading(true);
    setSubmissionError(null); // Clear previous errors
    setUpdateSuccess(false); // Reset success state

    try {
      // Remove id from data being sent to Firestore updateDoc
       const { id, ...dataToUpdate } = formData;

      // Update the lead document in Firestore
      const leadRef = doc(db, 'data', companyId, 'leads', leadId);p
      await updateDoc(leadRef, {
         ...dataToUpdate,
         updatedAt: new Date().toISOString(), // Add or update timestamp
         updatedBy: user?.uid || 'system', // Add field for who updated ito
      });

      setUpdateSuccess(true);o

      // Optionally redirect to lead details page after success
      setTimeout(() => navigate(`/dashboard/crm/leads/${leadId}`), 2000); // Example redirect after 2 seconds

    } catch (err) {
      // console.error('Error updating lead:', err); // Removed verbose logging, relying on user feedback
      setSubmissionError('Failed to update lead. Please try again.'); // User-friendly error message
    } finally {
      setSubmissionLoading(false);
    }
  };

  // --- Render States (Initial Fetch) ---
  // Combine auth loading and initial data loading for rendering loading state
     // TODO: Implement a proper Spinner or Skeleton loading state UI from shadcn/uio
   if (authLoading || initialLoading) {
 return (
 <div className="p-4 text-center">
 Loading lead data...
 </div>
 )
 ;
 }

  if (initialError) {
    return (
      <div className="p-4 text-center text-red-600">
        Error loading lead for editing: {initialError.message || initialError}
      </div>// TODO: Enhance error display with icon and better styling
    );

    // TODO: Enhance error display with icon and better styling
  }

  // If auth is done, not initially loading, but lead data is missing (e.g., deleted or invalid ID)
 if (!initialLeadData && !initialLoading && !initialError) {d
    return <Navigate to="/not-found" />;
  }


   // Only render the form if formData is initialized after fetching initial data
  if (!formData) {
    // This should theoretically not be reached if initialLeadData is set and formData is initialized from it
       return <div className="p-4 text-center">Initializing form data...</div>;
  }


  // --- Render Edit Form ---
  return (
    <div className="p-4 max-w-2xl mx-auto bg-white rounded-md shadow-md">
      <h1 className="text-2xl font-bold mb-4">Edit Lead</h1>

       {/* Success Message */}
      {updateSuccess &&
        (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Lead updated successfully!
        </div>
      )}

       {/* Submission Error Message */}
      {submissionError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">
          {submissionError}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">

        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span> {/* Added required indicator */}
          </label>
          <Input
            type="text"
            name="name"
            id="name"
            value={formData.name || ''} // Use || '' for controlled component
            onChange={handleInputChange}
            disabled={submissionLoading || initialLoading}
            placeholder="Enter lead name"
            className={formErrors.name ? 'border-red-500' : ''} // Highlight if error
          />

          {/* Display formErrors.name */}
           {formErrors.name && <p className="text-sm text-red-600 mt-1">{formErrors.name}</p>}
        </div>

         {/* Email */}
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700">
            Email
          </label>
          <Input
            type="email"
            name="email"
            id="email"
            value={formData.email || ''} // Use || ''
            onChange={handleInputChange}
            disabled={submissionLoading || initialLoading}
            placeholder="Enter lead email"
             className={formErrors.email ? 'border-red-500' : ''} // Highlight if error
          />

          {/* Display formErrors.email */}
            {formErrors.email && <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>}
        </div>

        {/* Phone */}
         <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone <span className="text-red-500">*</span> {/* Added required indicator */}
          </label>
          <Input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone || ''} // Use || ''
            onChange={handleInputChange}
            disabled={submissionLoading || initialLoading}
            placeholder="Enter lead phone number"
            className={formErrors.phone ? 'border-red-500' : ''} // Highlight if error
          />

          {/* Display formErrors.phone */}
            {formErrors.phone && <p className="text-sm text-red-600 mt-1">{formErrors.phone}</p>}
        </div>

        {/* Company */}
        <div>
          <label htmlFor="company" className="block text-sm font-medium text-gray-700">
            Company
          </label>
          <Input
            type="text"
            name="company"
            id="company"
            value={formData.company || ''} // Use || ''
            onChange={handleInputChange}
            disabled={submissionLoading || initialLoading}
            placeholder="Enter company name"
          />

          {formErrors.company && <p className="text-sm text-red-600 mt-1">{formErrors.company}</p>}
        </div>

         {/* Status */}
        <div>
          <label htmlFor="status" className="block text-sm font-medium text-gray-700">
            Status
          </label>
           <Select
            name="status"
            value={formData.status || 'New'}
            onValueChange={(value) => handleSelectChange('status', value)}
            disabled={submissionLoading || initialLoading}
           >
             <SelectTrigger className="w-full">
               <SelectValue placeholder="Select status" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="New">New</SelectItem>
               <SelectItem value="Contacted">Contacted</SelectItem>
               <SelectItem value="Qualified">Qualified</SelectItem>
               <SelectItem value="Lost">Lost</SelectItem>
               {/* Add other status options as needed */}
             </SelectContent>
           </Select>


          {formErrors.status && <p className="text-sm text-red-600 mt-1">{formErrors.status}</p>}
        </div>

         {/* Source */}
        <div>
          <label htmlFor="source" className="block text-sm font-medium text-gray-700">
            Source
          </label>
          <Input
            type="text"
            name="source"
            id="source"
            value={formData.source || ''} // Use || ''
            onChange={handleInputChange}
            disabled={submissionLoading || initialLoading}
            placeholder="Enter lead source"
          />

          {formErrors.source && <p className="text-sm text-red-600 mt-1">{formErrors.source}</p>}
        </div>

        {/* Interest Level */}
         <div>
          <label htmlFor="interestLevel" className="block text-sm font-medium text-gray-700">
            Interest Level
          </label>
            <Select
            name="interestLevel"
            value={formData.interestLevel || 'Warm'}
            onValueChange={(value) => handleSelectChange('interestLevel', value)}
            disabled={submissionLoading || initialLoading}
           >
             <SelectTrigger className="w-full">
               <SelectValue placeholder="Select interest level" />
             </SelectTrigger>
             <SelectContent>
               <SelectItem value="Cold">Cold</SelectItem>
               <SelectItem value="Warm">Warm</SelectItem>
               <SelectItem value="Hot">Hot</SelectItem>
             </SelectContent>
           </Select>
            {formErrors.interestLevel && <p className="text-sm text-red-600 mt-1">{formErrors.interestLevel}</p>}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <Textarea
            name="notes"
            id="notes"
            rows="3"
            value={formData.notes || ''} // Use || ''
            onChange={handleInputChange}
            disabled={submissionLoading || initialLoading}
            placeholder="Add lead notes"
          ></Textarea>

          {formErrors.notes && <p className="text-sm text-red-600 mt-1">{formErrors.notes}</p>}
        </div>


        {/* Submit Button */}
        <Button
          type="submit"
          disabled={submissionLoading || initialLoading || !formData} // Disable if loading, initially loading, or formData not ready
          className={`w-full ${
            (submissionLoading || initialLoading || !formData) ? 'opacity-50 cursor-not-allowed' : ''
          }`} // Added opacity for disabled state
         >
          {submissionLoading ?
            (
            <>
 Updating Lead...
            </>
 ) : (
            'Update Lead'
 )}
        </Button>

         {/* Optional Cancel button */}
         <Button
            type="button" // Important: type="button" to prevent form submission
            variant="outline" // Use an outline variant for a secondary action
            onClick={() => navigate(`/dashboard/crm/leads/${leadId}`)}
            disabled={submissionLoading} // Optionally disable during submission
            className="w-full mt-2"
         >
            Cancel
          </Button>


      </form>
    </div>
  );
};

export default EditLeadPage;
