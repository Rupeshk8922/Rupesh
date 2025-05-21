
import useOfficers from '../hooks/useOfficers';

const OfficerSelect = ({ value, onChange, disabled }) => {
  const { officers, loading, error } = useOfficers();

  if (loading) {
    return <div>Loading officers...</div>;
  }

  if (error) {
    return <div className="text-red-500">Error loading officers: {error.message}</div>;
  }

  if (!officers || officers.length === 0) {
    return <div>No officers available.</div>;
  }

  return (
    <div>
      <Label htmlFor="assignedOfficer">Assigned Officer</Label> {}
      <Select onValueChange={onChange} value={value} disabled={disabled}>
        <SelectTrigger id="assignedOfficer">
          <SelectValue placeholder="Select an officer" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="">Select an officer</SelectItem>
          {officers.map((officer) => (
            <SelectItem key={officer.id} value={officer.id}>
              {officer.displayName}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
    </div>
  );
};

export default OfficerSelect;