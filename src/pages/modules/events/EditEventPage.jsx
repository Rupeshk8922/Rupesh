'use client';

import { useEditEvent } from '@/hooks/useEditEvent';
import OfficerSelect from '@/components/shared/OfficerSelect';
import MultiSelectVolunteers from '@/components/ui/MultiSelectVolunteers';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Spinner } from '@/components/ui/spinner';
import { Textarea } from '@/components/ui/textarea';
import Alert from '@/components/ui/alert';
import { useNavigate } from 'react-router-dom';

const EditEventPage = () => {
  const {
    formData,
    handleChange,
    handleSelectChange,
    handleSubmit,
    errors,
    loading,
    saveLoading,
    saveError,
    feedbackMessage,
    allVolunteers,
    hasAccess,
    initialFetchError,
  } = useEditEvent();

  const navigate = useNavigate();

  if (!hasAccess) {
    navigate('/access-denied');
    return null;
  }

  if (loading) {
    return (
      <div className="p-6">
        <Spinner /> Loading event data...
      </div>
    );
  }

  if (initialFetchError) {
    return <Alert variant="destructive" className="m-6">{initialFetchError}</Alert>;
  }

  return (
    <div className="p-6 max-w-2xl mx-auto">
      <h2 className="text-2xl font-semibold mb-4">Edit Event</h2>
      <form onSubmit={handleSubmit} className="space-y-4">
        <FormField
          label="Title"
          name="title"
          value={formData.title}
          onChange={handleChange}
          error={errors.titleError}
        />
        <div className="grid grid-cols-2 gap-4">
          <FormField
            label="Date"
            name="date"
            type="date"
            value={formData.date}
            onChange={handleChange}
            error={errors.dateError}
          />
          <FormField
            label="Time"
            name="time"
            type="time"
            value={formData.time}
            onChange={handleChange}
          />
        </div>
        <FormField
          label="Location"
          name="location"
          value={formData.location}
          onChange={handleChange}
          error={errors.locationError}
        />
        <FormField
          label="Event Type"
          name="eventType"
          value={formData.eventType}
          onChange={handleChange}
          error={errors.eventTypeError}
        />
        <FormField
          label="Status"
          name="status"
          value={formData.status}
          onChange={handleChange}
          error={errors.statusError}
        />
        <FormField
          label="Max Volunteers"
          name="maxVolunteers"
          value={formData.maxVolunteers}
          onChange={handleChange}
          error={errors.maxVolunteersError}
        />
        <div>
          <Label>Description</Label>
          <Textarea name="description" value={formData.description} onChange={handleChange} />
        </div>
        <div>
          <Label>Assigned Officer</Label>
          <OfficerSelect
            value={formData.assignedOfficer}
            onChange={(val) => handleSelectChange('assignedOfficer', val)}
          />
        </div>
        <div>
          <Label>Assigned Volunteers</Label>
          <MultiSelectVolunteers
            volunteers={allVolunteers}
            selectedVolunteers={formData.assignedVolunteers}
            onSelectedChange={(val) => handleSelectChange('assignedVolunteers', val)}
            disabled={saveLoading}
          />
        </div>
        {saveError && <Alert variant="destructive">{saveError}</Alert>}
        {feedbackMessage && <Alert variant="success">{feedbackMessage}</Alert>}
        <Button type="submit" disabled={saveLoading}>
          {saveLoading ? 'Saving...' : 'Save Changes'}
        </Button>
      </form>
    </div>
  );
};

const FormField = ({ label, name, value, onChange, error, type = 'text' }) => (
  <div>
    <Label htmlFor={name}>{label}</Label>
    <Input id={name} name={name} type={type} value={value} onChange={onChange} />
    {error && <p className="text-red-500 text-sm">{error}</p>}
  </div>
);

export default EditEventPage;
