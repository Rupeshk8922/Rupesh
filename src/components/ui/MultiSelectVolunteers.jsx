import React from 'react';
import { useState } from "react";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "./popover.tsx";
import {
  Command,
  CommandInput,
  CommandEmpty,
  CommandGroup,
  CommandItem,
} from "./command.tsx";
import { Button } from "./button.tsx";
import { Checkbox } from "./checkbox.tsx";

const MultiSelectVolunteers = ({
  volunteers = [],
  selectedVolunteers = [], // Expecting an array of volunteer IDs
  onSelectedChange,
  disabled = false,
}) => {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");

  // Toggle selection of a volunteer by id
  const handleToggleSelect = (volunteerId) => {
    const isSelected = selectedVolunteers.includes(volunteerId);
    const updated = isSelected
      ? selectedVolunteers.filter((id) => id !== volunteerId)
      : [...selectedVolunteers, volunteerId];
    onSelectedChange(updated);
  };

  // Filter volunteers based on search input (case-insensitive)
  const filteredVolunteers = volunteers.filter((v) =>
    v.name.toLowerCase().includes(search.toLowerCase())
  );

  // Display comma-separated selected volunteer names or placeholder
  const displayValue = selectedVolunteers
    .map((id) => volunteers.find((v) => v.id === id)?.name)
    .filter(Boolean)
    .join(", ");

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
          {displayValue || "Select volunteers..."}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[var(--radix-popover-trigger-width)] p-0">
        <Command>
          <CommandInput
            placeholder="Search volunteers..."
            value={search}
            onValueChange={setSearch}
            autoFocus
          />
          <CommandEmpty>No volunteer found.</CommandEmpty>
          <CommandGroup>
            {filteredVolunteers.map((volunteer) => {
              const isChecked = selectedVolunteers.includes(volunteer.id);
              return (
                <CommandItem
                  key={volunteer.id}
                  value={volunteer.name}
                  onSelect={() => handleToggleSelect(volunteer.id)}
                >
                  <div className="flex items-center space-x-2">
                    <Checkbox
                      id={`volunteer-${volunteer.id}`}
                      checked={isChecked}
                      onCheckedChange={() => handleToggleSelect(volunteer.id)}
                    />
                    <label
                      htmlFor={`volunteer-${volunteer.id}`}
                      className="cursor-pointer select-none"
                    >
                      {volunteer.name}
                    </label>
                  </div>
                </CommandItem>
              );
            })}
          </CommandGroup>
        </Command>
      </PopoverContent>
    </Popover>
  );
};

export default MultiSelectVolunteers;