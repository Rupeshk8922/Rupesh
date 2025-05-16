import { collection, query, orderBy } from 'firebase/firestore'; // Or orderBy('createdAt', 'desc')
import { useauthContext } from '../contexts/authContext';
import { useCollectionData } from 'react-firebase-hooks/firestore';
import { db } from '../firebase/config'; // Adjust the path as needed

export default function useVolunteers() {
  const { companyId } = useauthContext();
  const volunteersRef = collection(db, 'data', companyId, 'volunteers');
  const q = query(volunteersRef, orderBy('name', 'asc')); // Ordering by name alphabetically

  return useCollectionData(q, { idField: 'id' });
}