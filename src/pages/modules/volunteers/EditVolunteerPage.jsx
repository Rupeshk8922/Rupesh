import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '@/firebase';
import { useAuth } from '@/contexts/authContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Spinner } from '@/components/ui/spinner';

const EditVolunteerPage = () => {
  const { volunteerId } = useParams();
  const navigate = useNavigate();
  const { user, userRole, companyId } = useAuth();

  const [loading, setLoading] = useState(true);
  const [initialFetchError, setInitialFetchError] = useState(null);
  const [saveError, setSaveError] = useState(null);
  const [feedbackMessage, setFeedbackMessage] = useState(null);
  const [saveLoading, setSaveLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  });

  useEffect(() => {
    if (!user || !companyId) return;

    const fetchVolunteer = async () => {
      setLoading(true);
      try {
        const volunteerRef = doc(db, 'data', companyId, 'volunteers', volunteerId);
        const volunteerSnap = await getDoc(volunteerRef);

        if (!volunteerSnap.exists()) {
          setInitialFetchError('Volunteer not found.');
          return;
        }

        const data = volunteerSnap.data();
        setFormData({
          name: data.name || '',
          email: data.email || '',
          phone: data.phone || '',
          notes: data.notes || '',
        });
      } catch (err) {
        console.error(err);
        setInitialFetchError('Failed to fetch volunteer.');
      } finally {
        setLoading(false);
      }
    };

    fetchVolunteer();
  }, [user, companyId, volunteerId]);

  const validateField = (name, value) => {
    switch (name) {
      case 'name':
        return value.trim() ? '' : 'Name is required.';
      case 'email':
        return value && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(value)
          ? 'Invalid email.'
          : '';
      case 'phone':
        return value && !/^[0-9+\-()\s]+$/.test(value) ? 'Invalid phone number.' : '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    Object.entries(formData).forEach(([key, value]) => {
      const error = validateField(key, value);
      if (error) newErrors[key + 'Error'] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name + 'Error']: validateField(name, value) }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaveError(null);
    setFeedbackMessage(null);

    if (!validateForm()) {
      setSaveError('Please fix the errors before submitting.');
      return;
    }

    setSaveLoading(true);
    try {
      const volunteerRef = doc(db, 'data', companyId, 'volunteers', volunteerId);
      await updateDoc(volunteerRef, formData);

      setFeedbackMessage({ type: 'success', text: 'Volunteer updated successfully!' });
      setTimeout(() => navigate(`/volunteers/${volunteerId}`), 2000);
    } catch (err) {
      console.error(err);
      setSaveError('Failed to update volunteer.');
    } finally {
      setSaveLoading(false);
    }
  };

  if (!['admin', 'Manager', 'Outreach Officer'].includes(userRole)) {
    return <div className="p-6 text-red-600">You do not have permission to edit volunteers.</div>;
  }

  if (loading) return <div className="p-6"><Spinner /> Loading volunteer data...</div>;
  if (initialFetchError) return <div className="p-6 text-red-600">Error: {initialFetchError}</div>;

  return (
    <div className="p-6 max-w-xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Edit Volunteer</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <Label>Name</Label>
          <Input name="name" value={formData.name} onChange={handleChange} />
          {errors.nameError && <p className="text-red-500 text-sm">{errors.nameError}</p>}
        </div>

        <div>
          <Label>Email</Label>
          <Input name="email" type="email" value={formData.email} onChange={handleChange} />
          {errors.emailError && <p className="text-red-500 text-sm">{errors.emailError}</p>}
        </div>

        <div>
          <Label>Phone</Label>
          <Input name="phone" value={formData.phone} onChange={handleChange} />
          {errors.phoneError && <p className="text-red-500 text-sm">{errors.phoneError}</p>}
        </div>

        <div>
          <Label>Notes</Label>
          <Textarea name="notes" value={formData.notes} onChange={handleChange} />
        </div>

        {saveError && <p className="text-red-500">{saveError}</p>}
        {feedbackMessage && <p className="text-green-600">{feedbackMessage.text}</p>}

        <Button type="submit" disabled={saveLoading}>
          {saveLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
};

export default EditVolunteerPage;
