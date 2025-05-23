import React, { useState, useEffect } from 'react';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import { db } from '@/firebase/config'; // Adjust path as needed
import { useAuth } from '@/hooks/useAuth'; // Adjust path as needed
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { debounce } from 'lodash'; // Assuming lodash is installed

const VolunteersListPage = () => {
  const { user, userRole, companyId, authLoading } = useAuth();
  const navigate = useNavigate();

  const [volunteers, setVolunteers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterRole, setFilterRole] = useState('');
  const [debouncedSearchTerm, setDebouncedSearchTerm] = useState('');

  const allowedRoles = ['admin', 'officer'];

  // Debounce search term
  useEffect(() => {
    const handler = debounce((value) => {
      setDebouncedSearchTerm(value);
    }, 500); // 500ms delay

    handler(searchTerm);

    return () => {
      handler.cancel();
    };
  }, [searchTerm]);

  useEffect(() => {
    const fetchVolunteers = async () => {
      if (!companyId) {
        // Wait for companyId if auth is still loading, or show error if not found after loading
        if (!authLoading) {
          setError('Company information is not available.');
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      setError(null);
      try {
        let volunteersQuery = query(
          collection(db, 'data', companyId, 'volunteers')
        );

        if (debouncedSearchTerm) {
          // Note: Firestore has limited text search capabilities.
          // For more robust search, consider a dedicated search service (e.g., Algolia, ElasticSearch)
          // This basic implementation assumes you might filter client-side or have specific fields indexed.
          // For now, we'll fetch all and filter client-side if needed, or rely on startsWith queries if possible.
          // A server-side approach would require specific indexing and query structures.
          // For this example, we'll do a basic client-side filter after fetching.
        }

        if (filterRole) {
          volunteersQuery = query(volunteersQuery, where('role', '==', filterRole));
        }

        const querySnapshot = await getDocs(volunteersQuery);
        let volunteersList = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));

        // Client-side filtering for search term (basic, case-insensitive)
        if (debouncedSearchTerm) {
          const lowerCaseSearchTerm = debouncedSearchTerm.toLowerCase();
          volunteersList = volunteersList.filter(volunteer =>
            volunteer.name?.toLowerCase().includes(lowerCaseSearchTerm) ||
            volunteer.email?.toLowerCase().includes(lowerCaseSearchTerm) ||
            volunteer.phone?.toLowerCase().includes(lowerCaseSearchTerm)
          );
        }


        setVolunteers(volunteersList);
      } catch (err) {
        console.error('Error fetching volunteers:', err);
        setError('Failed to load volunteers.');
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      fetchVolunteers();
    }
  }, [companyId, authLoading, debouncedSearchTerm, filterRole]); // Rerun when companyId, auth status, or filters change

  // Role-based access check
  if (authLoading) {
    return <div className="p-4"><Skeleton className="h-8 w-48 mb-4" /><Skeleton className="h-[300px] w-full" /></div>;
  }

  if (!user || !allowedRoles.includes(userRole?.toLowerCase())) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTitle>Access Denied</AlertTitle>
          <AlertDescription>
            You do not have permission to view this page.
          </AlertDescription>
        </Alert>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4">
        <Alert variant="destructive">
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      </div>
    );
  }

  return (
    <div className="p-4">
      <h1 className="text-2xl font-bold mb-4">Volunteers</h1>

      <div className="flex flex-col sm:flex-row gap-4 mb-4">
        <div className="w-full sm:w-auto">
          <Label htmlFor="search">Search</Label>
          <Input
            id="search"
            type="text"
            placeholder="Search volunteers..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full"
          />
        </div>
        <div className="w-full sm:w-auto">
          <Label htmlFor="role-filter">Filter by Role</Label>
          <Select value={filterRole} onValueChange={setFilterRole}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="All Roles" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="">All Roles</SelectItem>
              {/* Add relevant volunteer roles here */}
              <SelectItem value="volunteer">Volunteer</SelectItem>
              <SelectItem value="coordinator">Coordinator</SelectItem>
              {/* Add other roles as needed */}
            </SelectContent>
          </Select>
        </div>
        {/* Optional: Add button to create new volunteer */}
         {allowedRoles.includes(userRole?.toLowerCase()) && (
           <div className="w-full sm:w-auto self-end">
             <button
               onClick={() => navigate('/dashboard/volunteers/create')}
               className="w-full sm:w-auto px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
             >
               Add New Volunteer
             </button>
           </div>
         )}
      </div>


      {loading ? (
         <Skeleton className="h-[300px] w-full" />
      ) : volunteers.length === 0 ? (
        <p className="text-gray-600">No volunteers found.</p>
      ) : (
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Name</TableHead>
                <TableHead>Email</TableHead>
                <TableHead>Assigned Events</TableHead> {/* Placeholder */}
                <TableHead>Role</TableHead>
                 <TableHead>Actions</TableHead> {/* Added Actions column */}
              </TableRow>
            </TableHeader>
            <TableBody>
              {volunteers.map((volunteer) => (
                <TableRow key={volunteer.id}>
                  <TableCell className="font-medium">{volunteer.name || 'N/A'}</TableCell>
                  <TableCell>{volunteer.email || 'N/A'}</TableCell>
                   {/* Placeholder: Implement logic to count assigned events */}
                  <TableCell>0</TableCell>
                  <TableCell className="capitalize">{volunteer.role || 'N/A'}</TableCell>
                  <TableCell>
                     <button
                        onClick={() => navigate(`/dashboard/volunteers/${volunteer.id}`)}
                        className="text-blue-600 hover:underline mr-2"
                     >
                        View
                      </button>
                     {allowedRoles.includes(userRole?.toLowerCase()) && (
                       <button
                         onClick={() => navigate(`/dashboard/volunteers/edit/${volunteer.id}`)}
                         className="text-yellow-600 hover:underline"
                       >
                         Edit
                       </button>
                     )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  );
};

export default VolunteersListPage;