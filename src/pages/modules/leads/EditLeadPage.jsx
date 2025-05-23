import { useState, useEffect } from 'react';
import { useParams, useNavigate, Navigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../../../../hooks/useAuth'; // Adjust path if needed
import { db } from '../../../../firebase/config';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectTrigger, SelectContent, SelectItem, SelectValue } from '@/components/ui/select';
import { Button } from '@/components/ui/button';

// Assume 'db' (Firestore instance) and 'useAuth' hook are properly imported/set

const EditLeadPage = () => {
  const { leadId } = useParams();
  const navigate = useNavigate();
  const { user, companyId, authLoading } = useAuth(); // You must extract these from your useAuth hook

  const [initialLeadData, setInitialLeadData] = useState(null);
  const [formData, setFormData] = useState(null);
  const [formErrors, setFormErrors] = useState({});
  const [initialLoading, setInitialLoading] = useState(true);
  const [initialError, setInitialError] = useState(null);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  useEffect(() => {
    const fetchLeadDetails = async () => {
      if (!leadId) {
        setInitialLoading(false);
        return;
      }

      if (!db || !companyId) {
        if (!authLoading) {
          setInitialError(new Error('Company ID not available. Cannot fetch lead.'));
        }
        setInitialLoading(false);
        return;
      }

      setInitialLoading(true);
      setInitialError(null);

      try {
        const leadRef = doc(db, 'data', companyId, 'leads', leadId);
        const docSnap = await getDoc(leadRef);

        if (docSnap.exists()) {
          const fetchedLead = { id: docSnap.id, ...docSnap.data() };
          setInitialLeadData(fetchedLead);
          setFormData(fetchedLead);
        } else {
          setInitialLoading(false);
          navigate('/not-found');
        }
      } catch (err) {
        console.error('Error fetching lead details for editing:', err);
        setInitialError('Failed to load lead details for editing. Please try again.');
      } finally {
        setInitialLoading(false);
      }
    };

    if (!authLoading && companyId) {
      fetchLeadDetails();
    }
  }, [leadId, companyId, authLoading, navigate]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const handleSelectChange = (name, value) => {
    setFormData((prev) => (prev ? { ...prev, [name]: value } : null));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    }
  };

  const validateForm = () => {
    const errors = {};

    if (!formData?.name?.trim()) {
      errors.name = 'Name is required';
    }

    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      errors.email = 'Enter a valid email';
    }

    if (!formData?.phone?.trim()) {
      errors.phone = 'Phone is required';
    }

    const allowedStatuses = ['New', 'Contacted', 'Qualified', 'Lost'];
    if (!formData?.status?.trim()) {
      errors.status = 'Status is required';
    } else if (!allowedStatuses.includes(formData.status)) {
      errors.status = 'Invalid status selected';
    }

    const allowedInterestLevels = ['Cold', 'Warm', 'Hot'];
    if (!formData?.interestLevel?.trim()) {
      errors.interestLevel = 'Interest level is required';
    } else if (!allowedInterestLevels.includes(formData.interestLevel)) {
      errors.interestLevel = 'Invalid interest level selected';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData || !companyId) return;

    if (!validateForm()) {
      setSubmissionError('Please fix the errors in the form.');
      return;
    }

    setSubmissionLoading(true);
    setSubmissionError(null);
    setUpdateSuccess(false);

    try {
      const { ...dataToUpdate } = formData;
      const leadRef = doc(db, 'data', companyId, 'leads', leadId);

      await updateDoc(leadRef, {
        ...dataToUpdate,
        updatedAt: new Date().toISOString(),
        updatedBy: user?.uid || 'system',
      });

      setUpdateSuccess(true);

      setTimeout(() => navigate(`/dashboard/crm/leads/${leadId}`), 2000);
    } catch {
      setSubmissionError('Failed to update lead. Please try again.');
    } finally {
      setSubmissionLoading(false);
    }
  };

  if (authLoading || initialLoading) {
    return <div className="p-4 text-center">Loading lead data...</div>;
  }

  if (initialError) {
    return (
      <div className="p-4 text-center text-red-600">
        Error loading lead for editing: {initialError.message || initialError}
      </div>
    );
  }

  if (!initialLeadData && !initialLoading && !initialError) {
    return <Navigate to="/not-found" />;
  }

  if (!formData) {
    return <div className="p-4 text-center">Initializing form data...</div>;
  }

  return (
    <div className="p-4 max-w-2xl mx-auto bg-white rounded-md shadow-md">
      <h1 className="text-2xl font-bold mb-4">Edit Lead</h1>

      {updateSuccess && (
        <div className="mb-4 p-3 bg-green-100 text-green-700 rounded">
          Lead updated successfully!
        </div>
      )}

      {submissionError && (
        <div className="mb-4 p-3 bg-red-100 text-red-700 rounded">{submissionError}</div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name */}
        <div>
          <label htmlFor="name" className="block text-sm font-medium text-gray-700">
            Name <span className="text-red-500">*</span>
          </label>
          <Input
            type="text"
            name="name"
            id="name"
            value={formData.name || ''}
            onChange={handleInputChange}
            disabled={submissionLoading || initialLoading}
            placeholder="Enter lead name"
            className={formErrors.name ? 'border-red-500' : ''}
          />
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
            value={formData.email || ''}
            onChange={handleInputChange}
            disabled={submissionLoading || initialLoading}
            placeholder="Enter lead email"
            className={formErrors.email ? 'border-red-500' : ''}
          />
          {formErrors.email && <p className="text-sm text-red-600 mt-1">{formErrors.email}</p>}
        </div>

        {/* Phone */}
        <div>
          <label htmlFor="phone" className="block text-sm font-medium text-gray-700">
            Phone <span className="text-red-500">*</span>
          </label>
          <Input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone || ''}
            onChange={handleInputChange}
            disabled={submissionLoading || initialLoading}
            placeholder="Enter lead phone number"
            className={formErrors.phone ? 'border-red-500' : ''}
          />
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
            value={formData.company || ''}
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
            value={formData.status || ''}
            onValueChange={(value) => handleSelectChange('status', value)}
            disabled={submissionLoading || initialLoading}
          >
            <SelectTrigger className={`w-full ${formErrors.status ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>
            <SelectContent>
              {['New', 'Contacted', 'Qualified', 'Lost'].map((status) => (
                <SelectItem key={status} value={status}>
                  {status}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.status && <p className="text-sm text-red-600 mt-1">{formErrors.status}</p>}
        </div>

        {/* Interest Level */}
        <div>
          <label htmlFor="interestLevel" className="block text-sm font-medium text-gray-700">
            Interest Level
          </label>
          <Select
            name="interestLevel"
            value={formData.interestLevel || ''}
            onValueChange={(value) => handleSelectChange('interestLevel', value)}
            disabled={submissionLoading || initialLoading}
          >
            <SelectTrigger className={`w-full ${formErrors.interestLevel ? 'border-red-500' : ''}`}>
              <SelectValue placeholder="Select interest level" />
            </SelectTrigger>
            <SelectContent>
              {['Cold', 'Warm', 'Hot'].map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          {formErrors.interestLevel && (
            <p className="text-sm text-red-600 mt-1">{formErrors.interestLevel}</p>
          )}
        </div>

        {/* Notes */}
        <div>
          <label htmlFor="notes" className="block text-sm font-medium text-gray-700">
            Notes
          </label>
          <Textarea
            name="notes"
            id="notes"
            value={formData.notes || ''}
            onChange={handleInputChange}
            disabled={submissionLoading || initialLoading}
            placeholder="Additional notes"
            rows={4}
          />
        </div>

        {/* Submit button */}
        <div>
          <Button type="submit" disabled={submissionLoading}>
            {submissionLoading ? 'Updating...' : 'Update Lead'}
          </Button>
        </div>
      </form>
    </div>
  );
};

export default EditLeadPage;

