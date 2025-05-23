import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../../../contexts/authContext';
import { useToast } from '@/components/ui/use-toast';
import { getOfficers } from '../../../services/userService';
import { db } from '../../../../firebase/config';
import { collection, addDoc, Timestamp } from 'firebase/firestore';

import { Card } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select, SelectTrigger, SelectValue, SelectContent, SelectItem,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';


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
  const [loading, setLoading] = useState(false);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [officers, setOfficers] = useState([]);

  // Redirect unauthorized users
  useEffect(() => {
    if (!authLoading) {
      if (!user || !['admin', 'officer'].includes(userRole)) {
        navigate('/access-denied');
      }
    }
  }, [user, userRole, authLoading, navigate]);

  // Show loading while authenticating
  if (authLoading || (!user && !authLoading)) {
    return <div>Loading...</div>;
  }

  // Fetch officers list once on mount
  useEffect(() => {
    getOfficers()
      .then(setOfficers)
      .catch((err) => {
        console.error('Error fetching officers:', err);
        toast({
          title: 'Error loading officers',
          description: 'Unable to fetch officers for assignment.',
          variant: 'destructive',
        });
      });
  }, [toast]);

  // Unified input change handler for inputs & selects
  const handleInputChange = useCallback((e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setFormErrors((prev) => ({ ...prev, [name]: null }));
  }, []);

  // Separate handler for Select onValueChange to pass name explicitly
  const handleSelectChange = useCallback(
    (name, value) => {
      setFormData((prev) => ({ ...prev, [name]: value }));
      setFormErrors((prev) => ({ ...prev, [name]: null }));
    },
    []
  );

  // Validate form fields
  const validateForm = () => {
    const errors = {};
    const phoneRegex = /^\d{10,}$/;
    const emailRegex = /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i;

    if (!formData.name.trim()) errors.name = 'Full Name is required.';
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

  // Form submit handler
  const handleSubmit = async (e) => {
    e.preventDefault();

    const errors = validateForm();
    if (Object.keys(errors).length > 0) {
      setFormErrors(errors);
      toast({
        title: 'Validation Error',
        description: 'Please fix the errors before submitting.',
        variant: 'destructive',
      });
      return;
    }

    setLoading(true);
    setCreateSuccess(false);

    try {
      const leadData = {
        name: formData.name.trim(),
        email: formData.email.trim() || null,
        phone: formData.phone.trim(),
        company: formData.company.trim() || null,
        status: formData.status || 'New',
        source: formData.source.trim() || null,
        interestLevel: formData.interestLevel || 'Warm',
        createdAt: Timestamp.now(),
        createdByUid: user.uid,
        createdByName: user.displayName || user.email,
        assignedOfficerUid: formData.assignedOfficer || null,
        companyId: user.companyId || null,
        notes: formData.notes.trim() || null,
      };

      await addDoc(collection(db, 'leads'), leadData);

      setCreateSuccess(true);
      toast({
        title: 'Lead Created',
        description: 'The new lead has been created successfully.',
        variant: 'default',
      });

      // Reset form to initial state
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
      setFormErrors({});
    } catch (error) {
      console.error('Failed to create lead:', error);
      toast({
        title: 'Submission Failed',
        description: 'Unable to create lead. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="p-6 max-w-2xl mx-auto shadow-md">
      <h1 className="text-2xl font-bold mb-6">Create New Lead</h1>

      {createSuccess && (
        <p className="mb-4 text-green-600 font-semibold">Lead created successfully!</p>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-6">
        {/* Name */}
        <div>
          <Label htmlFor="name">Full Name *</Label>
          <Input
            id="name"
            name="name"
            value={formData.name}
            onChange={handleInputChange}
            disabled={loading}
            className={formErrors.name ? 'border-red-500' : ''}
            autoComplete="name"
            required
          />
          {formErrors.name && (
            <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>
          )}
        </div>

        {/* Email */}
        <div>
          <Label htmlFor="email">Email</Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleInputChange}
            disabled={loading}
            className={formErrors.email ? 'border-red-500' : ''}
            autoComplete="email"
          />
          {formErrors.email && (
            <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>
          )}
        </div>

        {/* Phone */}
        <div>
          <Label htmlFor="phone">Phone Number *</Label>
          <Input
            id="phone"
            name="phone"
            type="tel"
            value={formData.phone}
            onChange={handleInputChange}
            disabled={loading}
            className={formErrors.phone ? 'border-red-500' : ''}
            autoComplete="tel"
            required
          />
          {formErrors.phone && (
            <p className="text-red-500 text-sm mt-1">{formErrors.phone}</p>
          )}
        </div>

        {/* Company */}
        <div>
          <Label htmlFor="company">Company</Label>
          <Input
            id="company"
            name="company"
            value={formData.company}
            onChange={handleInputChange}
            disabled={loading}
            autoComplete="organization"
          />
        </div>

        {/* Assigned Officer */}
        <div>
          <Label htmlFor="assignedOfficer">Assigned Officer</Label>
          <Select
            id="assignedOfficer"
            value={formData.assignedOfficer}
            onValueChange={(value) => handleSelectChange('assignedOfficer', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select an officer" />
            </SelectTrigger>
            <SelectContent>
              {officers.length ? (
                officers.map(({ uid, displayName, email }) => (
                  <SelectItem key={uid} value={uid}>
                    {displayName || email}
                  </SelectItem>
                ))
              ) : (
                <SelectItem value="" disabled>
                  No officers available
                </SelectItem>
              )}
            </SelectContent>
          </Select>
        </div>

        {/* Status */}
        <div>
          <Label htmlFor="status">Status</Label>
          <Select
            id="status"
            value={formData.status}
            onValueChange={(value) => handleSelectChange('status', value)}
            disabled={loading}
          >
            <SelectTrigger>
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
        </div>

        {/* Interest Level */}
        <div>
          <Label htmlFor="interestLevel">Interest Level</Label>
          <Select
            id="interestLevel"
            value={formData.interestLevel}
            onValueChange={(value) => handleSelectChange('interestLevel', value)}
            disabled={loading}
          >
            <SelectTrigger>
              <SelectValue placeholder="Select interest level" />
            </SelectTrigger>
            <SelectContent>
              {['Hot', 'Warm', 'Cold'].map((level) => (
                <SelectItem key={level} value={level}>
                  {level}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Source */}
        <div>
          <Label htmlFor="source">Lead Source</Label>
          <Input
            id="source"
            name="source"
            value={formData.source}
            onChange={handleInputChange}
            disabled={loading}
          />
        </div>

        {/* Notes */}
        <div>
          <Label htmlFor="notes">Notes</Label>
          <textarea
            id="notes"
            name="notes"
            rows={4}
            value={formData.notes}
            onChange={handleInputChange}
            disabled={loading}
            className="w-full rounded border border-gray-300 p-2 resize-y"
            placeholder="Additional notes or comments"
          />
        </div>

        {/* Submit */}
        <Button type="submit" disabled={loading}>
          {loading ? 'Creating...' : 'Create Lead'}
        </Button>
      </form>
    </Card>
  );
};

export default CreateLeadPage;
 