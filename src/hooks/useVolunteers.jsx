import { collection, query, orderBy } from 'firebase/firestore'; // Or orderBy('createdAt', 'desc')
import { useAuth } from '../contexts/authContext.jsx';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db } from '../firebase/config'; // Adjust the path as needed

export default function useVolunteers() {
  const { companyId } = useAuth();
  const volunteersRef = collection(db, 'data', companyId, 'volunteers');
  const q = query(volunteersRef, orderBy('name', 'asc')); // Ordering by name alphabetically

  return useCollectionData(q, { idField: 'id' });
}