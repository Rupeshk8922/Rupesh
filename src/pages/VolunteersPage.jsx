import { useNavigate } from 'react-router-dom';
import useVolunteers from '../hooks/useVolunteers';
import { useState, useEffect } from 'react';
export default function VolunteersPage() {
 const { volunteers, loading, error, fetchVolunteers } = useVolunteers();
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate();
  const [filteredVolunteers, setFilteredVolunteers] = useState(volunteers);

  // Client-side filter
  useEffect(() => {
    const filtered = volunteers.filter(vol =>
      vol.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVolunteers(filtered);
  }, [searchTerm, volunteers]); // Update filtered list when volunteers or searchTerm changes

  const handleVolunteerAdded = () => {
    setShowDialog(false);
    // Re-fetch volunteers after a new one is added using the hook's fetch function
    fetchVolunteers().catch((err) => {
      console.error('Error fetching volunteers after add:', err);
    });
  };

  return (
    // Mobile Responsiveness: Use padding for overall spacing on small screens.
    // p-6 provides padding on all sides. Consider adding max-w and mx-auto
    // if you want to center and limit the width of the content on larger screens.
    <div className="p-6">
      {/* Mobile Responsiveness: Ensure heading text scales or wraps appropriately. */}
      <h1 className="text-2xl font-bold mb-4">Volunteers</h1>

      {loading && <div>Loading volunteers...</div>}
      {error && <div>Error fetching volunteers: {error.message}</div>}

      {!loading && !error && (
        <>

      <div className="flex justify-between items-center mb-4">
        {/* Mobile Responsiveness: Consider making this container flex-col on small screens (flex-col sm:flex-row)
            so the search input and button stack vertically. Adjust spacing with gap-y-2 or space-y-2. */}
        <Input
          placeholder="Search volunteers..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="max-w-sm w-full sm:w-auto" // Mobile Responsiveness: Use w-full on small screens
        />
        <Dialog open={showDialog} onOpenChange={setShowDialog}> {/* Mobile Responsiveness: The dialog overlay handles fullscreen on mobile reasonably well. */}
          <DialogTrigger asChild>
            <Button>Add Volunteer</Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-[600px]">
            <VolunteerForm onClose={handleVolunteerAdded} /> {/* Use the handler */}
          </DialogContent>
        </Dialog>
      </div>

      {/* Mobile Responsiveness: overflow-auto is crucial for handling horizontal table overflow on small screens. */}
      <div className="overflow-auto rounded border">
        {/* Mobile Responsiveness: w-full ensures the table attempts to take full width, but overflow-auto manages if content exceeds. */}
        <table className="w-full text-left border-collapse">
          <thead className="bg-gray-100">
            {/* Mobile Responsiveness: Consider which columns are essential on small screens.
                You might hide less important columns using responsive utility classes (e.g., hidden md:table-cell). */}
            <tr className="text-xs sm:text-base"> {/* Adjust text size for mobile readability */}
              <th className="p-3 border-b">Name</th>
              <th className="p-3 border-b">Email</th>
              <th className="p-3 border-b">Phone</th>
              <th className="p-3 border-b">Area</th>
              <th className="p-3 border-b">Cause</th>
              <th className="p-3 border-b">Availability</th>
              <th className="p-3 border-b">Total Hours</th>
              <th className="p-3 border-b">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredVolunteers.map((volunteer) => (
              // Mobile Responsiveness: Ensure sufficient padding in cells for touch targets.
              <tr key={volunteer.id} className="hover:bg-gray-50">
                <td className="p-3 border-b">{volunteer.name}</td>
                {/* Mobile Responsiveness: These columns might be candidates for hiding on very small screens. */}
                <td className="p-3 border-b">{volunteer.email}</td>
                <td className="p-3 border-b">{volunteer.phone}</td>
                <td className="p-3 border-b">{volunteer.area}</td>
                <td className="p-3 border-b">{volunteer.cause}</td>
                <td className="p-3 border-b">{volunteer.availability}</td>
                <td className="p-3 border-b">{volunteer.totalHours || 0}</td>
                {/* Mobile Responsiveness: Actions column might need layout adjustments or a dropdown for multiple buttons on mobile.
                    space-x-2 provides horizontal space between buttons on wider screens. On small screens, they might wrap or need different handling. */}
                <td className="p-3 border-b space-x-2">
                  <Button
                    variant="outline"
                    // Mobile Responsiveness: Ensure button has adequate touch area.
                    // Consider if buttons should stack or be in a menu for very small screens.
                    onClick={() => navigate(`/track-hours/${volunteer.id}`)}
                  >
                    Track Hours
                  </Button>
                  {/* Add Edit/Delete actions here if needed */}
                </td>
              </tr>
            ))}
            {filteredVolunteers.length === 0 && (
              <tr>
                <td colSpan="8" className="p-4 text-center text-gray-500">
                  No volunteers found.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
        </>
      )}
    </div>
  );
}
