import { collection, query, orderBy } from 'firebase/firestore';
import { useAuth } from '../contexts/authContext.jsx';
import { db } from '../firebase/config';
import { useCollectionData } from 'react-firebase-hooks/firestore';

export default function useEvents() {
  const { companyId } = useAuth();
  const eventsRef = collection(db, 'data', companyId, 'events');
  const q = query(eventsRef, orderBy('date', 'asc'));

 return useCollectionData(q, { idField: 'id' });
}