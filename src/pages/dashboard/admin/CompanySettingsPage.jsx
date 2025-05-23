import React, { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/authContext';
import { db } from '@/firebase/config'; // Adjust if needed
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';
import { Spinner } from '@/components/ui/spinner';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Navigate } from 'react-router-dom';

const CompanySettingsPage = () => {
  const { user, userRole, companyId, authLoading } = useAuth();
  const { toast } = useToast();

  const [formData, setFormData] = useState({
    companyName: '',
    description: '',
    logoUrl: '',
    timezone: '',
    subscriptionStatus: '',
  });

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [saveError, setSaveError] = useState(null);

  useEffect(() => {
    const fetchCompanySettings = async () => {
      if (!companyId) {
        if (!authLoading) {
          setError('Company ID not found.');
          setLoading(false);
        }
        return;
      }

      try {
        setLoading(true);
        setError(null);
        const companyDocRef = doc(db, 'companies', companyId);
        const docSnap = await getDoc(companyDocRef);

        if (docSnap.exists()) {
          const companyData = docSnap.data();
          setFormData({
            companyName: companyData.companyName || '',
            description: companyData.description || '',
            logoUrl: companyData.logoUrl || '',
            timezone: companyData.timezone || '',
            subscriptionStatus: companyData.subscriptionStatus || 'Unknown',
          });
        } else {
          setError('Company settings not found.');
        }
      } catch (err) {
        console.error('Error fetching company settings:', err);
        setError('Failed to load company settings.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading && companyId) {
      fetchCompanySettings();
    }
  }, [companyId, authLoading]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setSaveError(null); // Clear save error on input change
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!companyId) return;

    setSaving(true);
    setSaveError(null);

    try {
      const companyDocRef = doc(db, 'companies', companyId);
      await updateDoc(companyDocRef, {
        companyName: formData.companyName,
        description: formData.description,
        logoUrl: formData.logoUrl,
        timezone: formData.timezone,
        // subscriptionStatus is read-only
      });

      toast({
        title: 'Settings Updated',
        description: 'Company settings have been updated successfully.',
        variant: 'default',
      });
    } catch (err) {
      console.error('Error updating company settings:', err);
      setSaveError('Failed to save company settings. Please try again.');
      toast({
        title: 'Update Failed',
        description: 'Failed to save company settings. Please try again.',
        variant: 'destructive',
      });
    } finally {
      setSaving(false);
    }
  };

  // Role-based access control
  if (authLoading) {
    return <div className="p-4 text-center">Checking permissions...</div>;
  }

  if (!user || userRole !== 'admin') {
    return <Navigate to="/access-denied" />;
  }

  if (loading) {
    return (
      <div className="p-6 text-center">
        <Spinner /> Loading settings...
      </div>
    );
  }

  if (error) {
    return (
      <Alert variant="destructive" className="m-6">
        <AlertTitle>Error</AlertTitle>
        <AlertDescription>{error}</AlertDescription>
      </Alert>
    );
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">Company Settings</h1>

      {saveError && (
        <Alert variant="destructive" className="mb-4">
          <AlertTitle>Save Error</AlertTitle>
          <AlertDescription>{saveError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Company Name */}
        <div>
          <Label htmlFor="companyName">Company Name</Label>
          <Input
            id="companyName"
            name="companyName"
            value={formData.companyName}
            onChange={handleInputChange}
            disabled={saving}
          />
        </div>

        {/* Description */}
        <div>
          <Label htmlFor="description">Description</Label>
          <Textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            disabled={saving}
            rows={4}
          />
        </div>

        {/* Logo URL (Basic) */}
        <div>
          <Label htmlFor="logoUrl">Logo URL</Label>
          <Input
            id="logoUrl"
            name="logoUrl"
            type="url"
            value={formData.logoUrl}
            onChange={handleInputChange}
            disabled={saving}
            placeholder="Enter URL for company logo"
          />
        </div>

        {/* Timezone (Basic Input) */}
        <div>
          <Label htmlFor="timezone">Timezone</Label>
          <Input
            id="timezone"
            name="timezone"
            value={formData.timezone}
            onChange={handleInputChange}
            disabled={saving}
            placeholder="e.g., UTC, America/New_York"
          />
        </div>

        {/* Subscription Status (Read-only) */}
        <div>
          <Label htmlFor="subscriptionStatus">Subscription Status</Label>
          <Input
            id="subscriptionStatus"
            name="subscriptionStatus"
            value={formData.subscriptionStatus}
            disabled
            readOnly
            className="bg-gray-100 cursor-not-allowed"
          />
        </div>

        {/* Submit Button */}
        <Button type="submit" disabled={saving}>
          {saving ? (
            <>
              <Spinner size="sm" className="mr-2" /> Saving...
            </>
          ) : (
            'Save Settings'
          )}
        </Button>
      </form>
    </div>
  );
};

export default CompanySettingsPage;