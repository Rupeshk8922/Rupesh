import { doc, deleteDoc } from 'firebase/firestore';
import { db } from '../firebase';

export const deleteUserFromCompany = async (companyId, userId) => {
  const userDocRef = doc(db, 'companies', companyId, 'users', userId);
  await deleteDoc(userDocRef);
};