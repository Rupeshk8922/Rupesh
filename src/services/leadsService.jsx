// src/services/leadsService.js

import {
  collection,
  query,
  getDocs,
  doc,
  updateDoc,
  where,
  addDoc,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../firebase/config';

/**
 * Fetches leads for a specific company, with optional filters.
 * @param {string} companyId - The ID of the company.
 * @param {Object} [filters={}] - Optional filters (status, assignedTo).
 * @param {string} [filters.status] - Filter leads by status.
 * @param {string} [filters.assignedTo] - Filter leads by assigned user.
 * @returns {Promise<Array<Object>>} - A promise that resolves to an array of lead objects.
 */
export const fetchLeads = async (companyId, filters = {}) => {
  if (!companyId) {
    console.error("fetchLeads: companyId is required.");
    return [];
  }

  try {
    const leadsCollectionRef = collection(db, 'data', companyId, 'leads');

    const constraints = [];

    if (filters.status) {
      constraints.push(where('status', '==', filters.status));
    }
    if (filters.assignedTo) {
      constraints.push(where('assignedTo', '==', filters.assignedTo));
    }

    const q = query(leadsCollectionRef, ...constraints);
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

/**
 * Assigns (or unassigns) a lead to a user.
 * @param {string} leadId - The ID of the lead to assign.
 * @param {string|null} userId - The ID of the user to assign the lead to. Pass null to unassign.
 * @param {string} companyId - The ID of the company the lead belongs to.
 * @param {string} [assignedBy] - (Optional) The ID of the user performing the assignment (for logging).
 * @returns {Promise<void>} - A promise that resolves when the update is complete.
 */
export const assignLead = async (leadId, userId, companyId, assignedBy) => {
  if (!leadId || !companyId) {
    console.error("assignLead: leadId and companyId are required.");
    throw new Error("Missing required arguments for assigning lead.");
  }

  try {
    const leadDocRef = doc(db, 'data', companyId, 'leads', leadId);

    await updateDoc(leadDocRef, {
      assignedTo: userId || null
    });

    console.log(`Lead ${leadId} assigned to ${userId || "none"}`);

    if (assignedBy) {
      await logLeadAssignment(companyId, leadId, userId, assignedBy);
    }
  } catch (error) {
    console.error("Error assigning lead:", error);
    throw new Error("Failed to assign lead.");
  }
};

/**
 * Logs a lead assignment action in a logs subcollection.
 * @param {string} companyId - The ID of the company.
 * @param {string} leadId - The ID of the lead.
 * @param {string|null} userId - The ID of the user assigned (or null if unassigned).
 * @param {string} assignedBy - The ID of the user who performed the assignment.
 * @returns {Promise<void>} - A promise that resolves when the log is written.
 */
export const logLeadAssignment = async (companyId, leadId, userId, assignedBy) => {
  try {
    const logRef = collection(db, 'data', companyId, 'leads', leadId, 'logs');

    await addDoc(logRef, {
      action: 'assign',
      assignedTo: userId || null,
      assignedBy,
      timestamp: serverTimestamp()
    });

    console.log(`Logged assignment of lead ${leadId} to ${userId || "none"} by ${assignedBy}`);
  } catch (error) {
    console.error("Error logging lead assignment:", error);
    // Do not throw — logging failure shouldn't block main action
  }
};
