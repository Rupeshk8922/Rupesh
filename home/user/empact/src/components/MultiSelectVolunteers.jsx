jsx
import { useState } from "react";
import { Label } from "@/components/ui/label";
import { useCollection } from "@/hooks/useCollection";

function MultiSelectVolunteers({ onSelectionChange, initialValue }) {
  const { documents: volunteers } = useCollection("volunteers");
  const [selected, setSelected] = useState(initialValue || []);

  const options = volunteers
    ? volunteers.map((volunteer) => ({
        label: `${volunteer.firstName} ${volunteer.lastName}`,
        value: volunteer.id,
      }))
    : [];

  // Update parent component when selection changes
  useState(() => {
    onSelectionChange(selected);
  }, [selected, onSelectionChange]);

  return (
    <div>
      <Label>Select Volunteers:</Label>
      <MultiSelect
        options={options}
        value={selected}
        onChange={setSelected}
        labelledBy="Select Volunteers"
      />
    </div>
  );
}

export default MultiSelectVolunteers;