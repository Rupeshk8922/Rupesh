import { useState } from 'react';

const MultiSelectVolunteers = ({ volunteers, selectedVolunteers, onSelectedChange, disabled }) => {
  const [open, setOpen] = useState(false);
  // The following imports were unused and have been removed:
  // Popover, PopoverTrigger, PopoverContent, Button, Command, CommandInput, CommandEmpty, CommandGroup, CommandItem, Checkbox, Label

  const handleSelect = (volunteerId) => {
    const isSelected = selectedVolunteers.includes(volunteerId);
    let newSelectedVolunteers;

    if (isSelected) {
      newSelectedVolunteers = selectedVolunteers.filter((id) => id !== volunteerId);
    } else {
      newSelectedVolunteers = [...selectedVolunteers, volunteerId];
    }

    onSelectedChange(newSelectedVolunteers);
  };

  const displayValue = selectedVolunteers
    .map(id => volunteers.find(v => v.id === id)?.name)
    .filter(Boolean)
    .join(', ');

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-full justify-between"
          disabled={disabled}
        >
          {displayValue || 'Select volunteers...'}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command> {/* Adjusted Command component */}
          <CommandInput placeholder="Search volunteers..." />
          <CommandEmpty>No volunteer found.</CommandEmpty>
          <CommandGroup>
            {volunteers.map((volunteer) => (
              <CommandItem
                key={volunteer.id}
                value={volunteer.name} // Use name for searchable value
                onSelect={() => handleSelect(volunteer.id)}
              >
                <div className="flex items-center space-x-2">
                  <Checkbox
                    id={`volunteer-${volunteer.id}`}
                    checked={selectedVolunteers.includes(volunteer.id)}
                    onCheckedChange={() => handleSelect(volunteer.id)}
                  />
                  <label htmlFor={`volunteer-${volunteer.id}`} className="cursor-pointer">
                    {volunteer.name}
                  </label>
                </div>
              </CommandItem>
            ))}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MultiSelectVolunteers;