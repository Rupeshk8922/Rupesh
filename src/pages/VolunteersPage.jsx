jsx
import React, { useEffect, useState } from 'react';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../../firebase/config'; // Corrected path to firebase config
import { useNavigate } from 'react-router-dom';
import VolunteerForm from '../../components/VolunteerForm';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogTrigger } from '@/components/ui/dialog';

export default function VolunteersPage() {
  const [volunteers, setVolunteers] = useState([]);
  const [filteredVolunteers, setFilteredVolunteers] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [showDialog, setShowDialog] = useState(false);
  const navigate = useNavigate(); 

  // Fetch volunteers on load
  useEffect(() => {
    const fetchVolunteers = async () => {
      try {
        const snapshot = await getDocs(collection(db, 'volunteers'));
        const data = snapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setVolunteers(data);
        setFilteredVolunteers(data);
      } catch (error) {
        console.error('Error fetching volunteers:', error);
      }
    };
    fetchVolunteers();
  }, []);

  // Client-side filter
  useEffect(() => {
    const filtered = volunteers.filter(vol =>
      vol.name.toLowerCase().includes(searchTerm.toLowerCase())
    );
    setFilteredVolunteers(filtered);
  }, [searchTerm, volunteers]);

  const handleVolunteerAdded = async () => {
    setShowDialog(false);
    // Re-fetch volunteers after a new one is added
    try {
      const snapshot = await getDocs(collection(db, 'volunteers'));
      const volunteersList = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
      }));
      setVolunteers(volunteersList);
      setFilteredVolunteers(volunteersList); // Update filtered list as well
    } catch (err) {
      console.error('Error fetching volunteers after add:', err);
      // Optionally, you could add state to show an error message to the user here
    }
  };

  return (
    // Mobile Responsiveness: Use padding for overall spacing on small screens.
    // p-6 provides padding on all sides. Consider adding max-w and mx-auto
    // if you want to center and limit the width of the content on larger screens.
    <div className="p-6">
      {/* Mobile Responsiveness: Ensure heading text scales or wraps appropriately. */}
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
            <VolunteerForm onClose={() => setShowDialog(false)} />
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
    </div>
  );
}
