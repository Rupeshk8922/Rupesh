// src/services/leadsService.js
import { collection, query, where, getDocs, doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase/config'; // Assuming you have initialized Firebase in config.js

// Function to fetch leads for a specific company
/**
 * Fetches leads for a specific company from Firebase.
 * @param {string} companyId - The ID of the company.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of lead objects.
 */
export const fetchLeads = async (companyId) => {
  if (!companyId) {
    console.error("fetchLeads: companyId is required.");
    return [];
  }

  try {
    // Construct the query to the 'leads' subcollection within the specific company document
    const leadsCollectionRef = collection(db, 'data', companyId, 'leads'); // Corrected path if 'data' is the parent collection
    const q = query(leadsCollectionRef); // Add filtering if needed, e.g., where('status', '==', 'Open')

    const querySnapshot = await getDocs(q);

    const leads = querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    }));

    return leads;
  } catch (error) {
    console.error("Error fetching leads:", error);
    throw new Error("Failed to fetch leads.");
  }
};
// Function to assign a lead to a user

/**
 * Assigns a lead to a user in Firebase.
 * @param {string} leadId - The ID of the lead to assign.
 * @param {string} userId - The ID of the user to assign the lead to.
 * @param {string} companyId - The ID of the company the lead belongs to.
 * @returns {Promise<void>} - A promise that resolves when the update is complete.
 */
export const assignLead = async (leadId, userId, companyId) => {
  if (!leadId || !userId || !companyId) {
    console.error("assignLead: leadId, userId, and companyId are required.");
    throw new Error("Missing required arguments for assigning lead.");
  }

  try {
    // Get the reference to the specific lead document
    const leadDocRef = doc(db, 'data', companyId, 'leads', leadId); // Corrected path

    // Update the 'assignedTo' field
    await updateDoc(leadDocRef, {
      assignedTo: userId // Set to null or undefined to unassign
    });

    console.log(`Lead ${leadId} assigned to user ${userId}`);
  } catch (error) {
    console.error("Error assigning lead:", error);
    throw new Error("Failed to assign lead.");
  }
};