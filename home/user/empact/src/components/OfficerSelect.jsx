import React, { useState, useEffect } from 'react';
import { collection, getDocs, doc, getDoc, query, where } from 'firebase/firestore';
import { db } from '@/firebase/config';
import { useAuth } from '@/hooks/useAuth';

export function OfficerSelect({ onOfficerChange, currentOfficerId }) {
  const [officers, setOfficers] = useState([]);
  const [selectedOfficer, setSelectedOfficer] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { user } = useAuth();

  useEffect(() => {
    const fetchOfficers = async () => {
      if (!user) {
        setError('User information not available.');
        setLoading(false);
        return;
      }

      // Use local variable for companyId to avoid mutating user
      let companyId = user.companyId;

      try {
        if (!companyId) {
          const userDocRef = doc(db, 'users', user.uid);
          const userDocSnap = await getDoc(userDocRef);
          if (userDocSnap.exists()) {
            companyId = userDocSnap.data().companyId;
          } else {
            setError('User document not found.');
            setLoading(false);
            return;
          }
        }

        const officersCollectionRef = collection(db, 'users');
        const q = query(
          officersCollectionRef,
          where('companyId', '==', companyId),
          where('role', '==', 'officer')
        );
        const querySnapshot = await getDocs(q);
        const officersData = querySnapshot.docs.map(doc => ({
          id: doc.id,
          ...doc.data(),
        }));
        setOfficers(officersData);

        // Set initial selected officer if provided
        if (currentOfficerId) {
          const initialOfficer = officersData.find(officer => officer.id === currentOfficerId);
          if (initialOfficer) {
            setSelectedOfficer(initialOfficer.id);
            onOfficerChange(initialOfficer.id);
          }
        } else {
          // Optionally clear selection if no currentOfficerId
          setSelectedOfficer('');
          onOfficerChange('');
        }
      } catch (err) {
        console.error('Error fetching officers:', err);
        setError('Failed to load officers.');
      } finally {
        setLoading(false);
      }
    };

    fetchOfficers();
  }, [user, currentOfficerId, onOfficerChange]);

  const handleValueChange = (value) => {
    setSelectedOfficer(value);
    onOfficerChange(value);
  };

  if (loading) return <div>Loading officers...</div>;
  if (error) return <div className="text-red-600">Error: {error}</div>;

  return (
    <div className="grid gap-2">
      <label htmlFor="officer-select">Assigned Officer</label>
      <select
        id="officer-select"
        value={selectedOfficer}
        onChange={(e) => handleValueChange(e.target.value)}
      >
        <option value="">Select Officer</option>
        {officers.map((officer) => (
          <option key={officer.id} value={officer.id}>
            {officer.displayName || `${officer.firstName} ${officer.lastName}`}
          </option>
        ))}
      </select>
    </div>
  );
}
