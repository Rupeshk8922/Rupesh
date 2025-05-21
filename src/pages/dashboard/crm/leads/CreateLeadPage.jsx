import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/authContext';
import { useToast } from '@/components/ui/use-toast';
import { getOfficers } from '../../../services/userService';
import { db } from '../../../../firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

const CreateLeadPage = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, userRole, loading: authLoading } = useAuth();

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    company: '',
    status: 'New',
    source: '',
    interestLevel: 'Warm',
    assignedOfficer: '',
    notes: '',
  });

  const [formErrors, setFormErrors] = useState({});
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [submissionError, setSubmissionError] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [officers, setOfficers] = useState([]);

  // Role-based access control
  useEffect(() => {
    if (!authLoading && (!user || (userRole !== 'admin' && userRole !== 'officer'))) {
      navigate('/access-denied');
    }
  }, [user, userRole, authLoading, navigate]);

  // Loading spinner while auth loading or user is null
  if (authLoading || (!user && !authLoading)) {
    return <div>Loading...</div>;
  }

  // Fetch officers list once on mount
  useEffect(() => {
    getOfficers()
      .then(setOfficers)
      .catch((error) => {
        console.error('Failed to fetch officers:', error);
        toast({
          title: 'Error fetching officers',
          description: 'Could not load officers for assignment.',
          variant: 'destructive',
        });
      });
  }, [toast]);

  // Handle input changes (works for inputs and Select onValueChange)
  const handleInputChange = (e) => {
    // For regular input elements, 'e' will be the event object
    // For Select components, the 'value' is passed directly
    const { name, value } = e.target || { name: e.name, value: e.value }; // Adjust for Select
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  };

  // Form validation
  const validateForm = () => {
    const errors = {};
    // Phone regex: digits only, min 10 digits
    const phoneRegex = /^\d{10,}$/;
    // Basic email regex
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    if (!formData.name.trim()) {
      errors.name = 'Full Name is required.';
    }

    if (!formData.phone.trim()) {
      errors.phone = 'Phone number is required.';
    } else if (!phoneRegex.test(formData.phone)) {
      errors.phone = 'Phone number must contain at least 10 digits.';
    }

    if (formData.email.trim() && !emailRegex.test(formData.email)) {
      errors.email = 'Invalid email format.';
    }

    return errors;
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();

    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors in the form.',
        variant: 'destructive',
      });
      return;
    }

    setSubmissionLoading(true);
    setSubmissionError(null);
    setFormErrors({});

    const createdByUid = user?.uid;
    const createdByName = user?.displayName || user?.email;
    const assignedOfficerUid = formData.assignedOfficer || null;

    const leadData = {
      name: formData.name,
      email: formData.email,
      phone: formData.phone,
      company: formData.company,
      status: formData.status || 'New',
      source: formData.source,
      interestLevel: formData.interestLevel || 'Warm',
      createdAt: Timestamp.now(),
      createdByUid,
      createdByName,
      assignedOfficerUid,
      companyId: user?.companyId || null,
      notes: formData.notes,
    };

    try {
      await addDoc(collection(db, 'leads'), leadData);

      setCreateSuccess(true);
      toast({
        title: 'Lead Created',
        description: 'New lead has been created successfully.',
        variant: 'default',
      });

      // Optionally reset form after success
      setFormData({
        name: '',
        email: '',
        phone: '',
        company: '',
        status: 'New',
        source: '',
        interestLevel: 'Warm',
        assignedOfficer: '',
        notes: '',
      });

      // Navigate or do something else after creation if needed
      // navigate('/dashboard/leads');
    } catch (error) {
      console.error('Error adding lead:', error);
      setSubmissionError('Failed to create lead. Please try again.');
      toast({
        title: 'Submission Error',
        description: 'Failed to create lead. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSubmissionLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto shadow-md">
      <h1 className="text-2xl font-bold mb-4">Create New Lead</h1>

      {createSuccess && (
        <p className="mb-4 text-green-600 font-semibold">Lead created successfully!</p>
      )}

      {submissionError && (
        <p className="mb-4 text-red-600 font-semibold">{submissionError}</p>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Name */}
        <div>
          <Label htmlFor="name">Full Name</Label>
          <Input
            name="name"
            id="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={submissionLoading}
            className={formErrors.name ? 'border-red-500' : ''}
          />
          {formErrors.name && (
            <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
          )}
        </div>
        {/* Email */}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            name="email"
            type="email"
            id="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={submissionLoading}
            className={formErrors.email ? 'border-red-500' : ''}
          />
          {formErrors.email && (
            <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
          )}
        </div>
        {/* Phone */}
        <div>
          <Label htmlFor="phone">Phone Number</Label>
          <Input
            type="tel"
            name="phone"
            id="phone"
            value={formData.phone}
            onChange={handleInputChange}
            disabled={submissionLoading}
            className={formErrors.phone ? 'border-red-500' : ''}
          />
          {formErrors.phone && (
            <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
          )}
        </div>
        {/* Location/Area */}
        <div>
          <Label htmlFor="company">Company (Optional)</Label>
          <Input
            name="company"
            id="company"
            value={formData.company}
            onChange={handleInputChange}
            disabled={submissionLoading}
          />
        </div>
        {/* Assigned Officer */}
        <div>
          <Label htmlFor="assignedOfficer">Assigned Officer</Label>
          <Select
            onValueChange={(value) =>
              handleInputChange({ name: 'assignedOfficer', value }) // Pass object for Select
            }
            value={formData.assignedOfficer}
            disabled={submissionLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an officer" />
            </SelectTrigger>
            <SelectContent>
              {officers.map((officer) => (
                <SelectItem key={officer.uid} value={officer.uid}>
                  {officer.displayName}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        {/* Status */}
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            onValueChange={(value) =>
              handleInputChange({ name: 'status', value })
            }
            value={formData.status}
            disabled={submissionLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select status" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="New">New</SelectItem>
              <SelectItem value="Contacted">Contacted</SelectItem>
              <SelectItem value="Qualified">Qualified</SelectItem>
              <SelectItem value="Unqualified">Unqualified</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Source */}
        <div>
          <Label htmlFor="source">Source (e.g., Website, Referral)</Label>
          <Input
            name="source"
            id="source"
            value={formData.source}
            onChange={handleInputChange}
            disabled={submissionLoading}
          />
        </div>
        {/* Interest Level */}
        <div>
          <Label htmlFor="interestLevel">Interest Level</Label>
          <Select
            onValueChange={(value) =>
              handleInputChange({ name: 'interestLevel', value })
            }
            value={formData.interestLevel}
            disabled={submissionLoading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select interest level" />
            </SelectTrigger>

            <SelectContent>
              <SelectItem value="Warm">Warm</SelectItem>
              <SelectItem value="Cold">Cold</SelectItem>
              <SelectItem value="Hot">Hot</SelectItem>
            </SelectContent>
          </Select>
        </div>
        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notes</Label>
          <Input
            name="notes"
            id="notes"
            value={formData.notes}
            onChange={handleInputChange}
            disabled={submissionLoading}
          />
        </div>
        {/* Submit Button */}
        <Button type="submit" disabled={submissionLoading}>
          {submissionLoading ? 'Creating...' : 'Create Lead'}
        </Button>
      </form>
    </Card>
  );
};

export default CreateLeadPage;